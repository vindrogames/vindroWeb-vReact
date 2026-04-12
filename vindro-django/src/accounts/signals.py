from django.contrib.auth.signals import user_logged_in
from allauth.socialaccount.models import SocialAccount
from django.dispatch import receiver

@receiver(user_logged_in)
def handle_user_login(sender, request, user, **kwargs):
    """
    Increments login count and ensures provider is set every time a user logs in.
    """
    # 1. Increment the count
    user.login_count += 1
    
    # 2. If provider is missing, try to find it from allauth
    if not user.provider:
        social_account = SocialAccount.objects.filter(user=user).first()
        if social_account:
            user.provider = social_account.provider
            
    # 3. CRITICAL: Save the changes to the database!
    user.save(update_fields=['login_count', 'provider'])