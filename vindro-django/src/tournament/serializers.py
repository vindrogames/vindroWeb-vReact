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
        'end_date': tournament.end_date.isoformat(),
        'groups_end_date': tournament.groups_end_date.isoformat(),
        'bracket_start_date': tournament.bracket_start_date.isoformat(),
    }


def serialize_tournament_with_format(tournament):
    data = serialize_tournament(tournament)
    try:
        fmt = tournament.format
        data['format'] = {
            'groups': fmt.groups,
            'bracket': fmt.bracket,
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
        'tournament_id': str(play.tournament_id),
        'name': play.name,
        'status': play.status,
        'current_phase': play.current_phase,
        'group_predictions': play.group_predictions,
        'bracket_predictions': play.bracket_predictions,
        'score': play.score,
        'created_at': play.created_at.isoformat(),
        'updated_at': play.updated_at.isoformat(),
    }


def serialize_pool(pool):
    return {
        'id': str(pool.id),
        'tournament_id': str(pool.tournament_id),
        'name': pool.name,
        'description': pool.description,
        'is_public': pool.is_public,
        'current_member_count': pool.current_member_count,
        'created_by': pool.created_by.username if pool.created_by else None,
    }


def serialize_leaderboard_entry(membership):
    play = membership.play
    return {
        'play_id': str(play.id),
        'play_name': play.name,
        'user': {
            'id': play.user.id,
            'username': play.user.username,
            'avatar': play.user.avatar,
        },
        'score': play.score,
        'status': play.status,
    }
