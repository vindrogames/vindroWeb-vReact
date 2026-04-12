from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        """
        Called when Django app is ready.
        This registers signal handlers for social authentication.
        """
        import accounts.signals  # Import to register signal handlers