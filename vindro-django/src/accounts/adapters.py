"""
Custom allauth adapters for OAuth flow
"""
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from .utils import generate_random_username


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Custom adapter to generate random usernames for OAuth users
    """

    def populate_user(self, request, sociallogin, data):
        """
        Populate user instance with data from social login.
        Override to set a random username instead of using the one from OAuth provider.
        """
        user = super().populate_user(request, sociallogin, data)

        # List of fun prefixes for random username generation
        prefixes = [
        "Mario", "Luigi", "Peach", "DonkeyKong", "Bowser", "Kirby", "Link", 
        "Zelda", "Pikachu", "Mewtwo", "Sonic", "Knuckles", "MegaMan", 
        "PacMan", "CrashBandicoot", "Spyro", "Rayman", "CloudStrife", "Ryu",
        "SubZero", "Scorpion", "Raiden", "Vega", "DukeNukem", "SolidSnake", "Ezio",
        "GordonFreeman", "LaraCroft", "Samus", "FallGuy"
        ]

        # Generate random username for OAuth users (3 digits)
        user.username = generate_random_username(prefixes=prefixes, length=3)
        # Avatar is set by default in the User model
        return user
