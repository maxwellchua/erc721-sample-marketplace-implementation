from django_filters import rest_framework as filters

from .models import Token


class NumberInFilter(filters.BaseInFilter, filters.NumberFilter):
    pass


class TokenFilter(filters.FilterSet):
    filter = NumberInFilter(field_name="collectible__category", lookup_expr="in")
    is_featured = filters.BooleanFilter(field_name="collectible__is_featured", lookup_expr="exact")
    is_topseller = filters.BooleanFilter(field_name="collectible__is_topseller", lookup_expr="exact")
    is_super_featured = filters.BooleanFilter(field_name="collectible__is_super_featured", lookup_expr="exact")

    sort_by = filters.OrderingFilter(
        fields={
            "id": "id",
            "current_price": "currentPrice",
            "likes": "likes",
        },
    )

    class Meta:
        model = Token
        fields = {
            "id": ["exact", "in"],
        }
