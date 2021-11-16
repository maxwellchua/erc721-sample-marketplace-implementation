from knox.views import LoginView as KnoxLoginView


class LoginView(KnoxLoginView):
    def get_post_response_data(self, request, token, instance):
        """
        Ref: http://james1345.github.io/django-rest-knox/views/#loginview
        """
        UserSerializer = self.get_user_serializer_class()

        data = {
            "token": token,
        }

        if UserSerializer is not None:
            data["user"] = UserSerializer(
                request.user,
                context=self.get_context(),
            ).data
        return data
