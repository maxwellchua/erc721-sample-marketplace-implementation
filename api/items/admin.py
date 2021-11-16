from decimal import Decimal

from django.contrib import admin, messages
from django.utils.translation import ngettext

from .models import (
    Auction,
    Bid,
    Category,
    Item,
    ItemCollaborator,
    ItemFile,
    ItemSellType,
    Token,
)


class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name"]


class ItemCollaboratorInlineAdmin(admin.TabularInline):
    model = ItemCollaborator


class ItemFileInlineAdmin(admin.TabularInline):
    model = ItemFile


class ItemAdmin(admin.ModelAdmin):
    inlines = (
        ItemCollaboratorInlineAdmin,
        ItemFileInlineAdmin,
    )
    list_display = (
        "title",
        "item_id",
        "get_creator",
        "is_featured",
        "is_topseller",
        "is_super_featured",
    )
    readonly_fields = ("token_sold", "creator_name")

    def get_creator(self, obj):
        return obj.creator.display_name

    get_creator.short_description = "Creator"
    get_creator.admin_order_field = "creator"


class TokenAdmin(admin.ModelAdmin):
    list_display = (
        "collectible",
        "mint_id",
        "token_number",
        "owner_name",
        "price",
        "sell_type",
        "on_sale",
    )
    readonly_fields = ["owner_name"]
    actions = ["remove_from_sale"]

    def get_queryset(self, request):
        return self.model.objects.with_supply()

    def remove_from_sale(self, request, queryset):
        token_list = []
        auction_ids = []
        for token in queryset:
            if token.sell_type == ItemSellType.AUCTION.value and token.auction:
                auction_ids.append(token.auction.id)
                token.auction = None
            token.on_sale = False
            token.price = Decimal("0.00")
            token.sell_type = ItemSellType.NONE.value
            token_list.append(token)

        if auction_ids:
            Auction.objects.filter(id__in=auction_ids).delete()
        Token.objects.bulk_update(token_list, ["auction", "on_sale", "price", "sell_type"], batch_size=1000)
        updated_count = len(token_list)

        self.message_user(
            request,
            ngettext(
                "%d token was successfully removed from sale.",
                "%d tokens were successfully removed from sale.",
                updated_count,
            )
            % updated_count,
            messages.SUCCESS,
        )

    remove_from_sale.short_description = "Remove from sale"


class BidAdmin(admin.ModelAdmin):
    list_display = ["created_at", "bidder"]
    readonly_fields = ("created_at",)


class AuctionAdmin(admin.ModelAdmin):
    list_display = (
        "item_title",
        "start_date",
        "starting_bidding_price",
        "current_bidding_price",
    )

    def item_title(self, obj):
        if hasattr(obj, "token"):
            return obj.token.collectible.title
        return "Unassigned Auction"


admin.site.register(Category, CategoryAdmin)
admin.site.register(Item, ItemAdmin)
admin.site.register(Token, TokenAdmin)
admin.site.register(Auction, AuctionAdmin)
admin.site.register(Bid, BidAdmin)
