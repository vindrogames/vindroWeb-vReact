"""
Authentication API views (social auth only)
"""
import os
from functools import wraps
from django.http import JsonResponse
from django.contrib.auth import logout
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import redirect


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
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_authenticated': True,
        'date_joined': user.date_joined.isoformat() if user.date_joined else None,
    }


def serialize_user_with_profile(user):
    """Convert User + profile to JSON-serializable dict"""
    if not user or not user.is_authenticated:
        return None
    data = serialize_user(user)
    if hasattr(user, 'profile'):
        profile = user.profile
        data['profile'] = {
            'bio': profile.bio,
            'avatar': profile.avatar,
            'game_scores': profile.game_scores,
        }
    return data


@require_http_methods(["POST"])
@csrf_exempt
def logout_view(request):
    """POST /api/auth/logout/"""
    logout(request)
    return JsonResponse({'success': True, 'message': 'Logged out successfully'})


@require_http_methods(["GET"])
def current_user(request):
    """GET /api/auth/me/"""
    return JsonResponse({'user': serialize_user_with_profile(request.user)})


def oauth_redirect(request):
    """OAuth redirect fallback — redirects to the React frontend."""
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173/')
    return redirect(frontend_url)
