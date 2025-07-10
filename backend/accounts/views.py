from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model
from .serializers import PasswordResetRequestSerializer, PasswordResetConfirmSerializer
# from rest_framework.permissions import AllowAny
User = get_user_model()


class PasswordResetRequestView(APIView):
    # permission_classes = [AllowAny]
    def post(self, request):
        print("Request data:", request.data)

        serializer = PasswordResetRequestSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            try:
                serializer.save()
                return Response({"message": "Password reset email sent."}, status=status.HTTP_200_OK)
            except Exception as e:
                import traceback
                traceback.print_exc()
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        print("Serializer errors:", serializer.errors)  # Add this line

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
            user = User.objects.get(pk=uid)

            if default_token_generator.check_token(user, token):
                return JsonResponse({"valid": True, "message": "Token is valid"})
            else:
                return JsonResponse({"valid": False, "message": "Invalid or expired token"}, status=400)
        except Exception as e:
            return JsonResponse({
                "valid": False,
                "message": "Token validation failed",
                "error": str(e)
            }, status=400)
