from django.db import models


class TokenManager(models.Manager):
    def with_supply(self):
        """
        Returns a queryset with a supply field.

        returns: Token QuerySet with supply field.
        rtype: Token QuerySet
        """
        return self.annotate(
            supply=models.Subquery(
                self.filter(
                    owner=models.OuterRef("owner"),
                    collectible=models.OuterRef("collectible"),
                    on_sale=models.OuterRef("on_sale"),
                )
                .values("collectible", "owner")
                .annotate(count=models.Count("pk"))
                .values("count")
            )
        )
