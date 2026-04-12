"""
Custom allauth adapters for OAuth flow
"""
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.conf import settings
from .utils import generate_random_username

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Custom adapter to generate random usernames for OAuth users
    and handle conditional redirection based on login count.
    """

    def populate_user(self, request, sociallogin, data):
        """
        Populate user instance with data from social login.
        """
        user = super().populate_user(request, sociallogin, data)

        prefixes = [
            "Mario", "Luigi", "Peach", "DonkeyKong", "Bowser", "Kirby", "Link", 
            "Zelda", "Pikachu", "Mewtwo", "Sonic", "Knuckles", "MegaMan", 
            "PacMan", "CrashBandicoot", "Spyro", "Rayman", "CloudStrife", "Ryu",
            "SubZero", "Scorpion", "Raiden", "Vega", "DukeNukem", "SolidSnake", "Ezio",
            "GordonFreeman", "LaraCroft", "Samus", "FallGuy"
        ]

        user.username = generate_random_username(prefixes=prefixes, length=3)
        return user

    def get_login_redirect_url(self, request):
        """
        Determine redirect URL after login.
        - First-time users (login_count == 1) go to profile.
        - Returning users go back to 'next' URL (where they were).
        """
        user = request.user
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173/').rstrip('/')
        
        # 1. Grab the 'next' parameter you sent from React
        next_url = request.GET.get('next') or request.POST.get('next')

        # 2. FORCE Redirect for New Users (Count == 1)
        # Note: If your model default is 1 and signal adds 1, change this to 2.
        if hasattr(user, 'login_count') and user.login_count == 1:
            return f"{frontend_url}/user/{user.id}"

        # 3. Handle Returning Users (Count > 1)
        if next_url:
            return next_url
        
        # 4. Fallback to Home
        return frontend_url
