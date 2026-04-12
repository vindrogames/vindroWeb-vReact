"""
Authentication API views (social auth only)
"""
import os
import json
from functools import wraps
from django.contrib.auth import get_user_model, logout
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import redirect
from allauth.socialaccount.models import SocialAccount


User = get_user_model()


def login_required_api(view_func):
    """Require authentication for API views"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse(
                {'success': False, 'error': 'Authentication required'},
                status=401
            )
        return view_func(request, *args, **kwargs)
    return wrapper


def serialize_user(user):
    """Convert Django User to JSON-serializable dict"""
    if not user or not user.is_authenticated:
        return None
    
    # Get the provider from the user's social account
    social_account = SocialAccount.objects.filter(user=user).first()
    provider = social_account.provider if social_account else user.provider

    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'avatar': user.avatar,
        'provider': provider,
        'login_count': user.login_count,
        'is_authenticated': True,
        'joined': user.date_joined.isoformat() if user.date_joined else None,
    }


@require_http_methods(["POST"])
@csrf_exempt
def logout_view(request):
    """POST /api/auth/logout/"""
    logout(request)
    return JsonResponse({'success': True, 'message': 'Logged out successfully'})


@require_http_methods(["GET", "PATCH"])
@csrf_exempt
def current_user(request):
    """GET /api/auth/me/ — PATCH /api/auth/me/"""
    if request.method == 'GET':
        return JsonResponse({'user': serialize_user(request.user)})

    # PATCH: update profile (requires authentication)
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'error': 'Authentication required'}, status=401)

    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)

    user = request.user
    errors = {}

    if 'username' in body:
        new_username = body['username'].strip()
        if not new_username:
            errors['username'] = 'Username cannot be empty'
        elif len(new_username) > 150:
            errors['username'] = 'Username too long (max 150 characters)'
        elif User.objects.exclude(pk=user.pk).filter(username=new_username).exists():
            errors['username'] = 'Username already taken'
        else:
            user.username = new_username

    if 'avatar' in body:
        icon_name = body['avatar'].strip()
        allowed_chars = set('abcdefghijklmnopqrstuvwxyz0123456789-_')
        if not icon_name or not all(c in allowed_chars for c in icon_name):
            errors['avatar'] = 'Invalid avatar name'
        else:
            user.avatar = f'/img/profile_icons/{icon_name}.webp'

    if errors:
        return JsonResponse({'success': False, 'errors': errors}, status=400)

    user.save()
    return JsonResponse({'success': True, 'user': serialize_user(user)})


def oauth_redirect(request):
    """OAuth redirect fallback — redirects to the React frontend."""
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173/')
    return redirect(frontend_url)
