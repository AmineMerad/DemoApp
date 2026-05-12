from rest_framework import status, parsers
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile
from .serializers import ProfileSerializer
import re

def get_avatar_url(request, profile, user):
    if profile.avatar and profile.avatar.storage.exists(profile.avatar.name):
        return request.build_absolute_uri(profile.avatar.url)
    name = user.first_name or user.email.split('@')[0]
    return f'https://ui-avatars.com/api/?name={name}&background=16D1A6&color=fff&size=200'

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user"""
    email = request.data.get('email')
    password = request.data.get('password')
    name = request.data.get('name', '')
    
    # Validation
    if not email or not password:
        return Response({'error': 'Email and password required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(email=email).exists():
        return Response({'error': 'User already exists'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Create user
    username = email.split('@')[0]
    base_username = username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
    
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=name
    )
    
    # Generate tokens
    refresh = RefreshToken.for_user(user)
    
    # Auto-create profile
    profile, _ = UserProfile.objects.get_or_create(user=user)
    
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.first_name or user.username,
            'avatar': get_avatar_url(request, profile, user),
        }
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login user and return JWT tokens"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({'error': 'Email and password required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, 
                       status=status.HTTP_401_UNAUTHORIZED)
    
    user = authenticate(username=user.username, password=password)
    
    if not user:
        return Response({'error': 'Invalid credentials'}, 
                       status=status.HTTP_401_UNAUTHORIZED)
    
    refresh = RefreshToken.for_user(user)
    
    profile, _ = UserProfile.objects.get_or_create(user=user)
    
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.first_name or user.username,
            'avatar': get_avatar_url(request, profile, user),
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout - blacklist the refresh token"""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Logged out successfully'})
    except Exception:
        return Response({'message': 'Logged out successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """Get current user info including profile"""
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    return Response({
        'id': request.user.id,
        'email': request.user.email,
        'name': request.user.first_name or request.user.username,
        'avatar': get_avatar_url(request, profile, request.user),
    })

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([parsers.MultiPartParser, parsers.JSONParser])
def update_profile(request):
    """Update user profile (name, avatar)"""
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    serializer = ProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'id': request.user.id,
            'email': request.user.email,
            'name': request.user.first_name or request.user.username,
            'avatar': get_avatar_url(request, profile, request.user),
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
