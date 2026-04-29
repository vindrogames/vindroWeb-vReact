import secrets
import hashlib
import json, uuid
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.db import IntegrityError, transaction, models
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
    serialize_pool_submission,
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
def tournament_detail(request, tournament_slug):
    """GET /api/tournament/<id>/"""
    tournament, err = _get_or_404(Tournament, slug=tournament_slug)
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
# When Landing on TournamentPage ()
# ---------------------------------------------------------------------------
# New -> Fetches ALL plays for specific tournament for specific user.
# To populate TournamentPage table when user is logged in
@require_http_methods(["GET"])
@csrf_exempt
@login_required_api
def user_tournament_plays(request, tournament_id):
    """
    Populates the 'Your Plays' table.
    """
    tournament, err = _get_or_404(Tournament, id=tournament_id)
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


@require_http_methods(["GET"])
@csrf_exempt
@login_required_api
def user_pool_submissions(request, tournament_id):
    """
    Populates the 'Your Pools' table.
    Returns every instance of a user's play inside a pool.
    """
    # We query PoolMembership directly because this table represents
    # one "submission" (A specific play in a specific pool).
    submissions = PoolMembership.objects.filter(
        play__user=request.user,
        pool__tournament_id=tournament_id
    ).select_related('pool', 'play', 'pool__created_by').order_by('-joined_at')

    return JsonResponse({
        'success': True,
        'data': [serialize_pool_submission(s) for s in submissions]
    })

# ---------------------------------------------------------------------------
# Phase 3 — Play endpoints (auth required)
# ---------------------------------------------------------------------------



# New -> Create a play from Modal
@csrf_exempt
@login_required_api 
@require_http_methods(["POST"])
def create_new_play(request, tournament_id):
    """
    Creates a new Play. Only accessible to authenticated users.
    """
    # 1. Verify Tournament exists
    tournament, err = _get_or_404(Tournament, id=tournament_id)
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


# 1. Public/Detail View
@require_http_methods(["GET"])
def tournament_play_detail(request, play_id):
    """Publicly view any bracket by ID"""
    play, err = _get_or_404(TournamentPlay, id=play_id)
    if err: return err
    return JsonResponse({'success': True, 'data': serialize_play(play)})


# 2. Reorder Groups (Owner Only)
@csrf_exempt
@login_required_api
@require_http_methods(["PATCH"])
def update_groups(request, play_id):
    """PATCH /api/tournament/plays/<id>/update-groups/"""
    # Security: Query by both ID and User in one shot
    play, err = _get_or_404(TournamentPlay, id=play_id, user=request.user)
    if err: return err

    try:
        body = json.loads(request.body)
        # Surgical update of the JSON field
        play.group_predictions = body.get('group_predictions', play.group_predictions)
        play.save()
        return JsonResponse({'success': True, 'data': serialize_play(play)})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


# 3. Choose Bracket Winners (Owner Only)
@csrf_exempt
@login_required_api
@require_http_methods(["PATCH"])
def update_bracket(request, play_id):
    """PATCH /api/tournament/plays/<id>/update-bracket/"""
    play, err = _get_or_404(TournamentPlay, id=play_id, user=request.user)
    if err: return err

    try:
        body = json.loads(request.body)
        play.bracket_predictions = body.get('bracket_predictions', play.bracket_predictions)
        
        # Logic: Progress the phase automatically
        if play.current_phase == 'groups':
            play.current_phase = 'bracket'
            
        play.save()
        return JsonResponse({'success': True, 'data': serialize_play(play)})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


# ---------------------------------------------------------------------------
# Phase 4 — Pool endpoints (auth required)
# ---------------------------------------------------------------------------


@login_required_api
@csrf_exempt
@require_http_methods(["POST"])
def pool_join(request, tournament_id):
    # 1. Fetch Tournament
    tournament, error_res = _get_or_404(Tournament, id=tournament_id)
    if error_res:
        return error_res

    # 2. Parse Payload
    try:
        body = json.loads(request.body)
        raw_play_id = body.get('play_id')
        pool_type = body.get('pool_type')
        code = body.get('code', '').strip()
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)

    # 3. Normalize IDs (Ensure it is a list of UUID strings)
    play_ids = raw_play_id if isinstance(raw_play_id, list) else [raw_play_id]

    # 4. Find the Pool
    if pool_type == 'public':
        pool = TournamentPool.objects.filter(tournament=tournament, is_public=True).first()
    else:
        # Match against your model's 'code_hash' field
        pool = TournamentPool.objects.filter(tournament=tournament, code_hash=code).first()

    if not pool:
        return JsonResponse({'success': False, 'error': 'Pool not found or invalid code'}, status=404)

    # 5. Process Memberships
    added_count = 0
    results_map = {}

    try:
        with transaction.atomic():
            # Filter for valid plays belonging to this user and tournament
            # Using id__in handles the list correctly
            valid_plays = TournamentPlay.objects.filter(
                id__in=play_ids,
                tournament=tournament,
                user=request.user
            )

            if not valid_plays.exists():
                return JsonResponse({'success': False, 'error': 'No valid plays found'}, status=404)

            # Check existing memberships to prevent unique constraint errors
            # 2. Get EXISTING memberships for this pool and these plays
            # We force this into a list of STRINGS immediately

            existing_play_ids = [
                str(pid) for pid in PoolMembership.objects.filter(
                    pool=pool, 
                    play__in=valid_plays
                ).values_list('play_id', flat=True)
            ]
            existing_str_ids = set(str(pid) for pid in existing_play_ids)

            print(f"DEBUG: Checking against these existing IDs: {existing_str_ids}")

            new_memberships = []
            

            for play in valid_plays:

                pid_str = str(play.id)

                # Direct String-to-String comparison
                if pid_str in existing_str_ids:
                    results_map[pid_str] = 'already_joined'
                else:
                    new_memberships.append(PoolMembership(pool=pool, play=play))
                    results_map[pid_str] = 'success'

            if new_memberships:
                PoolMembership.objects.bulk_create(new_memberships)
                added_count = len(new_memberships)

            if added_count > 0:
                TournamentPool.objects.filter(pk=pool.pk).update(
                    current_member_count=models.F('current_member_count') + added_count
                )

        return JsonResponse({
            'success': True, 
            'added_count': added_count,
            'results': results_map,
            'message': f'Processed {len(valid_plays)} plays.'
        })

    except Exception as e:
        # This will catch and log the specific reason for the 500/Empty Response
        print(f"Internal Server Error: {str(e)}") 
        return JsonResponse({'success': False, 'error': 'Internal server error during join'}, status=500)



@csrf_exempt
@require_http_methods(["GET"])
def public_leaderboard(request, tournament_id):
    """Specific to the 'Vindro Global' standings."""
    target_pool = TournamentPool.objects.filter(
        tournament_id=tournament_id, 
        is_public=True
    ).first()
    
    if not target_pool:
        return JsonResponse({'success': True, 'data': []})

    # Fetch top 100 for global
    memberships = PoolMembership.objects.filter(pool=target_pool)\
    .select_related('play', 'play__user')\
    .order_by('-play__bracket_points', '-play__group_points', 'play__created_at')[:100]
    
    return JsonResponse({'success': True, 'data': [serialize_leaderboard_entry(m) for m in memberships]})



@csrf_exempt
@require_http_methods(["GET"])
@login_required_api
def private_pool_leaderboard(request, tournament_id, pool_id):
    """Specific to a private group or money pool."""
    # Logic to ensure the user is allowed to see this pool could go here
    target_pool = get_object_or_404(TournamentPool, id=pool_id, tournament_id=tournament_id)

    memberships = PoolMembership.objects.filter(pool=target_pool)\
        .select_related('play', 'play__user')\
        .order_by('-play__bracket_points', '-play__group_points')

    return JsonResponse({
        'success': True, 
        'pool_name': target_pool.name,
        'data': [serialize_leaderboard_entry(m) for m in memberships]
    })

@require_http_methods(["GET", "POST"])
@csrf_exempt
@login_required_api
def pool_create(request, tournament_id):
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
