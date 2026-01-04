"""
Management command to setup Google OAuth provider
Usage: python manage.py setup_google_oauth <client_id> <client_secret>
"""
import os
import sys
from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp


class Command(BaseCommand):
    help = 'Setup Google OAuth provider'

    def add_arguments(self, parser):
        parser.add_argument('client_id', type=str, help='Google OAuth Client ID')
        parser.add_argument('client_secret', type=str, help='Google OAuth Client Secret')

    def handle(self, *args, **options):
        client_id = options['client_id']
        client_secret = options['client_secret']

        # Get or create the site
        site = Site.objects.get_current()

        # Determine site domain based on environment
        # Check if we're in production (DEBUG=False) or use env variable
        is_production = os.environ.get('DJANGO_DEBUG', 'False') != 'True'

        if is_production:
            # Production domain
            site_domain = 'vindrogames.com'
            backend_url = 'https://backend.vindrogames.com'
        else:
            # Development domain
            site_domain = 'localhost:5173'
            backend_url = 'http://localhost:8000'

        # Update site domain if needed
        if site.domain != site_domain:
            site.domain = site_domain
            site.name = 'Vindrogames'
            site.save()
            self.stdout.write(self.style.SUCCESS(f'Updated site: {site.domain}'))

        # Check if Google provider already exists
        try:
            google_app = SocialApp.objects.get(provider='google')
            google_app.client_id = client_id
            google_app.secret = client_secret
            google_app.save()
            google_app.sites.add(site)
            self.stdout.write(self.style.SUCCESS('✅ Google OAuth provider updated!'))
        except SocialApp.DoesNotExist:
            # Create new Google OAuth app
            google_app = SocialApp.objects.create(
                provider='google',
                name='Google OAuth',
                client_id=client_id,
                secret=client_secret,
            )
            google_app.sites.add(site)
            self.stdout.write(self.style.SUCCESS('✅ Google OAuth provider created!'))

        self.stdout.write(self.style.SUCCESS('\n📋 Configuration:'))
        self.stdout.write(f'  Provider: {google_app.provider}')
        self.stdout.write(f'  Name: {google_app.name}')
        self.stdout.write(f'  Client ID: {google_app.client_id[:20]}...')
        self.stdout.write(f'  Site: {site.domain}')
        self.stdout.write(self.style.SUCCESS('\n🚀 Google OAuth is ready!'))
        self.stdout.write('\nOAuth endpoints:')
        self.stdout.write(f'  Login: {backend_url}/accounts/google/login/')
        self.stdout.write(f'  Callback: {backend_url}/accounts/google/login/callback/')
