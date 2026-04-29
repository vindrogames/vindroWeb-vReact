"""
Manual JSON serializers for gamescore data (no DRF)
"""


def serialize_gamescore(gamescore):
    """Convert Gamescore object to JSON-serializable dict"""
    if not gamescore:
        return None

    return {
        'id': gamescore.id,
        'user': {
            'id': gamescore.user.id,
            'username': gamescore.user.username,
        },
        'game_name': gamescore.game_name,
        'game_score': gamescore.game_score,
        'game_time': gamescore.game_time,
        'game_metadata': gamescore.game_metadata,
        'created_at': gamescore.created_at.isoformat(),
    }


def serialize_gamescore_list(queryset):
    """Convert queryset of Gamescores to list of dicts"""
    return [serialize_gamescore(gs) for gs in queryset]
