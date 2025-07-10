from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator as account_activation_token
from django.core.mail import send_mail
from django.conf import settings
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from pymongo import MongoClient
import re

User = get_user_model()

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist.")
        return value

    def save(self, **kwargs):
        request = self.context.get("request")
        if not request:
            raise ValueError("Request context is required.")

        email = self.validated_data["email"]
        user = User.objects.get(email=email)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = account_activation_token.make_token(user)

        frontend_url = "http://localhost:5173/reset-password"
        reset_link = f"{frontend_url}/{uid}/{token}"

        send_mail(
            subject="Reset your password",
            message=f"Click this link to reset your password: {reset_link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    email = serializers.EmailField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate_new_password(self, value):
        pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$'
        if not re.match(pattern, value):
            raise serializers.ValidationError(
                "Password must be at least 8 characters, include 1 uppercase, 1 lowercase letter, and 1 digit."
            )
        return value

    def validate(self, data):
        try:
            uid = force_str(urlsafe_base64_decode(data["uid"]))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"uid": "Invalid UID"})

        if not account_activation_token.check_token(user, data["token"]):
            raise serializers.ValidationError({"token": "Invalid or expired token"})

        if user.email != data["email"]:
            raise serializers.ValidationError({"email": "Email does not match the token."})

        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        data["user"] = user
        return data

    def save(self, **kwargs):
        try:
            user = self.validated_data["user"]
            new_password = self.validated_data["new_password"]
            email = self.validated_data["email"]

            hashed_password = make_password(new_password)
            user.password = hashed_password
            user.save()

            # ✅ Correct collection: appuser
            client = MongoClient("mongodb://localhost:27017")
            db = client["FairPlayAI"]
            result = db.appuser.update_one(
                {"email": email},
                {"$set": {"password": hashed_password}}
            )
            if result.modified_count == 0:
                print("⚠️ MongoDB update failed: user not found in appuser collection")
            client.close()

        except Exception as e:
            print("🔥 ERROR in PasswordResetConfirmSerializer.save():", e)
            raise serializers.ValidationError({"error": str(e)})
