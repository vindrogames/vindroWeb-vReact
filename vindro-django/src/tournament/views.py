import re
import random
import string
import hashlib
import json, uuid
from decimal import Decimal, InvalidOperation
from django.http import JsonResponse
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
_NAME_RE = re.compile(r"^[a-zA-Z0-9\s\-]+$")


def _to_slug(name):
    return re.sub(r'\s+', '-', name.strip().lower())


def _validate_name(name, label='Name'):
    if not _NAME_RE.match(name):
        return f"{label} may only contain letters, numbers, spaces, hyphens, and apostrophes."
    return None


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

    annotations = {'total_plays': models.Count('plays')}
    if request.user.is_authenticated:
        annotations['user_play_count'] = models.Count(
            'plays', filter=models.Q(plays__user=request.user)
        )
    qs = qs.annotate(**annotations)

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
    data = serialize_tournament_with_format(tournament)
    public_pool = TournamentPool.objects.filter(
        tournament=tournament, is_public=True
    ).values_list('id', flat=True).first()
    data['public_pool_id'] = str(public_pool) if public_pool else None
    return JsonResponse({'success': True, 'data': data})


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
        if len(name) > 28:
            return JsonResponse({'success': False, 'error': 'Play name too long (max 28 characters)'}, status=400)
        name_err = _validate_name(name, 'Play name')
        if name_err:
            return JsonResponse({'success': False, 'error': name_err}, status=400)

        slug = _to_slug(name)

        # 3. Create record using the authenticated user from the session
        new_play = TournamentPlay.objects.create(
            tournament=tournament,
            user=request.user,
            name=name,
            slug=slug,
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


# OPTION 2: Public detail view — fetch by tournament slug + user ID + play name (shareable URL)
@csrf_exempt
@require_http_methods(["GET"])
def tournament_play_detail_by_name(request, tournament_slug, user_id, play_name):
    """GET /api/tournament/plays/<tournament_slug>/<user_id>/<play_name>/"""
    play = TournamentPlay.objects.filter(
        tournament__slug=tournament_slug,
        user__id=user_id,
        slug=play_name,
    ).first()
    if not play:
        return JsonResponse({'success': False, 'error': 'Play not found'}, status=404)
    return JsonResponse({'success': True, 'data': serialize_play(play)})


# [UUID detail — kept for reference, superseded by tournament_play_detail_by_name]
# @csrf_exempt
# @require_http_methods(["GET"])
# def tournament_play_detail(request, play_id):
#     """Publicly view any bracket by ID"""
#     play, err = _get_or_404(TournamentPlay, id=play_id)
#     if err: return err
#     return JsonResponse({'success': True, 'data': serialize_play(play)})


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
        pool = TournamentPool.objects.filter(tournament=tournament, join_code__iexact=code).first()

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

        return JsonResponse({
            'success': True,
            'pool_name': pool.name,
            'pool_is_public': pool.is_public,
            'added_count': added_count,
            'results': results_map,
            'message': f'Processed {len(valid_plays)} plays.'
        })

    except Exception as e:
        # This will catch and log the specific reason for the 500/Empty Response
        print(f"Internal Server Error: {str(e)}") 
        return JsonResponse({'success': False, 'error': 'Internal server error during join'}, status=500)


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
        ).annotate(
            live_paid_count=models.Count('pool_memberships', filter=models.Q(pool_memberships__has_paid=True)),
        ).prefetch_related('pool_memberships')

        def _pool_data(pool):
            data = serialize_pool(pool)
            data['paid_count'] = pool.live_paid_count
            return data

        data = {
            'public_pool': serialize_pool(public_pool) if public_pool else None,
            'my_pools': [_pool_data(p) for p in user_pools],
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
    if len(name) > 28:
        return JsonResponse({'success': False, 'error': 'Pool name too long (max 28 characters)'}, status=400)
    name_err = _validate_name(name, 'Pool name')
    if name_err:
        return JsonResponse({'success': False, 'error': name_err}, status=400)

    slug = _to_slug(name)

    is_money_pool = bool(body.get('is_money_pool', False))
    allow_multiple_plays_per_user = bool(body.get('allow_multiple_plays_per_user', True))
    currency = str(body.get('currency', '€')).strip()[:3] or '€'

    cost_per_play = Decimal('0.00')
    if is_money_pool:
        try:
            cost_per_play = Decimal(str(body.get('cost_per_play', '0')))
        except InvalidOperation:
            return JsonResponse({'success': False, 'error': 'Invalid cost per play value.'}, status=400)
        if cost_per_play <= 0:
            return JsonResponse({'success': False, 'error': 'Cost per play must be greater than 0.'}, status=400)

    plain_code = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    try:
        pool = TournamentPool.objects.create(
            tournament=tournament,
            name=name,
            slug=slug,
            description=body.get('description', '').strip(),
            created_by=request.user,
            is_public=False,
            code_hash=_hash_code(plain_code),
            join_code=plain_code,
            is_money_pool=is_money_pool,
            cost_per_play=cost_per_play,
            allow_multiple_plays_per_user=allow_multiple_plays_per_user,
            currency=currency,
        )
    except IntegrityError:
        return JsonResponse({'success': False, 'error': f'A pool named "{name}" already exists.'}, status=400)

    return JsonResponse({'success': True, 'data': serialize_pool(pool)}, status=201)


# OPTION 2: fetch by pool name — auth optional, leaderboard only revealed to members/owners
@require_http_methods(["GET"])
def pool_detail_by_name(request, pool_name):
    """GET /api/tournament/pools/name/<pool_name>/"""
    pool = TournamentPool.objects.filter(slug=pool_name).first()
    if not pool:
        return JsonResponse({'success': False, 'error': 'Pool not found'}, status=404)

    memberships = (
        PoolMembership.objects
        .filter(pool=pool)
        .select_related('play', 'play__user')
        .order_by('-play__bracket_points', '-play__group_points', 'joined_at')
    )

    is_owner = False
    is_member = False
    my_plays = []
    leaderboard_data = []

    if request.user.is_authenticated:
        my_memberships = memberships.filter(play__user=request.user)
        is_owner = pool.created_by_id == request.user.id
        is_member = my_memberships.exists()
        my_plays = [serialize_pool_submission(m) for m in my_memberships]
        if is_owner or is_member:
            leaderboard_data = [serialize_leaderboard_entry(m) for m in memberships]

    pool_data = serialize_pool(pool)

    return JsonResponse({
        'success': True,
        'data': {
            'pool': pool_data,
            'leaderboard': leaderboard_data,
            'is_owner': is_owner,
            'is_member': is_member,
            'my_plays': my_plays,
        },
    })


# [UUID detail — kept for reference, superseded by pool_detail_by_name]
# @require_http_methods(["GET"])
# @login_required_api
# def pool_detail(request, pool_id):
#     pool, err = _get_or_404(TournamentPool, id=pool_id)
#     if err: return err
#     memberships = (PoolMembership.objects.filter(pool=pool)
#         .select_related('play', 'play__user')
#         .order_by('-play__bracket_points', '-play__group_points', 'joined_at'))
#     my_memberships = memberships.filter(play__user=request.user)
#     return JsonResponse({'success': True, 'data': {
#         'pool': serialize_pool(pool),
#         'leaderboard': [serialize_leaderboard_entry(m) for m in memberships],
#         'is_owner': pool.created_by == request.user,
#         'is_member': my_memberships.exists(),
#         'my_plays': [serialize_pool_submission(m) for m in my_memberships],
#     }})


@csrf_exempt
@login_required_api
@require_http_methods(["DELETE"])
def pool_leave(request, pool_id):
    """
    DELETE /api/tournament/pools/<pool_id>/leave/
    Member removes all their own plays from the pool.
    """
    pool, err = _get_or_404(TournamentPool, id=pool_id)
    if err:
        return err

    deleted_count, _ = PoolMembership.objects.filter(
        pool=pool,
        play__user=request.user
    ).delete()

    if deleted_count == 0:
        return JsonResponse({'success': False, 'error': 'You are not a member of this pool'}, status=400)

    return JsonResponse({'success': True, 'removed': deleted_count})


@csrf_exempt
@login_required_api
@require_http_methods(["DELETE"])
def pool_remove_play(request, pool_id, play_id):
    """
    DELETE /api/tournament/pools/<pool_id>/plays/<play_id>/remove/
    Pool owner can remove any play. Play owner can remove their own play.
    """
    pool, err = _get_or_404(TournamentPool, id=pool_id)
    if err:
        return err

    try:
        membership = PoolMembership.objects.select_related('play__user').get(pool=pool, play_id=play_id)
    except PoolMembership.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Play not in this pool'}, status=404)

    is_pool_owner = pool.created_by == request.user
    is_play_owner = membership.play.user == request.user

    if not is_pool_owner and not is_play_owner:
        return JsonResponse({'success': False, 'error': 'Not authorized'}, status=403)

    membership.delete()
    return JsonResponse({'success': True})


@csrf_exempt
@login_required_api
@require_http_methods(["PATCH"])
def toggle_paid(request, pool_id, play_id):
    """PATCH /api/tournament/pools/<pool_id>/plays/<play_id>/paid/  — pool owner only"""
    pool, err = _get_or_404(TournamentPool, id=pool_id)
    if err:
        return err
    if pool.created_by != request.user:
        return JsonResponse({'success': False, 'error': 'Not authorized'}, status=403)
    try:
        membership = PoolMembership.objects.get(pool=pool, play_id=play_id)
        membership.has_paid = not membership.has_paid
        membership.save()
        return JsonResponse({'success': True, 'has_paid': membership.has_paid})
    except PoolMembership.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Play not in this pool'}, status=404)


@csrf_exempt
@login_required_api
@require_http_methods(["PATCH"])
def pool_payout_config(request, pool_id):
    """PATCH /api/tournament/pools/<pool_id>/payout/  — pool owner only"""
    pool, err = _get_or_404(TournamentPool, id=pool_id)
    if err:
        return err
    if pool.created_by != request.user:
        return JsonResponse({'success': False, 'error': 'Not authorized'}, status=403)
    try:
        body = json.loads(request.body)
        config = body.get('payout_config', {})
        values = list(config.values())
        if not all(isinstance(v, int) and v > 0 for v in values):
            return JsonResponse({'success': False, 'error': 'Each percentage must be a positive integer'}, status=400)
        if sum(values) != 100:
            return JsonResponse({'success': False, 'error': f'Percentages must total 100 (got {sum(values)})'}, status=400)
        pool.payout_config = config
        pool.save()
        return JsonResponse({'success': True, 'payout_config': pool.payout_config})
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@require_http_methods(["GET"])
def pool_leaderboard(request, pool_id):
    """
    GET /api/tournament/pools/<pool_id>/leaderboard/
    Unified leaderboard for any pool — public or private.
    Public: no auth required, capped at 100 entries.
    Private/money: auth required.
    """
    pool, err = _get_or_404(TournamentPool, id=pool_id)
    if err:
        return err

    if not pool.is_public and not request.user.is_authenticated:
        return JsonResponse({'success': False, 'error': 'Authentication required'}, status=401)

    qs = (
        PoolMembership.objects
        .filter(pool=pool)
        .select_related('play', 'play__user')
        .order_by('-play__bracket_points', '-play__group_points', 'play__created_at')
    )

    if pool.is_public:
        qs = qs[:100]

    return JsonResponse({
        'success': True,
        'data': {
            'pool_id': str(pool.id),
            'pool_name': pool.name,
            'is_public': pool.is_public,
            'leaderboard': [serialize_leaderboard_entry(m) for m in qs],
        }
    })

