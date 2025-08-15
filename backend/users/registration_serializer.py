# from rest_framework import serializers
# import re
# from django.contrib.auth.hashers import make_password
# from pymongo import MongoClient

# class RegistrationSerializer(serializers.Serializer):
#     email = serializers.EmailField()
#     password = serializers.CharField(write_only=True, min_length=8)
#     confirm_password = serializers.CharField(write_only=True, min_length=8)

#     def validate_password(self, value):
#         pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$'
#         if not re.match(pattern, value):
#             raise serializers.ValidationError(
#                 "Password must be at least 8 characters and include uppercase, lowercase, and a digit."
#             )
#         return value

#     def validate(self, data):
#         if data['password'] != data['confirm_password']:
#             raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
#         return data

#     def save(self, **kwargs):
#         email = self.validated_data['email']
#         password = self.validated_data['password']
#         hashed_password = make_password(password)
#         client = MongoClient("mongodb://localhost:27017")
#         db = client["FairPlayAI"]
#         db.appuser.insert_one({"email": email, "password": hashed_password})
#         client.close()
#         return {"email": email}
