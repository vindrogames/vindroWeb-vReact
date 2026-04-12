"""
Manual JSON serializers for highscore data (no DRF)
"""


def serialize_highscore(highscore):
    """Convert Highscore object to JSON-serializable dict"""
    if not highscore:
        return None

    return {
        'id': highscore.id,
        'user': {
            'id': highscore.user.id,
            'username': highscore.user.username,
        },
        'game_name': highscore.game_name,
        'game_score': highscore.game_score,
        'game_time': highscore.game_time,
        'game_metadata': highscore.game_metadata,
        'created_at': highscore.created_at.isoformat(),
        'updated_at': highscore.updated_at.isoformat(),
    }


def serialize_highscore_list(queryset):
    """Convert queryset of Highscores to list of dicts"""
    return [serialize_highscore(hs) for hs in queryset]
