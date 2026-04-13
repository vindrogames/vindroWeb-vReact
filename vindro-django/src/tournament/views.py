import secrets
import hashlib
import json, uuid
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from accounts.views import login_required_api
from .models import Tournament, TournamentPlay, TournamentPool, PoolMembership
from .serializers import (
    serialize_tournament,
    serialize_tournament_with_format,
    serialize_results,
    serialize_play,
    serialize_pool,
    serialize_leaderboard_entry,
)
from .logic import initialize_user_play;


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _hash_code(plain_code):
    return hashlib.sha256(plain_code.encode()).hexdigest()


def _check_code(plain_code, stored_hash):
    return hashlib.sha256(plain_code.encode()).hexdigest() == stored_hash


def _get_or_404(model, **kwargs):
    try:
        return model.objects.get(**kwargs), None
    except model.DoesNotExist:
        return None, JsonResponse({'success': False, 'error': 'Not found'}, status=404)


# ---------------------------------------------------------------------------
# Phase 2 — Public tournament endpoints
# ---------------------------------------------------------------------------

@require_http_methods(["GET"])
def tournament_list(request):
    """GET /api/tournament/"""
    status_filter = request.GET.get('status', '').strip()
    qs = Tournament.objects.all()
    if status_filter:
        qs = qs.filter(status=status_filter)
    return JsonResponse({
        'success': True,
        'data': [serialize_tournament(t) for t in qs],
    })


@require_http_methods(["GET"])
def tournament_detail(request, tournament_id):
    """GET /api/tournament/<id>/"""
    tournament, err = _get_or_404(Tournament, id=tournament_id)
    if err:
        return err
    return JsonResponse({'success': True, 'data': serialize_tournament_with_format(tournament)})


@require_http_methods(["GET"])
def tournament_results(request, tournament_id):
    """GET /api/tournament/<id>/results/"""
    tournament, err = _get_or_404(Tournament, id=tournament_id)
    if err:
        return err
    return JsonResponse({'success': True, 'data': serialize_results(tournament)})


# ---------------------------------------------------------------------------
# Phase 3 — Play endpoints (auth required)
# ---------------------------------------------------------------------------

'''
OLD
@require_http_methods(["GET", "POST"])
@csrf_exempt
@login_required_api
def play_list_create(request, tournament_slug):
    """
    GET  /api/tournament/<id>/plays/  — list user's plays for this tournament
    POST /api/tournament/<id>/plays/  — create a new play
    """
    tournament, err = _get_or_404(Tournament, slug=tournament_slug)
    if err:
        return err

    if request.method == 'GET':
        plays = TournamentPlay.objects.filter(tournament=tournament, user=request.user)
        return JsonResponse({'success': True, 'data': [serialize_play(p) for p in plays]})

    # POST — create play
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)

    name = body.get('name', '').strip()
    if not name:
        return JsonResponse({'success': False, 'error': 'name is required'}, status=400)
    if len(name) > 100:
        return JsonResponse({'success': False, 'error': 'name too long (max 100 characters)'}, status=400)

    play = TournamentPlay.objects.create(
        tournament=tournament,
        user=request.user,
        name=name,
    )

    # Auto-join the public vindroPool

    try:
        public_pool = TournamentPool.objects.get(tournament=tournament, is_public=True)
        PoolMembership.objects.create(pool=public_pool, play=play)
        TournamentPool.objects.filter(pk=public_pool.pk).update(
            current_member_count=public_pool.current_member_count + 1
        )
    except TournamentPool.DoesNotExist:
        pass  # public pool not created yet (admin hasn't set it up)
    
    return JsonResponse({'success': True, 'data': serialize_play(play)}, status=201)
'''


# New -> Fetches ALL plays for specific tournament for specific user.
# To populate TournamentPage table when user is logged in
@require_http_methods(["GET"])
@login_required_api
def user_tournament_plays(request, tournament_slug):
    """
    Populates the 'Your Plays' table.
    """
    tournament, err = _get_or_404(Tournament, slug=tournament_slug)
    if err: return err

    # Strictly filter by the logged-in user session
    plays = TournamentPlay.objects.filter(
        tournament=tournament, 
        user=request.user
    ).order_by('-created_at')

    return JsonResponse({
        'success': True, 
        'data': [serialize_play(p) for p in plays]
    })


# New -> Create a play from Modal
@csrf_exempt
@login_required_api 
@require_http_methods(["POST"])
def create_new_play(request, tournament_slug):
    """
    Creates a new Play. Only accessible to authenticated users.
    """
    # 1. Verify Tournament exists
    tournament, err = _get_or_404(Tournament, slug=tournament_slug)
    if err: 
        return err

    try:
        # 2. Parse payload
        body = json.loads(request.body)
        name = body.get('name', '').strip()
        
        if not name:
            return JsonResponse({'success': False, 'error': 'Name is required'}, status=400)

        # 3. Create record using the authenticated user from the session
        new_play = TournamentPlay.objects.create(
            tournament=tournament,
            user=request.user,
            name=name,
            status='draft'
        )
        
        # 4. Populate with Master Map data (shuffled)
        initialize_user_play(new_play)

        return JsonResponse({
            'success': True, 
            'data': serialize_play(new_play) # Fixed: variable name matched to 'new_play'
        }, status=201)

    except IntegrityError:
        return JsonResponse({
            'success': False, 
            'error': f'You already have a play named "{name}".'
        }, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON body'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


'''
OLD
@require_http_methods(["GET", "PATCH"])
@csrf_exempt
@login_required_api
def play_detail(request, play_id):
    """
    GET   /api/tournament/plays/<play_id>/  — get play
    PATCH /api/tournament/plays/<play_id>/  — update predictions
    """
    play, err = _get_or_404(TournamentPlay, id=play_id)
    if err:
        return err
    if play.user != request.user:
        return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)

    if request.method == 'GET':
        return JsonResponse({'success': True, 'data': serialize_play(play)})

    # PATCH
    if play.status == 'submitted':
        return JsonResponse({'success': False, 'error': 'Play already submitted'}, status=400)

    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)

    if 'group_predictions' in body:
        if not isinstance(body['group_predictions'], dict):
            return JsonResponse({'success': False, 'error': 'group_predictions must be an object'}, status=400)
        play.group_predictions = body['group_predictions']

    if 'bracket_predictions' in body:
        if not isinstance(body['bracket_predictions'], dict):
            return JsonResponse({'success': False, 'error': 'bracket_predictions must be an object'}, status=400)
        play.bracket_predictions = body['bracket_predictions']

    if 'current_phase' in body:
        valid_phases = [c[0] for c in TournamentPlay.PHASE_CHOICES]
        if body['current_phase'] not in valid_phases:
            return JsonResponse({'success': False, 'error': 'Invalid phase'}, status=400)
        play.current_phase = body['current_phase']

    if 'name' in body:
        name = body['name'].strip()
        if not name or len(name) > 100:
            return JsonResponse({'success': False, 'error': 'Invalid name'}, status=400)
        play.name = name

    play.save()
    return JsonResponse({'success': True, 'data': serialize_play(play)})
'''

# New -> Public View to display any specific TournamentPlay
@require_http_methods(["GET", "PATCH"])
@csrf_exempt
def tournament_play_detail(request, play_id):
    print('hola from play detail')
    print(play_id)
    play = get_object_or_404(TournamentPlay, id=play_id)

    if request.method == 'GET':
        return JsonResponse({'success': True, 'data': serialize_play(play)})

    if request.method == 'PATCH':
        # Backend Protection: Verify logged user is the actual owner
        if not request.user.is_authenticated or play.user != request.user:
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
        
        try:
            body = json.loads(request.body)
            play.group_predictions = body.get('group_predictions', play.group_predictions)
            play.bracket_predictions = body.get('bracket_predictions', play.bracket_predictions)
            play.save()
            return JsonResponse({'success': True, 'data': serialize_play(play)})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)


'''
Don't know about this submitting business. New proposal from Gemini:
@require_http_methods(["POST"])
@csrf_exempt
@login_required_api
def finalize_tournament_play(request, play_id):
    """
    Locks the play so no further PATCH edits can be made.
    """
    play, err = _get_or_404(TournamentPlay, id=play_id)
    if err: return err
    
    if play.user != request.user:
        return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)

    play.status = 'submitted'
    play.save()
    return JsonResponse({'success': True, 'data': serialize_play(play)})
'''

# Original Play Submit
@require_http_methods(["POST"])
@csrf_exempt
@login_required_api
def play_submit(request, play_id):
    """POST /api/tournament/plays/<play_id>/submit/"""
    play, err = _get_or_404(TournamentPlay, id=play_id)
    if err:
        return err
    if play.user != request.user:
        return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    if play.status == 'submitted':
        return JsonResponse({'success': False, 'error': 'Play already submitted'}, status=400)

    play.status = 'submitted'
    play.current_phase = 'submitted'
    play.save()
    return JsonResponse({'success': True, 'data': serialize_play(play)})


# ---------------------------------------------------------------------------
# Phase 4 — Pool endpoints (auth required)
# ---------------------------------------------------------------------------

@require_http_methods(["GET", "POST"])
@csrf_exempt
@login_required_api
def pool_list_create(request, tournament_id):
    """
    GET  /api/tournament/<id>/pools/  — public pool + user's private pools
    POST /api/tournament/<id>/pools/  — create private pool
    """
    tournament, err = _get_or_404(Tournament, id=tournament_id)
    if err:
        return err

    if request.method == 'GET':
        public_pool = TournamentPool.objects.filter(tournament=tournament, is_public=True).first()
        user_pools = TournamentPool.objects.filter(
            tournament=tournament,
            is_public=False,
            created_by=request.user,
        )
        data = {
            'public_pool': serialize_pool(public_pool) if public_pool else None,
            'my_pools': [serialize_pool(p) for p in user_pools],
        }
        return JsonResponse({'success': True, 'data': data})

    # POST — create private pool
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)

    name = body.get('name', '').strip()
    if not name:
        return JsonResponse({'success': False, 'error': 'name is required'}, status=400)
    if len(name) > 100:
        return JsonResponse({'success': False, 'error': 'name too long (max 100 characters)'}, status=400)

    plain_code = secrets.token_urlsafe(8)  # e.g. "aB3kQr2x"
    pool = TournamentPool.objects.create(
        tournament=tournament,
        name=name,
        description=body.get('description', '').strip(),
        created_by=request.user,
        is_public=False,
        code_hash=_hash_code(plain_code),
    )

    result = serialize_pool(pool)
    result['join_code'] = plain_code  # only returned once at creation
    return JsonResponse({'success': True, 'data': result}, status=201)


@require_http_methods(["POST"])
@csrf_exempt
@login_required_api
def pool_join(request, tournament_id):
    """POST /api/tournament/<id>/pools/join/  — join private pool via code"""
    tournament, err = _get_or_404(Tournament, id=tournament_id)
    if err:
        return err

    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)

    code = body.get('code', '').strip()
    play_id = body.get('play_id', '').strip()

    if not code:
        return JsonResponse({'success': False, 'error': 'code is required'}, status=400)
    if not play_id:
        return JsonResponse({'success': False, 'error': 'play_id is required'}, status=400)

    play, err = _get_or_404(TournamentPlay, id=play_id, tournament=tournament, user=request.user)
    if err:
        return JsonResponse({'success': False, 'error': 'Play not found or not yours'}, status=404)

    code_hash = _hash_code(code)
    pool = TournamentPool.objects.filter(tournament=tournament, code_hash=code_hash).first()
    if not pool:
        return JsonResponse({'success': False, 'error': 'Invalid join code'}, status=400)

    if PoolMembership.objects.filter(pool=pool, play=play).exists():
        return JsonResponse({'success': False, 'error': 'Already a member of this pool'}, status=400)

    PoolMembership.objects.create(pool=pool, play=play)
    TournamentPool.objects.filter(pk=pool.pk).update(
        current_member_count=pool.current_member_count + 1
    )

    return JsonResponse({'success': True, 'data': serialize_pool(pool)})


@require_http_methods(["GET"])
@login_required_api
def pool_leaderboard(request, pool_id):
    """GET /api/tournament/pools/<pool_id>/leaderboard/"""
    pool, err = _get_or_404(TournamentPool, id=pool_id)
    if err:
        return err

    memberships = (
        PoolMembership.objects
        .filter(pool=pool)
        .select_related('play', 'play__user')
        .order_by('-play__score', 'play__created_at')
    )

    return JsonResponse({
        'success': True,
        'data': {
            'pool': serialize_pool(pool),
            'leaderboard': [serialize_leaderboard_entry(m) for m in memberships],
        },
    })
