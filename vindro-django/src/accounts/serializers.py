"""
Manual JSON serializers for user data (no DRF)
"""


def serialize_user(user):
    """Convert Django User object to JSON-serializable dict"""
    if not user or not user.is_authenticated:
        return None

    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_authenticated': True,
        'date_joined': user.date_joined.isoformat() if user.date_joined else None,
    }


def serialize_user_with_profile(user):
    """Convert User with profile to JSON-serializable dict"""
    if not user or not user.is_authenticated:
        return None

    data = serialize_user(user)

    # Add profile data if exists
    if hasattr(user, 'profile'):
        profile = user.profile
        data['profile'] = {
            'bio': profile.bio,
            'avatar': profile.avatar,
            'game_scores': profile.game_scores,
        }

    return data
