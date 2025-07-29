
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import AppUserSerializer
from django.conf import settings
from pymongo import MongoClient
from django.contrib.auth.hashers import make_password, check_password
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseRedirect
from urllib.parse import urlencode
import requests
import os
import traceback
import uuid

# Google OAuth Settings
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = 'http://localhost:8000/api/auth/google/callback/'
GOOGLE_AUTH_URI = 'https://accounts.google.com/o/oauth2/v2/auth'
GOOGLE_TOKEN_URI = 'https://oauth2.googleapis.com/token'
GOOGLE_USERINFO_URI = 'https://www.googleapis.com/oauth2/v2/userinfo'

# GitHub OAuth Settings
GITHUB_CLIENT_ID = os.environ.get("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.environ.get("GITHUB_CLIENT_SECRET")
GITHUB_REDIRECT_URI = 'http://localhost:8000/api/auth/github/callback/'
GITHUB_AUTH_URI = 'https://github.com/login/oauth/authorize'
GITHUB_TOKEN_URI = 'https://github.com/login/oauth/access_token'
GITHUB_USERINFO_URI = 'https://api.github.com/user'

# def get_mongo_collection():
#     # models.py — hardcoded (works)
#     # MongoClient("mongodb://kasak:Project%40123@127.0.0.1:27017/fairness_audit?authSource=admin")

#     client = MongoClient(settings.MONGO_DB['HOST'])
#     db = client[settings.MONGO_DB['NAME']]
#     return db, client
def get_mongo_collection():
    client = MongoClient(settings.MONGO_DB['URI'])  # ✅ now uses full URI
    db = client[settings.MONGO_DB['NAME']]
    return db, client


@api_view(['POST'])
def register_user(request):
    serializer = AppUserSerializer(data=request.data)
    if serializer.is_valid():
        try:
            db, client = get_mongo_collection()
            user_data = serializer.validated_data

            if db.appuser.find_one({'email': user_data['email']}):
                return Response({'message': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)

            hashed_password = make_password(user_data['password'])

            db.appuser.insert_one({
                'name': user_data['name'],
                'email': user_data['email'],
                'password': hashed_password,
            })

            return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            traceback.print_exc()
            return Response({'message': 'Database error', 'error': str(e)}, status=500)
        finally:
            client.close()

    return Response({'message': 'Invalid data', 'errors': serializer.errors}, status=400)

@api_view(['POST'])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'message': 'Email and password required'}, status=400)

    try:
        from rest_framework_simplejwt.tokens import RefreshToken
        from django.contrib.auth.models import User
        db, client = get_mongo_collection()
        user = db.appuser.find_one({'email': email})

        if user and check_password(password, user.get('password', '')):
            # Ensure a real Django user exists for JWT auth
            django_user, created = User.objects.get_or_create(
                username=user.get('email'),
                defaults={'email': user.get('email')}
            )
            # Optionally update email if changed
            if django_user.email != user.get('email'):
                django_user.email = user.get('email')
                django_user.save()

            refresh = RefreshToken.for_user(django_user)
            access_token = str(refresh.access_token)
            return Response({
                'message': 'Login successful',
                'user': {'name': user.get('name'), 'email': user.get('email')},
                'token': access_token,
                'refresh': str(refresh),
            }, status=200)

        return Response({'message': 'Invalid credentials'}, status=401)
    except Exception as e:
        traceback.print_exc()
        return Response({'message': 'Database error', 'error': str(e)}, status=500)
    finally:
        client.close()

@api_view(['GET'])
def google_login(request):
    params = {
        'client_id': GOOGLE_CLIENT_ID,
        'redirect_uri': GOOGLE_REDIRECT_URI,
        'response_type': 'code',
        'scope': 'openid email profile',
        'access_type': 'offline',
        'prompt': 'consent',
    }
    url = f"{GOOGLE_AUTH_URI}?{urlencode(params)}"
    return HttpResponseRedirect(url)

@csrf_exempt
@api_view(['GET'])
def google_callback(request):
    code = request.GET.get('code')
    if not code:
        return Response({'message': 'No code provided'}, status=400)

    token_data = {
        'code': code,
        'client_id': GOOGLE_CLIENT_ID,
        'client_secret': GOOGLE_CLIENT_SECRET,
        'redirect_uri': GOOGLE_REDIRECT_URI,
        'grant_type': 'authorization_code',
    }

    token_resp = requests.post(GOOGLE_TOKEN_URI, data=token_data)
    token_json = token_resp.json()
    access_token = token_json.get('access_token')

    if not access_token:
        return Response({'message': 'Token error', 'error': token_json}, status=400)

    userinfo_resp = requests.get(GOOGLE_USERINFO_URI, headers={'Authorization': f'Bearer {access_token}'})
    userinfo = userinfo_resp.json()
    email = userinfo.get('email')
    name = userinfo.get('name')

    if not email:
        return Response({'message': 'Failed to get user info'}, status=400)

    db, client = get_mongo_collection()
    try:
        user = db.appuser.find_one({'email': email})
        if not user:
            random_password = make_password(str(uuid.uuid4()))
            db.appuser.insert_one({'name': name, 'email': email, 'password': random_password})
    finally:
        client.close()

    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173/dashboard')
    redirect_url = f"{frontend_url}?email={email}&name={name}"
    return HttpResponseRedirect(redirect_url)

@api_view(['GET'])
def github_login(request):
    params = {
        'client_id': GITHUB_CLIENT_ID,
        'redirect_uri': GITHUB_REDIRECT_URI,
        'scope': 'read:user user:email',
    }
    url = f"{GITHUB_AUTH_URI}?{urlencode(params)}"
    return HttpResponseRedirect(url)

@csrf_exempt
@api_view(['GET'])
def github_callback(request):
    code = request.GET.get('code')
    if not code:
        return Response({'message': 'No code provided'}, status=400)

    token_data = {
        'client_id': GITHUB_CLIENT_ID,
        'client_secret': GITHUB_CLIENT_SECRET,
        'code': code,
        'redirect_uri': GITHUB_REDIRECT_URI,
    }

    headers = {'Accept': 'application/json'}
    token_resp = requests.post(GITHUB_TOKEN_URI, headers=headers, data=token_data)
    token_json = token_resp.json()
    access_token = token_json.get('access_token')

    if not access_token:
        return Response({'message': 'Token error', 'error': token_json}, status=400)

    user_resp = requests.get(GITHUB_USERINFO_URI, headers={'Authorization': f'token {access_token}'})
    user_info = user_resp.json()

    email_resp = requests.get(f"{GITHUB_USERINFO_URI}/emails", headers={'Authorization': f'token {access_token}'})
    emails = email_resp.json()
    email = next((e['email'] for e in emails if e.get('primary') and e.get('verified')), None)

    name = user_info.get('name') or user_info.get('login')

    if not email:
        return Response({'message': 'No verified email from GitHub'}, status=400)

    db, client = get_mongo_collection()
    try:
        user = db.appuser.find_one({'email': email})
        if not user:
            random_password = make_password(str(uuid.uuid4()))
            db.appuser.insert_one({'name': name, 'email': email, 'password': random_password})
    finally:
        client.close()

    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173/dashboard')
    redirect_url = f"{frontend_url}?email={email}&name={name}"
    return HttpResponseRedirect(redirect_url)
