from decimal import Decimal, InvalidOperation

from django.db.models.aggregates import Count, Max
from django.db.models.functions.comparison import Coalesce
from django.db.models.query_utils import Q
from django.utils import timezone as dj_timezone
from rest_framework import generics, mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from users.models import User
from users.serializers import UserSerializer
from utils.permissions import IsAuthenticated

from .filters import TokenFilter
from .models import Category, Item, ItemSellType, Token
from .serializers import (
    BidSerializer,
    CategorySerializer,
    ItemSerializer,
    TokenDetailsSerializer,
    TokenSerializer,
)


class CategoryList(generics.ListAPIView):
    permission_classes = (permissions.AllowAny,)
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ItemViewset(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        query = request.GET.get("filter", "")
        is_featured = request.GET.get("is_featured", False)
        is_topseller = request.GET.get("is_topseller", False)
        if query != "":
            filter_ids = query.split(",")
            queryset = queryset.filter(category__in=filter_ids)

        if is_featured:
            queryset = queryset.filter(is_featured=True)
        if is_topseller:
            queryset = queryset.filter(is_topseller=True)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ItemLikes(generics.ListAPIView):
    permission_classes = (permissions.AllowAny,)
    queryset = User.objects.none()
    serializer_class = UserSerializer

    def get_queryset(self):
        pk = self.kwargs["pk"]
        item = Item.objects.get(id=pk)
        return item.likes.all()


class LikeItemToggle(APIView):
    def get(self, request, pk):
        user = request.user
        if request.user.is_authenticated:
            item = Item.objects.get(id=pk)
            try:
                item.likes.get(id=user.id)
                return Response({"liked": True})
            except:
                return Response({"liked": False})
        return Response({"liked": False})

    def post(self, request, pk):
        user = request.user
        if request.user.is_authenticated:
            item = Item.objects.get(id=pk)
            try:
                item.likes.get(id=user.id)
                item.likes.remove(user)
                return Response({"liked": False})
            except User.DoesNotExist:
                item.likes.add(user)
                return Response({"liked": True})
        return Response({"liked": False})


class TokenViewSet(mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = (permissions.AllowAny,)
    queryset = Token.objects.with_supply().select_related("collectible", "auction", "owner")
    filterset_class = TokenFilter
    serializer_class = TokenSerializer

    def list(self, request, *args, **kwargs):
        token_ids = self.get_queryset().distinct("collectible", "owner", "on_sale").values_list("id", flat=True)
        qs = self.get_queryset().filter(id__in=token_ids)

        now = dj_timezone.now()
        qs = qs.filter(
            Q(on_sale=True),
            (
                ~Q(sell_type=ItemSellType.AUCTION.value)
                | (Q(auction__start_date__lte=now) & Q(auction__end_date__gt=now))
            ),
        )
        qs = qs.annotate(
            current_price=Coalesce(Max("auction__bid_set__bid_value"), "auction__starting_bidding_price", "price"),
            likes=Count("collectible__likes"),
        )
        queryset = self.filter_queryset(qs)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="place-bid", permission_classes=[IsAuthenticated])
    def place_bid(self, request, *args, **kwargs):
        instance = self.get_object()

        serializer = BidSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()

        token_serializer = self.get_serializer(instance)
        return Response(token_serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="purchase", permission_classes=[IsAuthenticated])
    def purchase(self, request, *args, **kwargs):
        user = request.user
        instance = self.get_object()

        if not instance.on_sale:
            return Response(data={"token": ["Token is not on sale"]}, status=status.HTTP_400_BAD_REQUEST)

        elif instance.owner.id == user.id:
            return Response(data={"token": ["Token is already owned by user"]}, status=status.HTTP_400_BAD_REQUEST)

        elif instance.sell_type != ItemSellType.INSTANT_BUY.value:
            return Response(data={"token": ["Token is not instant buy"]}, status=status.HTTP_400_BAD_REQUEST)

        # TODO: Create serializer for validation?
        if "price" not in request.data.keys():
            return Response(data={"price": ["Price is required"]}, status=status.HTTP_400_BAD_REQUEST)

        try:
            price_data = Decimal(request.data["price"])
        except InvalidOperation:
            return Response(
                data={"price": ["Invalid value. Please enter a valid number"]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if instance.price != price_data:
            return Response(data={"price": [f"Price must equal {instance.price}"]}, status=status.HTTP_400_BAD_REQUEST)

        collectible = instance.collectible
        previous_owner = instance.owner
        instance.on_sale = False
        instance.is_sold = True
        instance.owner = user
        instance.save()

        serializer = self.get_serializer(instance)
        response = {"old_token": serializer.data}
        try:
            new_instance = (
                self.get_queryset()
                .distinct("collectible", "owner")
                .get(on_sale=True, collectible=collectible, owner=previous_owner)
            )
        except Token.DoesNotExist:
            pass
        else:
            new_serializer = self.get_serializer(new_instance)
            response.update({"new_token": new_serializer.data})
        return Response(response, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="finalize-auction", permission_classes=[IsAuthenticated])
    def finalize_auction(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance.auction:
            return Response(data={"token": ["This token does not have an auction"]}, status=status.HTTP_400_BAD_REQUEST)
        elif not instance.on_sale:
            return Response(data={"token": ["Token is not on sale"]}, status=status.HTTP_400_BAD_REQUEST)
        elif instance.auction.end_date >= dj_timezone.now():
            return Response(data={"Auction": ["Auction has not ended yet"]}, status=status.HTTP_400_BAD_REQUEST)

        if instance.auction.highest_bidder_id:
            highest_bidder = User.objects.filter(id=instance.auction.highest_bidder_id)[0]
            instance.owner = highest_bidder
        instance.on_sale = False
        instance.is_sold = True
        instance.auction = None
        instance.sell_type = ItemSellType.NONE.value
        instance.price = 0
        instance.save()

        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TokenDetailsView(APIView):
    def get(self, request, *args, **kwargs):
        item_id = kwargs["item_id"]
        token_number = kwargs["token_number"]
        queryset = Token.objects.filter(token_number=token_number, collectible__item_id=item_id)
        if len(queryset) != 1:
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        token = queryset[0]
        category_name = None
        if token.collectible.category:
            category_name = token.collectible.category.name

        data = {
            "token_number": token.token_number,
            "name": token.collectible.title,
            "description": token.collectible.description,
            "category": category_name,
            "file1": token.collectible.file1 or None,
            "files": token.collectible.files.values_list("file", flat=True),
            "creator": token.collectible.creator.display_name,
            "owner": token.owner.display_name,
            "is_360_video": token.collectible.is_360_video,
        }
        serializer = TokenDetailsSerializer(context={"request": request}, data=data)
        if serializer.is_valid():
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
