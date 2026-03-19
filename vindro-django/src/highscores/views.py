"""
Highscore API views (no DRF)
"""
import json
from datetime import timedelta
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from accounts.views import login_required_api
from .models import Gamescore
from .serializers import serialize_highscore, serialize_highscore_list
from .config import GAME_CONFIGS, RATE_LIMIT_WINDOW_SECONDS, RATE_LIMIT_MAX_SUBMISSIONS


@require_http_methods(["POST"])
@csrf_exempt
@login_required_api
def create_highscore(request):
    """
    Submit a new highscore
    POST /api/highscores/create/
    Body: {
        "game_name": "snake",
        "score": 1500,
        "game_metadata": {"level": 5, "time_played": 120}  # optional
    }
    """
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {'success': False, 'error': 'Invalid JSON'},
            status=400
        )

    # Extract and validate fields
    game_name = data.get('game_name', '').strip().lower()
    score = data.get('score')
    game_metadata = data.get('game_metadata', {})

    # Validation: Required fields
    if not game_name:
        return JsonResponse(
            {'success': False, 'error': 'game_name is required'},
            status=400
        )

    if score is None:
        return JsonResponse(
            {'success': False, 'error': 'score is required'},
            status=400
        )

    # Validation: Score must be integer
    try:
        score = int(score)
    except (ValueError, TypeError):
        return JsonResponse(
            {'success': False, 'error': 'score must be an integer'},
            status=400
        )

    # Validation: Game exists in config
    if game_name not in GAME_CONFIGS:
        return JsonResponse(
            {'success': False, 'error': f'Unknown game: {game_name}'},
            status=400
        )

    # Validation: Score range
    game_config = GAME_CONFIGS[game_name]
    if score < game_config['min_score'] or score > game_config['max_score']:
        return JsonResponse(
            {
                'success': False,
                'error': f"Score must be between {game_config['min_score']} and {game_config['max_score']}"
            },
            status=400
        )

    # Validation: game_metadata must be dict
    if not isinstance(game_metadata, dict):
        return JsonResponse(
            {'success': False, 'error': 'game_metadata must be an object'},
            status=400
        )

    # Rate limiting check
    rate_limit_window = timezone.now() - timedelta(seconds=RATE_LIMIT_WINDOW_SECONDS)
    recent_submissions = Gamescore.objects.filter(
        user=request.user,
        created_at__gte=rate_limit_window
    ).count()

    if recent_submissions >= RATE_LIMIT_MAX_SUBMISSIONS:
        return JsonResponse(
            {
                'success': False,
                'error': f'Rate limit exceeded. Maximum {RATE_LIMIT_MAX_SUBMISSIONS} submissions per {RATE_LIMIT_WINDOW_SECONDS} seconds'
            },
            status=429
        )

    # Create highscore
    try:
        highscore = Gamescore.objects.create(
            user=request.user,
            game_name=game_name,
            score=score,
            game_metadata=game_metadata
        )

        return JsonResponse({
            'success': True,
            'message': 'Highscore submitted successfully',
            'data': serialize_highscore(highscore)
        }, status=201)

    except Exception as e:
        return JsonResponse(
            {'success': False, 'error': str(e)},
            status=500
        )


@require_http_methods(["GET"])
def list_highscores(request):
    """
    List highscores / leaderboard (public or authenticated)
    GET /api/highscores/
    Query params:
        - game_name: Filter by game (optional)
        - limit: Number of results (default 100, max 500)
        - offset: Pagination offset (default 0)
    """
    # Get query parameters
    game_name = request.GET.get('game_name', '').strip().lower()

    try:
        limit = int(request.GET.get('limit', 100))
        offset = int(request.GET.get('offset', 0))
    except (ValueError, TypeError):
        return JsonResponse(
            {'success': False, 'error': 'limit and offset must be integers'},
            status=400
        )

    # Validate limit
    if limit < 1 or limit > 500:
        limit = 100

    # Validate offset
    if offset < 0:
        offset = 0

    # Build queryset
    queryset = Gamescore.objects.select_related('user').all()

    # Filter by game if specified
    if game_name:
        if game_name not in GAME_CONFIGS:
            return JsonResponse(
                {'success': False, 'error': f'Unknown game: {game_name}'},
                status=400
            )
        queryset = queryset.filter(game_name=game_name)

    # Get total count before pagination
    total_count = queryset.count()

    # Apply pagination
    highscores = queryset[offset:offset + limit]

    return JsonResponse({
        'success': True,
        'data': {
            'highscores': serialize_highscore_list(highscores),
            'pagination': {
                'total': total_count,
                'limit': limit,
                'offset': offset,
                'has_more': (offset + limit) < total_count
            }
        }
    })


@require_http_methods(["GET"])
@login_required_api
def my_highscores(request):
    """
    Get current user's personal highscores
    GET /api/highscores/me/
    Query params:
        - game_name: Filter by game (optional)
        - limit: Number of results (default 100)
        - offset: Pagination offset (default 0)
    """
    # Get query parameters
    game_name = request.GET.get('game_name', '').strip().lower()

    try:
        limit = int(request.GET.get('limit', 100))
        offset = int(request.GET.get('offset', 0))
    except (ValueError, TypeError):
        return JsonResponse(
            {'success': False, 'error': 'limit and offset must be integers'},
            status=400
        )

    # Validate limit and offset
    if limit < 1 or limit > 500:
        limit = 100
    if offset < 0:
        offset = 0

    # Build queryset for current user
    queryset = Gamescore.objects.filter(user=request.user)

    # Filter by game if specified
    if game_name:
        if game_name not in GAME_CONFIGS:
            return JsonResponse(
                {'success': False, 'error': f'Unknown game: {game_name}'},
                status=400
            )
        queryset = queryset.filter(game_name=game_name)

    # Get total count
    total_count = queryset.count()

    # Apply pagination
    highscores = queryset[offset:offset + limit]

    return JsonResponse({
        'success': True,
        'data': {
            'highscores': serialize_highscore_list(highscores),
            'pagination': {
                'total': total_count,
                'limit': limit,
                'offset': offset,
                'has_more': (offset + limit) < total_count
            }
        }
    })


@require_http_methods(["DELETE"])
@csrf_exempt
@login_required_api
def delete_highscore(request, highscore_id):
    """
    Delete user's own highscore
    DELETE /api/highscores/<id>/
    """
    # Validate highscore_id
    try:
        highscore_id = int(highscore_id)
    except (ValueError, TypeError):
        return JsonResponse(
            {'success': False, 'error': 'Invalid highscore ID'},
            status=400
        )

    # Get highscore
    try:
        highscore = Gamescore.objects.get(id=highscore_id)
    except Gamescore.DoesNotExist:
        return JsonResponse(
            {'success': False, 'error': 'Highscore not found'},
            status=404
        )

    # Check ownership
    if highscore.user != request.user:
        return JsonResponse(
            {'success': False, 'error': 'You can only delete your own highscores'},
            status=403
        )

    # Delete highscore
    highscore.delete()

    return JsonResponse({
        'success': True,
        'message': 'Highscore deleted successfully'
    })
