from rest_framework import serializers
from .models import AppUser


class AppUserSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, max_length=128)

    def validate_password(self, value):
        # Use the same regex as RegistrationSerializer
        pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$'
        import re
        if not re.match(pattern, value):
            raise serializers.ValidationError(
                "Password must be at least 8 characters and include uppercase, lowercase, and a digit."
            )
        return value

    def create(self, validated_data):
        user = AppUser(**validated_data)
        user.save()
        return user

