from django.urls import include, path
from rest_framework import routers
from rest_framework.urlpatterns import format_suffix_patterns

from . import views

router = routers.SimpleRouter()
router.register("tokens", views.TokenViewSet)

category_patterns = [
    path("", views.CategoryList.as_view()),
]

item_patterns = [
    path("", views.ItemViewset.as_view({"get": "list", "post": "create"})),
    path("<int:pk>/", views.ItemViewset.as_view({"get": "retrieve"})),
    path("<int:pk>/likes/", views.ItemLikes.as_view()),
    path("<int:pk>/like-toggle/", views.LikeItemToggle.as_view()),
]

urlpatterns = [
    path("metadata/<item_id>/<token_number>/", views.TokenDetailsView.as_view()),
    path("items/", include(item_patterns)),
    path("categories/", include(category_patterns)),
    path("", include(router.urls)),
]

urlpatterns = format_suffix_patterns(urlpatterns)
