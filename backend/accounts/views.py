from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from bson.objectid import ObjectId
from pymongo import MongoClient
from .serializers import PasswordResetRequestSerializer, PasswordResetConfirmSerializer


class PasswordResetRequestView(APIView):
    def post(self, request):
        print("Request data:", request.data)

        serializer = PasswordResetRequestSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            try:
                print("✅ Serializer valid")
                serializer.save()
                print("✅ Serializer saved successfully")
                return Response({"message": "Password reset email sent."}, status=status.HTTP_200_OK)
            # except serializers.ValidationError as ve:
            #     return Response(ve.detail, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                import traceback
                traceback.print_exc()
                return Response(
                    {"error": "Something went wrong while sending the email."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password has been reset."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    def get(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            client = MongoClient("mongodb://localhost:27017")
            db = client["FairPlayAI"]
            user_doc = db.appuser.find_one({"_id": ObjectId(uid)})
            client.close()

            if not user_doc:
                return JsonResponse({"valid": False, "message": "Invalid UID"}, status=400)

            class MockUser:
                def __init__(self, user_doc):
                    self.pk = str(user_doc["_id"])
                    self.email = user_doc["email"]
                    self.password = user_doc.get("password", "")
                    self.last_login = None
                    self.is_active = True

                def get_email_field_name(self):
                    return "email"

            mock_user = MockUser(user_doc)

            if default_token_generator.check_token(mock_user, token):
                return JsonResponse({"valid": True, "message": "Token is valid"})
            else:
                return JsonResponse({"valid": False, "message": "Invalid or expired token"}, status=400)

        except Exception as e:
            return JsonResponse({
                "valid": False,
                "message": "Token validation failed",
                "error": str(e)
            }, status=400)
