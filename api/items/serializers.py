from collections import OrderedDict
from decimal import Decimal

from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from rest_framework.fields import ReadOnlyField

from . import models


def is_auction_required(serializer):
    request = serializer.context.get("request", None)
    if request and request.method == "GET":
        return True
    if not getattr(serializer, "initial_data", None):
        return True
    sell_type = serializer.initial_data.get("sell_type", 0)
    return int(sell_type) == models.ItemSellType.AUCTION.value


def validate_sell_type_with_auction(attrs):
    attrs_sell_type = int(attrs.get("sell_type", models.ItemSellType.NONE.value))
    if attrs_sell_type != models.ItemSellType.AUCTION.value and "auction" in attrs.keys():
        raise serializers.ValidationError(
            {"auction": [f"auction is used with sell_type {models.ItemSellType.AUCTION.value}"]}
        )


def validate_auction_price_with_token(attrs):
    attrs_sell_type = int(attrs.get("sell_type", models.ItemSellType.NONE.value))
    if (
        attrs_sell_type == models.ItemSellType.AUCTION.value
        and attrs["auction"]["starting_bidding_price"] != attrs["price"]
    ):
        raise serializers.ValidationError({"auction": ["starting_bidding_price must be equal to price"]})


def validate_token_on_sale(attrs: OrderedDict):
    if attrs["on_sale"] == False:
        if "auction" in attrs.keys():
            raise serializers.ValidationError({"auction": ["on_sale must equal true to update token auction"]})
        if "sell_type" in attrs.keys():
            raise serializers.ValidationError({"sell_type": ["on_sale must equal true to update token sell_type"]})


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Category
        fields = ("id", "name")


class AuctionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Auction
        read_only_fields = ["id", "current_bidding_price", "highest_bidder_id"]
        fields = read_only_fields + [
            "start_date",
            "end_date",
            "starting_bidding_price",
        ]
        extra_kwargs = {"current_bidding_price": {"required": False}}

    def validate(self, attrs):
        if attrs["start_date"] > attrs["end_date"]:
            raise serializers.ValidationError({"end_date": ["end_date must be after start_date"]})
        return attrs


class ItemFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.ItemFile
        read_only_fields = ["id", "item"]
        fields = read_only_fields + ["file"]

    def to_representation(self, value):
        return value.file.name


class ItemCollaborators(serializers.ModelSerializer):
    class Meta:
        model = models.ItemCollaborator
        read_only_fields = ["id"]
        fields = read_only_fields + ["item", "share_percentage", "user", "wallet_token"]


class TokenCollectibleSerializer(serializers.ModelSerializer):
    files = ItemFileSerializer(many=True)
    collaborators = ItemCollaborators(many=True)

    class Meta:
        model = models.Item
        fields = (
            "id",
            "contract_address",
            "file1",
            "files",
            "cover_img",
            "token_amt",
            "token_sold",
            "title",
            "description",
            "item_id",
            "creator",
            "creator_name",
            "royalties",
            "category",
            "is_360_video",
            "collaborators",
        )


class BidSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Bid
        fields = (
            "id",
            "bid_value",
            "auction",
        )

    def create(self, validated_data):
        user = self.context["request"].user
        return models.Bid.objects.create(bidder=user, **validated_data)

    def validate(self, attrs: OrderedDict):
        now = timezone.now()
        user_id = self.context["request"].user.id
        auction = attrs.get("auction")
        bid_value = attrs.get("bid_value")
        highest_bid = auction.current_bidding_price
        highest_bidder_id = auction.highest_bidder_id
        starting_bidding_price = auction.starting_bidding_price

        if not hasattr(auction, "token"):
            raise serializers.ValidationError({"auction": ["auction does not have a token"]})

        token_owner_id = auction.token.owner_id

        if auction.start_date > now:
            raise serializers.ValidationError({"auction": [f"bid must be created after {auction.start_date}"]})

        if auction.end_date < now:
            raise serializers.ValidationError({"auction": [f"auction has ended at {auction.end_date}"]})

        if highest_bidder_id:
            if highest_bid >= bid_value:
                raise serializers.ValidationError(
                    {"bid_value": ["Your bid is lower than the highest bid." + " Please enter a higher amount"]}
                )
        elif starting_bidding_price > bid_value:
            raise serializers.ValidationError(
                {"bid_value": ["Your bid is lower or not equal to the starting bid." + " Please enter a higher amount"]}
            )

        if user_id == token_owner_id:
            raise serializers.ValidationError({"auction": ["The user cannot place bid on their own token"]})

        return attrs


class TokenSerializer(serializers.ModelSerializer):
    auction = AuctionSerializer()
    collectible = TokenCollectibleSerializer(read_only=True)
    supply = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = models.Token
        read_only_fields = ["id", "collectible", "mint_id", "owner", "owner_name", "supply"]
        fields = read_only_fields + [
            "auction",
            "token_number",
            "on_sale",
            "price",
            "sell_type",
        ]

    def __init__(self, *args, **kwargs):
        super(TokenSerializer, self).__init__(*args, **kwargs)
        self.fields["auction"].required = is_auction_required(self)

    def get_supply(self, obj):
        if hasattr(obj, "supply"):
            return obj.supply
        return 0

    def validate(self, attrs: OrderedDict):
        validate_auction_price_with_token(attrs)
        validate_sell_type_with_auction(attrs)
        # validate_token_on_sale(attrs)
        return attrs

    def update(self, token, validated_data):
        # on_sale = int(validated_data["on_sale"])
        # if on_sale:
        #     token = self.__handle_token_resell(token, validated_data)
        user = self.context.get("request").user
        if token.owner != user:
            raise serializers.ValidationError("user is not the owner of the token")
        token = self.__handle_token_resell(token, validated_data)

        return super(TokenSerializer, self).update(token, validated_data)

    def __handle_token_resell(self, token, validated_data):
        sell_type = int(validated_data["sell_type"])
        if sell_type == models.ItemSellType.AUCTION.value:
            token = self.__handle_auction_resell(token, validated_data)
        else:
            token = self.__handle_instant_resell(token)

        return token

    def __handle_auction_resell(self, token, validated_data):
        auction_data = validated_data.pop("auction")
        token.auction = models.Auction.objects.create(**auction_data)
        return token

    def __handle_instant_resell(self, token):
        token.auction = None
        return token


class ItemTokenAuctionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Auction
        fields = (
            "id",
            "start_date",
            "end_date",
            "starting_bidding_price",
            "current_bidding_price",
        )


class ItemTokenSerializer(serializers.ModelSerializer):
    auction = ItemTokenAuctionSerializer(read_only=True)

    class Meta:
        model = models.Token
        fields = (
            "id",
            "on_sale",
            "price",
            "sell_type",
            "auction",
        )


class ItemCollaboratorSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.ItemCollaborator
        read_only_fields = ["id", "item"]
        fields = read_only_fields + [
            "share_percentage",
            "user",
            "wallet_token",
        ]


class ItemSerializer(serializers.ModelSerializer):
    tokens = serializers.SerializerMethodField()
    liked = serializers.SerializerMethodField()
    files = ItemFileSerializer(many=True, required=False)
    collaborators = ItemCollaboratorSerializer(many=True, required=False)

    # Token
    auction = AuctionSerializer(write_only=True)
    on_sale = serializers.BooleanField(write_only=True)
    price = serializers.DecimalField(decimal_places=2, max_digits=12, write_only=True)
    sell_type = serializers.IntegerField(write_only=True)

    class Meta:
        model = models.Item
        read_only_fields = [
            "creator_name",
            "id",
            "is_featured",
            "is_topseller",
            "is_super_featured",
            "item_id",
            "liked",
            "tokens",
            "token_sold",
        ]
        fields = read_only_fields + [
            "category",
            "creator",
            "contract_address",
            "collaborators",
            "cover_img",
            "description",
            "file1",
            "files",
            "is_360_video",
            "token_amt",
            "title",
            "royalties",
            # Token
            "auction",
            "on_sale",
            "price",
            "sell_type",
        ]

    def __init__(self, *args, **kwargs):
        super(ItemSerializer, self).__init__(*args, **kwargs)
        self.fields["auction"].required = is_auction_required(self)

    def get_tokens(self, obj):
        instances = models.Token.objects.filter(collectible=obj, is_sold=False)
        serializer = ItemTokenSerializer(instances, many=True)
        return serializer.data

    def get_liked(self, obj):
        request = self.context.get("request", None)
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def validate_sell_type(self, value):
        if not value:
            return models.ItemSellType.NONE.value

        if value not in models.ItemSellType.to_list():
            raise serializers.ValidationError({"auction": [f"{value} is not a valid sell_type value"]})
        return value

    def validate_collaborators(self, value):
        total_share_percentage = 0
        for data in value:
            if not data["user"]:
                raise serializers.ValidationError({"collaborator": ["Please select a user for all co-creators"]})

            total_share_percentage += data["share_percentage"]

        if total_share_percentage != Decimal(100.0):
            raise serializers.ValidationError({"collaborator": ["Creator splits must add up to 100%"]})
        return value

    def validate(self, attrs: OrderedDict):
        validate_auction_price_with_token(attrs)
        validate_sell_type_with_auction(attrs)
        return attrs

    def create(self, validated_data):
        validated_data.pop("auction", None)
        validated_data.pop("on_sale")
        validated_data.pop("sell_type")
        validated_data.pop("price")

        files_data = validated_data.pop("files", [])
        collaborators_data = validated_data.pop("collaborators", [])

        item = models.Item.objects.create(**validated_data)
        self.__create_collaborators(item, collaborators_data)
        self.__create_item_files(item, files_data)
        return item

    def __create_collaborators(self, item, collaborators_data=[]):
        if collaborators_data:
            collaborator_list = [
                models.ItemCollaborator(
                    item=item,
                    **collaborator_data,
                )
                for collaborator_data in collaborators_data
            ]

            if collaborator_list:
                models.ItemCollaborator.objects.bulk_create(
                    collaborator_list,
                    batch_size=1000,
                )
        else:
            models.ItemCollaborator.objects.create(
                item=item, share_percentage=Decimal(100), user=item.creator, wallet_token=item.creator.wallet_token
            )

    def __create_item_files(self, item, files_data=[]):
        item_file_lists = [
            models.ItemFile(
                item=item,
                **file_data,
            )
            for file_data in files_data
        ]

        if item_file_lists:
            models.ItemFile.objects.bulk_create(
                item_file_lists,
                batch_size=1000,
            )


class TokenIDsSerializer(serializers.Serializer):
    from_id = serializers.IntegerField(write_only=True)
    to_id = serializers.IntegerField(write_only=True)

    def validate(self, attrs: OrderedDict):
        attrs_from = int(attrs.get("from_id"))
        attrs_to = int(attrs.get("to_id"))
        if attrs_from > attrs_to:
            raise serializers.ValidationError({"from_id": ["invalid id range"]})
        return attrs


class ItemMintSerializer(serializers.Serializer):
    ids = TokenIDsSerializer(many=True, write_only=True)
    sell_type = serializers.IntegerField(write_only=True)
    price = serializers.DecimalField(decimal_places=2, max_digits=12, write_only=True)
    auction = AuctionSerializer(write_only=True)

    def __init__(self, *args, **kwargs):
        super(ItemMintSerializer, self).__init__(*args, **kwargs)
        self.fields["auction"].required = is_auction_required(self)

    def validate_sell_type(self, value):
        if not value:
            return models.ItemSellType.NONE.value

        if value not in models.ItemSellType.to_list():
            raise serializers.ValidationError({"auction": [f"{value} is not a valid sell_type value"]})
        return value

    def validate(self, attrs: OrderedDict):
        validate_auction_price_with_token(attrs)
        validate_sell_type_with_auction(attrs)
        return attrs

    def mint_tokens(self, item, validated_data):
        ids = validated_data.get("ids")
        sell_type = int(validated_data.get("sell_type", models.ItemSellType.NONE.value))
        auction_data = validated_data.get("auction") if sell_type == models.ItemSellType.AUCTION.value else None
        price = validated_data.get("price")
        on_sale = sell_type != models.ItemSellType.NONE.value

        auction = self.__create_auctions(sell_type, auction_data)
        self.__create_tokens(item, ids, sell_type, price, on_sale, auction)
        return item

    def __create_auctions(self, sell_type, auction_data):
        # Only 1 auction can be active for a newly created collectible.
        if sell_type != models.ItemSellType.AUCTION.value:
            return None
        return models.Auction.objects.create(**auction_data)

    def __create_tokens(self, item, ids, sell_type, price, on_sale, auction):
        tokens = []
        default_token_data = {
            "collectible": item,
            "owner": item.creator,
            "sell_type": sell_type,
            "on_sale": on_sale,
            "price": price,
        }
        token_number = 1
        for id_range in ids:
            for i in range(id_range["from_id"], id_range["to_id"] + 1):
                token_data = default_token_data.copy()
                token_data.update({"token_number": token_number, "mint_id": i})

                if sell_type == models.ItemSellType.AUCTION.value:
                    # Only 1 auction can be active for a newly created collectible.
                    if token_number == 1:
                        token_data.update({"auction": auction})
                    else:
                        token_data.update(
                            {
                                "sell_type": models.ItemSellType.NONE.value,
                                "on_sale": False,
                                "price": 0,
                            }
                        )
                token_number += 1
                tokens.append(models.Token(**token_data))
        models.Token.objects.bulk_create(tokens, batch_size=1000)


class TokenDetailsSerializer(serializers.Serializer):
    token_number = serializers.IntegerField()
    name = serializers.CharField(max_length=64)
    description = serializers.CharField(max_length=10000, allow_blank=True)
    category = serializers.CharField(max_length=64, allow_null=True)
    file1 = serializers.FileField(allow_null=True)
    files = serializers.ListField(child=serializers.FileField(), allow_empty=True)
    creator = serializers.CharField(max_length=64)
    owner = serializers.CharField(max_length=64)
    is_360_video = serializers.BooleanField()
