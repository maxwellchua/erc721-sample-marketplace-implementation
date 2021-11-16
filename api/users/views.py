from datetime import datetime

from django.db.models.query_utils import Q
from django.http import Http404
from items.models import Item, ItemSellType, Token
from items.serializers import ItemMintSerializer, ItemSerializer, TokenSerializer
from rest_framework import (
    generics,
    mixins,
    parsers,
    permissions,
    status,
    views,
    viewsets,
)
from rest_framework.decorators import action, permission_classes
from rest_framework.response import Response
from utils.permissions import IsAuthenticated

from .filters import UserFilter
from .models import User
from .serializers import (
    SubscriberSerializer,
    UserCreateSerializer,
    UserProfilePicSerializer,
    UserSelfSerializer,
    UserSerializer,
)


class UserViewSet(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    viewsets.ReadOnlyModelViewSet,
):
    permission_classes = (permissions.AllowAny,)
    queryset = User.objects.all()
    filterset_class = UserFilter
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        headers = self.get_success_headers(serializer.data)
        returnData = {"token": user.auth_token.key}
        returnData.update(serializer.data)
        return Response(returnData, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=["get", "patch"], url_path="me", permission_classes=[IsAuthenticated])
    def me(self, request, *args, **kwargs):
        if request.method == "GET":
            return self.me_retrieve(request)
        elif request.method == "PATCH":
            return self.me_partial_update(request)

    def me_retrieve(self, request, *args, **kwargs):
        user = request.user
        serializer = UserSelfSerializer(user, context=self.get_serializer_context())
        return Response(serializer.data)

    def me_partial_update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = request.user
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        data = serializer.data
        if getattr(instance, "_prefetched_objects_cache", None):
            instance._prefetched_objects_cache = {}

        # if data["profile_image_thumbnail"] == None:
        #     data["profile_image_thumbnail"] = ""
        # else:
        #     try:
        #         data["profile_image_thumbnail"] = data["profile_image_thumbnail"].url
        #     except TypeError:
        #         data["profile_image_thumbnail"] = ""
        return Response(data)

    @action(detail=True, methods=["put"], parser_classes=[parsers.MultiPartParser])
    def profilepic(self, request, pk=None, *args, **kwargs):
        obj = self.get_object()
        serializer = UserProfilePicSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)


class UserRetrieveMixin:
    def get_user(self):
        pk = self.kwargs["user_pk"]
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            raise Http404


class UserTokenListViewSet(UserRetrieveMixin, viewsets.GenericViewSet):
    permission_classes = (permissions.AllowAny,)
    queryset = Token.objects.with_supply().select_related("collectible", "auction", "owner")
    serializer_class = TokenSerializer

    def get_queryset(self):
        return self.queryset.distinct("collectible", "owner", "on_sale")

    @action(detail=False)
    def owned(self, request, pk=None, *args, **kwargs):
        user = self.get_user()
        qs = self.get_queryset().filter(owner=user)

        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, url_path="on-sale")
    def on_sale(self, request, *args, **kwargs):
        user = self.get_user()
        now = datetime.now()
        qs = self.get_queryset().filter(
            Q(owner=user),
            Q(on_sale=True),
            (
                ~Q(sell_type=ItemSellType.AUCTION.value)
                | (Q(auction__start_date__lte=now) & Q(auction__end_date__gt=now))
            ),
        )

        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def created(self, request, *args, **kwargs):
        user = self.get_user()
        qs = self.get_queryset().filter(collectible__collaborators__user=user)

        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def likes(self, request, *args, **kwargs):
        user = self.get_user()
        qs = self.get_queryset().filter(collectible__likes__id=user.id)

        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class UserSelfUpdateTokenView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Token.objects.with_supply().select_related("collectible", "auction", "owner")
    serializer_class = TokenSerializer

    def get_queryset(self):
        user = self.request.user
        return self.queryset.filter(owner=user)


class UserItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ItemSerializer
    queryset = Item.objects.all()

    def get_queryset(self):
        user = self.request.user
        return self.queryset.filter(creator=user)

    @action(detail=True, methods=["put"], parser_classes=[parsers.MultiPartParser])
    def file(self, request, pk=None, *args, **kwargs):
        obj = self.get_object()
        serializer = self.get_serializer(obj, data=request.data, partial=True, context=self.get_serializer_context())
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def mint_tokens(self, request, *args, **kwargs):
        instance = self.get_object()

        serializer = ItemMintSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.mint_tokens(instance, serializer.validated_data)

        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SubscriberView(views.APIView):
    def post(self, request):
        serializer = SubscriberSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
