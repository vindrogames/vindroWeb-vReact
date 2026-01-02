"""
Utility functions for accounts app
"""
import string
import random
from django.contrib.auth.models import User


def generate_random_username(prefixes=None, length=3):
    """
    Generate a random unique username.

    Args:
        prefixes: List of prefix words to choose from randomly, or single string prefix
                 (default: ['user'])
        length: Length of random number string (default: 3)

    Returns:
        A unique username like 'vindroMario-234' or 'vindroSonic-789'
    """
    # Handle default and ensure prefixes is a list
    if prefixes is None:
        prefixes = ['user']
    elif isinstance(prefixes, str):
        prefixes = [prefixes]

    # Only use digits (excluding 0 and 1 to avoid confusion)
    digits = string.digits.replace('0', '').replace('1', '')

    max_attempts = 100
    for _ in range(max_attempts):
        # Randomly select a prefix from the list
        prefix = random.choice(prefixes)

        # Generate random number string
        random_string = ''.join(random.choices(digits, k=length))
        username = f"vindro{prefix}-{random_string}"

        # Check if username is unique
        if not User.objects.filter(username=username).exists():
            return username

    # Fallback: use longer random string if we couldn't find a unique one
    prefix = random.choice(prefixes)
    random_string = ''.join(random.choices(digits, k=length + 2))
    return f"vindro{prefix}-{random_string}"
