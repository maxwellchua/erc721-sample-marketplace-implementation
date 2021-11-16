from django.contrib import admin
from django.contrib.auth import admin as auth_admin
from django.utils.translation import gettext_lazy as _

from .models import Subscriber, User


class UserAdmin(auth_admin.UserAdmin):
    ordering = ("pk",)
    list_display = [
        "username",
        "address",
        "display_name",
        "commission_rate",
        "is_superuser",
    ]
    readonly_fields = [
        "wallet_token",
    ]
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (
            _("Account information"),
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "profile_image",
                    "cover_image",
                    "description",
                    "wallet_token",
                    "commission_rate",
                )
            },
        ),
        (
            _("Socials"),
            {
                "fields": (
                    "twitter",
                    "instagram",
                    "messenger",
                )
            },
        ),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (
            _("Important dates"),
            {
                "fields": (
                    "last_login",
                    "date_joined",
                )
            },
        ),
    )


class SubscriberAdmin(admin.ModelAdmin):
    list_display = [
        "email_address",
    ]


admin.site.register(User, UserAdmin)
admin.site.register(Subscriber, SubscriberAdmin)
