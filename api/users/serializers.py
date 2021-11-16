from django.conf import settings
from django.db.models import fields
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from . import models


class UserSerializer(serializers.ModelSerializer):
    display_name = serializers.ReadOnlyField()

    class Meta:
        model = models.User
        read_only_fields = ["id", "address", "is_superuser", "commission_rate"]
        fields = read_only_fields + [
            "first_name",
            "last_name",
            "display_name",
            "description",
            "profile_image",
            "cover_image",
            "twitter",
            "instagram",
            "messenger",
            "wallet_token",
        ]


class UserCreateSerializer(serializers.ModelSerializer):
    display_name = serializers.ReadOnlyField()
    password = serializers.CharField(write_only=True)

    class Meta:
        model = models.User
        read_only_fields = [
            "id",
            "first_name",
            "last_name",
            "profile_image",
            "display_name",
            "description",
            "twitter",
            "instagram",
            "messenger",
        ]
        fields = read_only_fields + ["wallet_token", "password"]

    def create(self, validated_data):
        user = models.User(**validated_data)
        user.set_password(validated_data["password"])
        user.username = user.wallet_token
        user.save()
        return user


class UserProfilePicSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ("profile_image",)


class UserSelfSerializer(serializers.ModelSerializer):
    display_name = serializers.ReadOnlyField()

    class Meta:
        model = models.User
        readonly_field = ["id", "is_superuser", "commission_rate"]
        fields = readonly_field + [
            "address",
            "first_name",
            "last_name",
            "display_name",
            "wallet_token",
            "description",
            "profile_image",
            "cover_image",
            "twitter",
            "instagram",
            "messenger",
        ]


class SubscriberSerializer(serializers.ModelSerializer):
    email_address = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=models.Subscriber.objects.all(), message="This email address has already subscribed"
            )
        ]
    )

    class Meta:
        model = models.Subscriber
        fields = "__all__"
