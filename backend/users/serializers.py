# from rest_framework import serializers
# from .models import AppUser
# from django.contrib.auth.hashers import make_password

# class AppUserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = AppUser
#         fields = ['id', 'name', 'email', 'password']
#         extra_kwargs = {
#             'password': {'write_only': True}
#         }

#     def create(self, validated_data):
#         validated_data['password'] = make_password(validated_data['password'])  # hash password
#         return super().create(validated_data)
from rest_framework import serializers
from .models import AppUser

class AppUserSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, max_length=128)

    def create(self, validated_data):
        user = AppUser(**validated_data)
        user.save()
        return user
