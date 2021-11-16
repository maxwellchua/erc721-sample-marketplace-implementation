from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models.base import Model
from django.db.models.fields import EmailField
from django.db.models.signals import post_save
from django.dispatch import receiver
from imagekit.models import ImageSpecField
from imagekit.processors import Thumbnail
from rest_framework.authtoken.models import Token


class User(AbstractUser):
    # first_name
    # last_name
    # is also username and password
    wallet_token = models.CharField(max_length=64, blank=True, default="")
    description = models.TextField(blank=True, default="")
    profile_image = models.ImageField(upload_to="profile_images/", blank=True, default="")
    cover_image = models.ImageField(upload_to="cover_images/", blank=True, default="")
    twitter = models.CharField(max_length=128, blank=True, default="")
    instagram = models.CharField(max_length=128, blank=True, default="")
    messenger = models.CharField(max_length=128, blank=True, default="")
    commission_rate = models.DecimalField(
        default=5,
        decimal_places=2,
        max_digits=5,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )

    @property
    def display_name(self):
        if self.first_name:
            if not self.last_name:
                return self.first_name.strip()
            return f"{self.first_name} {self.last_name}".strip()
        return self.last_name.strip()

    @property
    def address(self):
        return self.wallet_token


class Subscriber(Model):
    email_address = EmailField(unique=True)
