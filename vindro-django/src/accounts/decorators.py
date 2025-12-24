"""
Custom decorators for authentication
"""
from functools import wraps
from django.http import JsonResponse


def login_required_api(view_func):
    """Decorator to require authentication for API views"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse(
                {'success': False, 'error': 'Authentication required'},
                status=401
            )
        return view_func(request, *args, **kwargs)
    return wrapper
