from django.urls import include, path
from django.views.generic import base
from rest_framework.urlpatterns import format_suffix_patterns
from rest_framework_nested import routers

from . import views

router = routers.SimpleRouter()
router.register("", views.UserViewSet, basename="users")

tokens_router = routers.NestedSimpleRouter(router, "", lookup="user")
tokens_router.register("tokens", views.UserTokenListViewSet, basename="tokens")

urlpatterns = [
    path("me/items/", views.UserItemViewSet.as_view({"get": "list", "post": "create"})),
    path(
        "me/items/<int:pk>/",
        views.UserItemViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}),
    ),
    path("me/items/<int:pk>/file/", views.UserItemViewSet.as_view({"put": "file"})),
    path("me/items/<int:pk>/mint/", views.UserItemViewSet.as_view({"post": "mint_tokens"})),
    path("me/tokens/<int:pk>/", views.UserSelfUpdateTokenView.as_view()),
    path("subscribe/", views.SubscriberView.as_view()),
    path("", include(router.urls)),
    path("", include(tokens_router.urls)),
]

urlpatterns = format_suffix_patterns(urlpatterns)
