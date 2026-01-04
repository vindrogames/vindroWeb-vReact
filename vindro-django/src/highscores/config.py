"""
Game configuration for validation and rate limiting
"""

# Score validation ranges per game
GAME_CONFIGS = {
    'snake': {
        'min_score': 0,
        'max_score': 10000,
        'description': 'Classic Snake Game'
    },
    'tetris': {
        'min_score': 0,
        'max_score': 999999,
        'description': 'Tetris'
    },
    'pong': {
        'min_score': 0,
        'max_score': 21,
        'description': 'Pong Game'
    },
    # Add more games here as needed
}

# Rate limiting configuration
RATE_LIMIT_WINDOW_SECONDS = 60  # Time window for rate limiting
RATE_LIMIT_MAX_SUBMISSIONS = 5  # Max submissions per window
