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
        'has_edited_username': user.has_edited_username,
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
        elif len(new_username) > 21:
            errors['username'] = 'Username too long (max 21 characters)'
        elif User.objects.exclude(pk=user.pk).filter(username=new_username).exists():
            errors['username'] = 'Username already taken'
        else:
            user.username = new_username
            user.has_edited_username = True

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


@require_http_methods(["GET"])
def user_bracket_summary(request, user_id):
    """GET /api/users/<user_id>/brackets/ — public tournament bracket summary"""
    from tournament.models import TournamentPlay, PoolMembership
    from django.db.models import F

    try:
        profile_user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    plays = TournamentPlay.objects.filter(user=profile_user).select_related('tournament')

    tournament_map = {}
    for play in plays:
        t_id = str(play.tournament_id)
        if t_id not in tournament_map:
            tournament_map[t_id] = {
                'tournament_name': play.tournament.name,
                'tournament_slug': play.tournament.slug,
                'plays': [],
            }
        tournament_map[t_id]['plays'].append(play)

    result = []
    for t_id, data in tournament_map.items():
        play_list = data['plays']

        memberships = PoolMembership.objects.filter(
            play__in=play_list
        ).select_related('pool', 'play')

        pools_joined = len(set(str(m.pool_id) for m in memberships))

        top_position = None
        for m in memberships:
            total_points = m.play.group_points + m.play.bracket_points
            higher = PoolMembership.objects.filter(pool=m.pool).annotate(
                total=F('play__group_points') + F('play__bracket_points')
            ).filter(total__gt=total_points).count()
            pos = higher + 1
            if top_position is None or pos < top_position:
                top_position = pos

        result.append({
            'tournament_id': t_id,
            'tournament_name': data['tournament_name'],
            'tournament_slug': data['tournament_slug'],
            'play_count': len(play_list),
            'pools_joined': pools_joined,
            'top_position': top_position,
        })

    return JsonResponse({'success': True, 'data': result})


@require_http_methods(["GET"])
def public_profile(request, user_id):
    """GET /api/users/<user_id>/ — public profile data, no auth required"""
    try:
        profile_user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    return JsonResponse({
        'user': {
            'id': profile_user.id,
            'username': profile_user.username,
            'avatar': profile_user.avatar,
            'joined': profile_user.date_joined.isoformat() if profile_user.date_joined else None,
        }
    })
