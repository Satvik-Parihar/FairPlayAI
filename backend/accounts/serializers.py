# # from django.contrib.auth import get_user_model
# # from django.contrib.auth.tokens import default_token_generator as account_activation_token
# # from django.core.mail import send_mail
# # from django.conf import settings
# # from django.utils.encoding import force_bytes, force_str
# # from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
# # from rest_framework import serializers
# # from django.contrib.auth.hashers import make_password
# # from pymongo import MongoClient
# # import re

# # User = get_user_model()

# # class PasswordResetRequestSerializer(serializers.Serializer):
# #     email = serializers.EmailField()

# #     def validate_email(self, value):
# #         if not User.objects.filter(email=value).exists():
# #             raise serializers.ValidationError("User with this email does not exist.")
# #         return value

# #     def save(self, **kwargs):
# #         request = self.context.get("request")
# #         if not request:
# #             raise ValueError("Request context is required.")

# #         email = self.validated_data["email"]
# #         user = User.objects.get(email=email)

# #         uid = urlsafe_base64_encode(force_bytes(user.pk))
# #         token = account_activation_token.make_token(user)

# #         frontend_url = "http://localhost:5173/reset-password"
# #         reset_link = f"{frontend_url}/{uid}/{token}"

# #         send_mail(
# #             subject="Reset your password",
# #             message=f"Click this link to reset your password: {reset_link}",
# #             from_email=settings.DEFAULT_FROM_EMAIL,
# #             recipient_list=[user.email],
# #         )

# # class PasswordResetConfirmSerializer(serializers.Serializer):
# #     uid = serializers.CharField()
# #     token = serializers.CharField()
# #     email = serializers.EmailField()
# #     new_password = serializers.CharField(write_only=True, min_length=8)
# #     confirm_password = serializers.CharField(write_only=True, min_length=8)

# #     def validate_new_password(self, value):
# #         pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$'
# #         if not re.match(pattern, value):
# #             raise serializers.ValidationError(
# #                 "Password must be at least 8 characters, include 1 uppercase, 1 lowercase letter, and 1 digit."
# #             )
# #         return value

# #     def validate(self, data):
# #         try:
# #             uid = force_str(urlsafe_base64_decode(data["uid"]))
# #             user = User.objects.get(pk=uid)
# #         except (TypeError, ValueError, OverflowError, User.DoesNotExist):
# #             raise serializers.ValidationError({"uid": "Invalid UID"})

# #         if not account_activation_token.check_token(user, data["token"]):
# #             raise serializers.ValidationError({"token": "Invalid or expired token"})

# #         if user.email != data["email"]:
# #             raise serializers.ValidationError({"email": "Email does not match the token."})

# #         if data["new_password"] != data["confirm_password"]:
# #             raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

# #         data["user"] = user
# #         return data

# #     def save(self, **kwargs):
# #         try:
# #             user = self.validated_data["user"]
# #             new_password = self.validated_data["new_password"]
# #             email = self.validated_data["email"]

# #             hashed_password = make_password(new_password)
# #             user.password = hashed_password
# #             user.save()

# #             # ✅ Correct collection: appuser
# #             client = MongoClient("mongodb://localhost:27017")
# #             db = client["FairPlayAI"]
# #             result = db.appuser.update_one(
# #                 {"email": email},
# #                 {"$set": {"password": hashed_password}}
# #             )
# #             if result.modified_count == 0:
# #                 print("⚠️ MongoDB update failed: user not found in appuser collection")
# #             client.close()

# #         except Exception as e:
# #             print("🔥 ERROR in PasswordResetConfirmSerializer.save():", e)
# #             raise serializers.ValidationError({"error": str(e)})
# from django.contrib.auth.tokens import default_token_generator as account_activation_token
# from django.core.mail import send_mail
# from django.conf import settings
# from django.utils.encoding import force_bytes, force_str
# from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
# from rest_framework import serializers
# from django.contrib.auth.hashers import make_password
# from pymongo import MongoClient
# import re
# from bson.objectid import ObjectId


# # ✅ Fake user object compatible with token generator
# class MockUser:
#     def _init_(self, user_doc):
#         self.pk = str(user_doc["_id"])
#         self.email = user_doc["email"]
#         self.password = user_doc.get("password", "")
#         self.last_login = None
#         self.is_active = True

#     def get_email_field_name(self):
#         return "email"


# class PasswordResetRequestSerializer(serializers.Serializer):
#     email = serializers.EmailField()

#     def validate_email(self, value):
#         client = MongoClient("mongodb://localhost:27017")
#         db = client["FairPlayAI"]
#         user = db.appuser.find_one({"email": value})
#         client.close()

#         if not user:
#             raise serializers.ValidationError("No account is registered with this email.")

#         self.user_doc = user  # save for use in .save()
#         return value

#     def save(self, **kwargs):
#         user_doc = self.user_doc
#         mock_user = MockUser(user_doc)

#         uid = urlsafe_base64_encode(force_bytes(mock_user.pk))
#         token = account_activation_token.make_token(mock_user)
#         reset_link = f"http://localhost:5173/reset-password/{uid}/{token}"

#         print("📧 Sending reset email to:", mock_user.email)
#         print("🔗 Reset link:", reset_link)

#         try:
#             send_mail(
#                 subject="Reset your password",
#                 message=f"Click the link to reset your password:\n{reset_link}",
#                 from_email=settings.DEFAULT_FROM_EMAIL,
#                 recipient_list=[mock_user.email],
#                 fail_silently=False,
#             )
#         except Exception as e:
#             raise serializers.ValidationError({"email": f"Failed to send email: {e}"})


# class PasswordResetConfirmSerializer(serializers.Serializer):
#     uid = serializers.CharField()
#     token = serializers.CharField()
#     email = serializers.EmailField()
#     new_password = serializers.CharField(write_only=True, min_length=8)
#     confirm_password = serializers.CharField(write_only=True, min_length=8)

#     def validate_new_password(self, value):
#         pattern = r'^(?=.[a-z])(?=.[A-Z])(?=.*\d).{8,}$'
#         if not re.match(pattern, value):
#             raise serializers.ValidationError(
#                 "Password must be at least 8 characters and include uppercase, lowercase, and a digit."
#             )
#         return value

#     def validate(self, data):
#         try:
#             uid = force_str(urlsafe_base64_decode(data["uid"]))
#             client = MongoClient("mongodb://localhost:27017")
#             db = client["FairPlayAI"]
#             user = db.appuser.find_one({"_id": ObjectId(uid)})
#             client.close()

#             if not user:
#                 raise serializers.ValidationError({"uid": "Invalid UID"})

#         except Exception:
#             raise serializers.ValidationError({"uid": "Invalid UID format or database error"})

#         mock_user = MockUser(user)

#         if not account_activation_token.check_token(mock_user, data["token"]):
#             raise serializers.ValidationError({"token": "Invalid or expired token"})

#         if user["email"] != data["email"]:
#             raise serializers.ValidationError({"email": "Email does not match the token."})

#         if data["new_password"] != data["confirm_password"]:
#             raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

#         data["user"] = user
#         return data

#     def save(self, **kwargs):
#         new_password = self.validated_data["new_password"]
#         user = self.validated_data["user"]
#         hashed_password = make_password(new_password)

#         client = MongoClient("mongodb://localhost:27017")
#         db = client["FairPlayAI"]
#         result = db.appuser.update_one(
#             {"_id": ObjectId(user["_id"])},
#             {"$set": {"password": hashed_password}}
#         )
#         client.close()

#         if result.modified_count == 0:
#             raise serializers.ValidationError("Failed to update password in database")
from django.contrib.auth.tokens import default_token_generator as account_activation_token
from django.core.mail import send_mail
from django.conf import settings
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from pymongo import MongoClient
import re
from bson.objectid import ObjectId


# ✅ Fake user object compatible with token generator
class MockUser:
    def _init_(self, user_doc):
        self.pk = str(user_doc["_id"])
        self.email = user_doc["email"]
        self.password = user_doc.get("password", "")
        self.last_login = None
        self.is_active = True

    def get_email_field_name(self):
        return "email"


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        client = MongoClient("mongodb://localhost:27017")
        db = client["FairPlayAI"]
        user = db.appuser.find_one({"email": value})
        client.close()

        if not user:
            raise serializers.ValidationError("No account is registered with this email.")

        self.user_doc = user  # save for use in .save()
        return value

    def save(self, **kwargs):
        user_doc = self.user_doc
        mock_user = MockUser(user_doc)

        uid = urlsafe_base64_encode(force_bytes(mock_user.pk))
        token = account_activation_token.make_token(mock_user)
        reset_link = f"http://localhost:5173/reset-password/{uid}/{token}"

        print("📧 Sending reset email to:", mock_user.email)
        print("🔗 Reset link:", reset_link)

        try:
            send_mail(
                subject="Reset your password",
                message=f"Click the link to reset your password:\n{reset_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[mock_user.email],
                fail_silently=False,
            )
        except Exception as e:
            raise serializers.ValidationError({"email": f"Failed to send email: {e}"})


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    email = serializers.EmailField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate_new_password(self, value):
        pattern = r'^(?=.[a-z])(?=.[A-Z])(?=.*\d).{8,}$'
        if not re.match(pattern, value):
            raise serializers.ValidationError(
                "Password must be at least 8 characters and include uppercase, lowercase, and a digit."
            )
        return value

    def validate(self, data):
        try:
            uid = force_str(urlsafe_base64_decode(data["uid"]))
            client = MongoClient("mongodb://localhost:27017")
            db = client["FairPlayAI"]
            user = db.appuser.find_one({"_id": ObjectId(uid)})
            client.close()

            if not user:
                raise serializers.ValidationError({"uid": "Invalid UID"})

        except Exception:
            raise serializers.ValidationError({"uid": "Invalid UID format or database error"})

        mock_user = MockUser(user)

        if not account_activation_token.check_token(mock_user, data["token"]):
            raise serializers.ValidationError({"token": "Invalid or expired token"})

        if user["email"] != data["email"]:
            raise serializers.ValidationError({"email": "Email does not match the token."})

        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        data["user"] = user
        return data

    def save(self, **kwargs):
        new_password = self.validated_data["new_password"]
        user = self.validated_data["user"]
        hashed_password = make_password(new_password)

        client = MongoClient("mongodb://localhost:27017")
        db = client["FairPlayAI"]
        result = db.appuser.update_one(
            {"_id": ObjectId(user["_id"])},
            {"$set": {"password": hashed_password}}
        )
        client.close()

        if result.modified_count == 0:
            raise serializers.ValidationError("Failed to update password in database")