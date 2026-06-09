def serialize_tournament(tournament):
    return {
        'id': str(tournament.id),
        'name': tournament.name,
        'slug': tournament.slug,
        'tournament_type': tournament.tournament_type,
        'status': tournament.status,
        'description': tournament.description,
        'image_url': tournament.image_url,
        'start_date': tournament.start_date.isoformat(),
        'entries_close': tournament.entries_close.isoformat() if tournament.entries_close else None,
        'end_date': tournament.end_date.isoformat(),
        'groups_end_date': tournament.groups_end_date.isoformat(),
        'bracket_start_date': tournament.bracket_start_date.isoformat(),
        'card_info': tournament.card_info,
        'group_stage_status': tournament.group_stage_status,
        'bracket_stage_status': tournament.bracket_stage_status,
        'total_plays': getattr(tournament, 'total_plays', 0),
        'user_play_count': getattr(tournament, 'user_play_count', None),
    }


def serialize_tournament_with_format(tournament):

    data = serialize_tournament(tournament)
    try:
        fmt = tournament.format
        data['format'] = {
            'groups': fmt.groups_stage,
            'bracket': fmt.bracket_stage,
        }
    except Exception:
        data['format'] = None
    return data


def serialize_results(tournament):
    try:
        fmt = tournament.format
        return {
            'groups_results': fmt.groups_results,
            'bracket_results': fmt.bracket_results,
            'last_updated': fmt.last_updated.isoformat(),
        }
    except Exception:
        return {'groups_results': {}, 'bracket_results': {}, 'last_updated': None}


def serialize_play(play):
    return {
        'id': str(play.id),
        'name': play.name,
        'status': play.status,
        'current_phase': play.current_phase,
        'group_points': play.group_points,
        'group_points_spent': play.group_points_spent,
        'bracket_points': play.bracket_points,

        # Pull the descriptive names for the UI
        'tournament_name': play.tournament.name, 
        'user_name': play.user.username,
        
        # Keep the raw IDs for logic/filtering
        'tournament_id': str(play.tournament_id),
        'user': play.user.id,
        'user_avatar': play.user.avatar,
        

        'group_predictions': play.group_predictions,
        'bracket_predictions': play.bracket_predictions,

        'created_at': play.created_at.isoformat(),
        'updated_at': play.updated_at.isoformat(),

        'joined_pools': [
            {'id': str(m.pool.id), 'name': m.pool.name} 
            for m in play.play_memberships.all()
        ],

        'group_stage_close_date': play.tournament.start_date,
        'bracket_open_date': play.tournament.groups_end_date.isoformat() if play.tournament.groups_end_date else None,
        'bracket_stage_close_date': play.tournament.bracket_start_date,
    }


def serialize_pool_submission(membership):
    """Serializes a PoolMembership for the 'Your Pools' table."""
    pool = membership.pool
    play = membership.play
    
    return {
        'id': str(membership.id),
        'pool_id': str(pool.id),
        'pool_name': pool.name,
        'play_id': str(play.id),
        'play_name': play.name,
        'manager': 'vindroGames' if pool.is_public else (pool.created_by.username if pool.created_by else "Manager"),
        'has_paid': membership.has_paid,
        'group_points': play.group_points,
        'group_points_spent': play.group_points_spent,
        'bracket_points': play.bracket_points,
        'total_points': play.group_points + play.bracket_points,
        'is_public': pool.is_public,
        'is_money_pool': pool.is_money_pool,
        'cost_per_play': str(pool.cost_per_play),
        'currency': pool.currency,
    }


def serialize_pool(pool):
    return {
        'id': str(pool.id),
        'tournament_id': str(pool.tournament_id),
        'tournament_name': pool.tournament.name,
        'name': pool.name,
        'description': pool.description,
        'is_public': pool.is_public,
        'is_money_pool': pool.is_money_pool,
        'cost_per_play': str(pool.cost_per_play),
        'current_member_count': pool.pool_memberships.count(),
        'created_by': pool.created_by.username if pool.created_by else None,
        'created_by_id': str(pool.created_by.id) if pool.created_by else None,
        'created_by_avatar': pool.created_by.avatar if pool.created_by else None,
        'join_code': pool.join_code,
        'allow_multiple_plays_per_user': pool.allow_multiple_plays_per_user,
        'payout_config': pool.payout_config,
        'currency': pool.currency,
    }


def serialize_leaderboard_entry(membership):
    play = membership.play
    return {
        'play_id': str(play.id),
        'play_name': play.name,
        'user': {
            'id': str(play.user.id),
            'username': play.user.username,
            'avatar': play.user.avatar,
        },
        'group_points': play.group_points,
        'group_points_spent': play.group_points_spent,
        'bracket_points': play.bracket_points,
        'total_points': play.group_points + play.bracket_points,
        'has_paid': membership.has_paid
    }
