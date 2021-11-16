from django.core.exceptions import ValidationError
from django.utils import timezone


def validate_auction_start_date(value):
    if value < timezone.now():
        raise ValidationError("start_date must be later than now.")
    else:
        return value
