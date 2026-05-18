"""
Gamescore API views (no DRF)
"""
import json
from datetime import timedelta
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from accounts.views import login_required_api
from .models import Gamescore
from .serializers import serialize_gamescore, serialize_gamescore_list
from .config import GAME_CONFIGS, RATE_LIMIT_WINDOW_SECONDS, RATE_LIMIT_MAX_SUBMISSIONS


@require_http_methods(["POST"])
@csrf_exempt
@login_required_api
def create_gamescore(request):
    """
    Submit a new gamescore
    POST /api/highscores/create/
    Body: {
        "game_name": "game-42",
        "game_score": 30,
        "game_time": "38",
        "game_metadata": {"end_cause": "no-possible-moves"}
    }
    """
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)

    game_name = data.get('game_name', '').strip().lower()
    raw_score = data.get('game_score')
    game_time = str(data.get('game_time', '')).strip()
    game_metadata = data.get('game_metadata', {})

    if not game_name:
        return JsonResponse({'success': False, 'error': 'game_name is required'}, status=400)

    if raw_score is None:
        return JsonResponse({'success': False, 'error': 'game_score is required'}, status=400)

    try:
        game_score = int(raw_score)
    except (ValueError, TypeError):
        return JsonResponse({'success': False, 'error': 'game_score must be an integer'}, status=400)

    if game_name not in GAME_CONFIGS:
        return JsonResponse({'success': False, 'error': f'Unknown game: {game_name}'}, status=400)

    game_config = GAME_CONFIGS[game_name]
    if game_score < game_config['min_score'] or game_score > game_config['max_score']:
        return JsonResponse(
            {'success': False, 'error': f"game_score must be between {game_config['min_score']} and {game_config['max_score']}"},
            status=400
        )

    if not isinstance(game_metadata, dict):
        return JsonResponse({'success': False, 'error': 'game_metadata must be an object'}, status=400)

    rate_limit_since = timezone.now() - timedelta(seconds=RATE_LIMIT_WINDOW_SECONDS)
    recent_count = Gamescore.objects.filter(
        user=request.user,
        game_name=game_name,
        created_at__gte=rate_limit_since,
    ).count()

    if recent_count >= RATE_LIMIT_MAX_SUBMISSIONS:
        return JsonResponse(
            {'success': False, 'error': f'Rate limit exceeded. Max {RATE_LIMIT_MAX_SUBMISSIONS} submissions per {RATE_LIMIT_WINDOW_SECONDS}s'},
            status=429
        )

    gamescore = Gamescore.objects.create(
        user=request.user,
        game_name=game_name,
        game_score=game_score,
        game_time=game_time,
        game_metadata=game_metadata,
    )

    return JsonResponse({
        'success': True,
        'data': serialize_gamescore(gamescore),
    }, status=201)


@require_http_methods(["GET"])
def list_gamescores(request):
    """
    Public gamescore leaderboard
    GET /api/highscores/
    Query params: game_name, limit (default 100, max 500), offset (default 0)
    """
    game_name = request.GET.get('game_name', '').strip().lower()

    try:
        limit = max(1, min(int(request.GET.get('limit', 100)), 500))
        offset = max(0, int(request.GET.get('offset', 0)))
    except (ValueError, TypeError):
        return JsonResponse({'success': False, 'error': 'limit and offset must be integers'}, status=400)

    queryset = Gamescore.objects.select_related('user').all()

    if game_name:
        if game_name not in GAME_CONFIGS:
            return JsonResponse({'success': False, 'error': f'Unknown game: {game_name}'}, status=400)
        queryset = queryset.filter(game_name=game_name)

    total = queryset.count()
    gamescores = queryset[offset:offset + limit]

    return JsonResponse({
        'success': True,
        'data': {
            'gamescores': serialize_gamescore_list(gamescores),
            'pagination': {
                'total': total,
                'limit': limit,
                'offset': offset,
                'has_more': (offset + limit) < total,
            },
        },
    })


@require_http_methods(["GET"])
@login_required_api
def my_gamescores(request):
    """
    Current user's personal gamescores
    GET /api/highscores/me/
    Query params: game_name, limit (default 100), offset (default 0)
    """
    game_name = request.GET.get('game_name', '').strip().lower()

    try:
        limit = max(1, min(int(request.GET.get('limit', 100)), 500))
        offset = max(0, int(request.GET.get('offset', 0)))
    except (ValueError, TypeError):
        return JsonResponse({'success': False, 'error': 'limit and offset must be integers'}, status=400)

    queryset = Gamescore.objects.filter(user=request.user)

    if game_name:
        if game_name not in GAME_CONFIGS:
            return JsonResponse({'success': False, 'error': f'Unknown game: {game_name}'}, status=400)
        queryset = queryset.filter(game_name=game_name)

    total = queryset.count()
    gamescores = queryset[offset:offset + limit]

    return JsonResponse({
        'success': True,
        'data': {
            'gamescores': serialize_gamescore_list(gamescores),
            'pagination': {
                'total': total,
                'limit': limit,
                'offset': offset,
                'has_more': (offset + limit) < total,
            },
        },
    })


@require_http_methods(["GET"])
def user_best_scores(request, user_id):
    """
    Public: best score per game for any user.
    GET /api/highscores/user/<user_id>/best/
    Returns one entry per game — highest score, fastest time at that score.
    """
    from django.contrib.auth import get_user_model
    User = get_user_model()

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'User not found'}, status=404)

    gamescores = Gamescore.objects.filter(user=user).order_by('game_name', '-game_score')

    best_by_game = {}
    for gs in gamescores:
        gn = gs.game_name
        score = gs.game_score
        try:
            time_val = int(gs.game_time)
        except (ValueError, TypeError):
            time_val = None

        if gn not in best_by_game:
            best_by_game[gn] = {'game_name': gn, 'best_score': score, 'best_time': time_val}
        else:
            current = best_by_game[gn]
            if score > current['best_score']:
                best_by_game[gn] = {'game_name': gn, 'best_score': score, 'best_time': time_val}
            elif score == current['best_score']:
                if time_val is not None and (current['best_time'] is None or time_val < current['best_time']):
                    best_by_game[gn]['best_time'] = time_val

    return JsonResponse({
        'success': True,
        'data': {'best_scores': list(best_by_game.values())},
    })


@require_http_methods(["DELETE"])
@csrf_exempt
@login_required_api
def delete_gamescore(request, gamescore_id):
    """
    Delete the current user's own gamescore
    DELETE /api/highscores/<gamescore_id>/
    """
    try:
        gamescore = Gamescore.objects.get(id=gamescore_id)
    except Gamescore.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Gamescore not found'}, status=404)

    if gamescore.user != request.user:
        return JsonResponse({'success': False, 'error': 'You can only delete your own gamescores'}, status=403)

    gamescore.delete()
    return JsonResponse({'success': True})
