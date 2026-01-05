"""
Authentication API views (no DRF)
"""
import json
import os
import requests
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError
from django.shortcuts import redirect
from django.conf import settings
from .serializers import serialize_user
from .decorators import login_required_api
from .models import UserProfile


def get_client_ip(request):
    """Extract real client IP, handling proxies/load balancers"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def verify_turnstile(token, secret_key, remote_ip):
    """Verify Cloudflare Turnstile token with timeout and error handling"""
    url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
    data = {
        'secret': secret_key,
        'response': token,
        'remoteip': remote_ip
    }
    try:
        response = requests.post(url, data=data, timeout=5)
        result = response.json()

        if not result.get('success', False):
            # Log error codes for debugging
            error_codes = result.get('error-codes', [])
            print(f"Turnstile verification failed: {error_codes}")

        return result.get('success', False)
    except requests.exceptions.Timeout:
        print("Turnstile verification timeout")
        return False  # Fail closed on timeout
    except Exception as e:
        print(f"Turnstile verification error: {str(e)}")
        return False  # Fail closed on any error


@require_http_methods(["POST"])
@csrf_exempt  # For development - remove in production and use CSRF tokens
def register(request):
    """
    Register a new user
    POST /api/auth/register/
    Body: {"username": "...", "email": "...", "password": "...", "password_confirm": "..."}
    """
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {'success': False, 'error': 'Invalid JSON'},
            status=400
        )

    # Extract fields
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    password_confirm = data.get('password_confirm', '')

    # Validation
    if not username or not email or not password:
        return JsonResponse(
            {'success': False, 'error': 'Username, email, and password are required'},
            status=400
        )

    if password != password_confirm:
        return JsonResponse(
            {'success': False, 'error': 'Passwords do not match'},
            status=400
        )

    if len(password) < 8:
        return JsonResponse(
            {'success': False, 'error': 'Password must be at least 8 characters'},
            status=400
        )

    # Check if username already exists
    if User.objects.filter(username=username).exists():
        return JsonResponse(
            {'success': False, 'error': 'Username already taken'},
            status=400
        )

    # Check if email already exists
    if User.objects.filter(email=email).exists():
        return JsonResponse(
            {'success': False, 'error': 'Email already registered'},
            status=400
        )

    # Verify Cloudflare Turnstile CAPTCHA
    turnstile_token = data.get('cf-turnstile-response')
    if not turnstile_token:
        return JsonResponse(
            {'success': False, 'error': 'CAPTCHA verification required. Please complete the challenge.'},
            status=400
        )

    client_ip = get_client_ip(request)
    secret_key = settings.CLOUDFLARE_TURNSTILE_SECRET_KEY

    if not verify_turnstile(turnstile_token, secret_key, client_ip):
        return JsonResponse(
            {'success': False, 'error': 'CAPTCHA verification failed. Please try again.'},
            status=400
        )

    # Create user
    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        # Create user profile
        UserProfile.objects.create(user=user)

        return JsonResponse({
            'success': True,
            'message': 'User created successfully',
            'user': serialize_user(user)
        }, status=201)

    except IntegrityError:
        return JsonResponse(
            {'success': False, 'error': 'User already exists'},
            status=400
        )
    except Exception as e:
        return JsonResponse(
            {'success': False, 'error': str(e)},
            status=500
        )


@require_http_methods(["POST"])
@csrf_exempt  # For development - remove in production and use CSRF tokens
def login_view(request):
    """
    Login user
    POST /api/auth/login/
    Body: {"username": "...", "password": "..."}
    """
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {'success': False, 'error': 'Invalid JSON'},
            status=400
        )

    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return JsonResponse(
            {'success': False, 'error': 'Username and password are required'},
            status=400
        )

    # Authenticate user
    user = authenticate(request, username=username, password=password)

    if user is not None:
        # Login user (creates session)
        login(request, user)

        return JsonResponse({
            'success': True,
            'message': 'Login successful',
            'user': serialize_user(user)
        })
    else:
        return JsonResponse(
            {'success': False, 'error': 'Invalid credentials'},
            status=401
        )


@require_http_methods(["POST"])
@csrf_exempt  # For development - remove in production and use CSRF tokens
def logout_view(request):
    """
    Logout user
    POST /api/auth/logout/
    """
    logout(request)
    return JsonResponse({
        'success': True,
        'message': 'Logged out successfully'
    })


@require_http_methods(["GET"])
def current_user(request):
    """
    Get current authenticated user
    GET /api/auth/me/
    """
    if request.user.is_authenticated:
        return JsonResponse({
            'user': serialize_user(request.user)
        })
    else:
        return JsonResponse({
            'user': None
        })


@require_http_methods(["POST"])
@csrf_exempt  # For development - remove in production and use CSRF tokens
@login_required_api
def change_password(request):
    """
    Change user password
    POST /api/auth/change-password/
    Body: {"current_password": "...", "new_password": "...", "new_password_confirm": "..."}
    """
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {'success': False, 'error': 'Invalid JSON'},
            status=400
        )

    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')
    new_password_confirm = data.get('new_password_confirm', '')

    # Validation
    if not current_password or not new_password:
        return JsonResponse(
            {'success': False, 'error': 'All fields are required'},
            status=400
        )

    if new_password != new_password_confirm:
        return JsonResponse(
            {'success': False, 'error': 'New passwords do not match'},
            status=400
        )

    if len(new_password) < 8:
        return JsonResponse(
            {'success': False, 'error': 'Password must be at least 8 characters'},
            status=400
        )

    # Verify current password
    if not request.user.check_password(current_password):
        return JsonResponse(
            {'success': False, 'error': 'Current password is incorrect'},
            status=400
        )

    # Set new password
    request.user.set_password(new_password)
    request.user.save()

    # Re-login user to maintain session
    login(request, request.user)

    return JsonResponse({
        'success': True,
        'message': 'Password changed successfully'
    })


def oauth_redirect(request):
    """
    Custom view to handle OAuth callback redirect
    This ensures the session cookie is set before redirecting to React
    """
    # User is already authenticated by allauth at this point
    if request.user.is_authenticated:
        # Create or get user profile if using OAuth for the first time
        UserProfile.objects.get_or_create(user=request.user)

    # Redirect to React app - session cookie is already set by allauth
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173/')
    return redirect(frontend_url)
