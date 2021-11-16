from enum import Enum

import nanoid
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Max
from django.db.models.deletion import CASCADE, SET_NULL

from .fields import NullableCharField
from .managers import TokenManager
from .validators import validate_auction_start_date


def generate_token_id():
    return nanoid.generate(size=9)


class ItemSellType(Enum):
    NONE = 0
    INSTANT_BUY = 1
    AUCTION = 2

    @classmethod
    def choices(cls):
        return tuple((i.value, i.name) for i in cls)

    @classmethod
    def to_list(cls):
        return [i.value for i in cls]


class Auction(models.Model):
    start_date = models.DateTimeField(null=False, blank=False, validators=[validate_auction_start_date])
    end_date = models.DateTimeField(null=False, blank=False)
    starting_bidding_price = models.DecimalField(decimal_places=2, max_digits=12, validators=[MinValueValidator(0)])

    def __str__(self):
        if hasattr(self, "token"):
            return f"{self.token.collectible.title} auction"
        return f"Unassigned Auction {self.id}"

    @property
    def current_bidding_price(self):
        return self.bid_set.aggregate(Max("bid_value"))["bid_value__max"] or self.starting_bidding_price

    @property
    def highest_bidder_id(self):
        highest_bid = self.bid_set.order_by("-bid_value").first()
        if highest_bid is None:
            return None
        return highest_bid.bidder.id


class Bid(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    bidder = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=CASCADE, related_name="bid_set")
    bid_value = models.DecimalField(decimal_places=2, max_digits=12)

    auction = models.ForeignKey(Auction, on_delete=CASCADE, related_name="bid_set")

    def __str__(self):
        return f"{self.bid_value} bid from {self.bidder}"

    def clean(self):
        current_bidding_price = self.auction.current_bidding_price
        if current_bidding_price is None:
            current_bidding_price = self.auction.starting_bidding_price

        if current_bidding_price >= self.bid_value:
            raise ValidationError(f"Bid can't be below {current_bidding_price}")


class Category(models.Model):
    name = models.CharField(max_length=32, blank=False, null=False)

    def __str__(self):
        return self.name


class Item(models.Model):
    contract_address = NullableCharField(max_length=64, blank=True, null=True, unique=True, default=None)
    item_id = models.CharField(max_length=9, default=generate_token_id)

    file1 = models.FileField(upload_to="items/file1/", blank=True, default="")
    is_360_video = models.BooleanField(default=False)
    cover_img = models.ImageField(upload_to="items/cover_images/", blank=True, default="")
    title = models.CharField(max_length=64, blank=True, default="")
    description = models.TextField(blank=True, default="")
    royalties = models.DecimalField(decimal_places=2, max_digits=5)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=CASCADE, related_name="create_set")

    token_amt = models.IntegerField(default=1)
    category = models.ForeignKey(Category, blank=True, null=True, on_delete=SET_NULL)
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="like_set")

    is_super_featured = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    is_topseller = models.BooleanField(default=False)

    @property
    def token_sold(self):  # TODO: check the usage of this property
        return self.sold_set.filter(is_sold=True).count()

    @property
    def creator_name(self):
        creator = self.creator
        return f"{creator.first_name} {creator.last_name}"

    def __str__(self):
        return self.title


class ItemFile(models.Model):
    file = models.FileField(upload_to="items/file2/", blank=True, default="")
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="files")

    def __str__(self):
        return f"{self.item.title}: {self.filename}"

    @property
    def filename(self):
        return self.file.name.split("/")[2]


class ItemCollaborator(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="collaborators")
    share_percentage = models.DecimalField(decimal_places=2, max_digits=5)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=CASCADE, related_name="collaborated_items")
    wallet_token = models.CharField(max_length=64, blank=True, default="")

    def __str__(self):
        return f"{self.user.display_name}({self.share_percentage}%): {self.item.title}"


class Token(models.Model):
    token_number = models.PositiveIntegerField(default=1)
    mint_id = models.PositiveIntegerField(default=0)
    collectible = models.ForeignKey(Item, on_delete=CASCADE, related_name="sold_set")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=CASCADE, related_name="own_set")

    sell_type = models.IntegerField(choices=ItemSellType.choices())
    auction = models.OneToOneField(
        Auction,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    price = models.DecimalField(decimal_places=2, max_digits=12)
    on_sale = models.BooleanField(default=False)
    is_sold = models.BooleanField(default=False)

    objects = TokenManager()

    class Meta:
        ordering = [
            "collectible",
            "owner",
            "on_sale",
            "token_number",
        ]

    @property
    def owner_name(self):
        owner = self.owner
        if owner.first_name == "":
            return owner.username
        return f"{owner.first_name} {owner.last_name}"

    def __str__(self):
        return self.owner_name

    def clean(self):
        if self.sell_type == ItemSellType.AUCTION.value and self.auction is None:
            raise ValidationError("Auction can't be undefined")
