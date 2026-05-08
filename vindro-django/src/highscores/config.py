"""
Game configuration for score validation and rate limiting
"""

GAME_CONFIGS = {
    'game-42': {
        'min_score': 0,
        'max_score': 42,
        'description': 'Game 42 — number placement puzzle',
    },
    'autominer': {
        'min_score': 0,
        'max_score': 99999,
        'description': 'AutoMiner — idle clicker, score = silver collected',
    },
}

RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_SUBMISSIONS = 10
