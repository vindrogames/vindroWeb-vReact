from django.test import TestCase
from django.contrib.auth.models import User
from .models import UserProfile


class UserRegistrationTestCase(TestCase):
    def test_user_creation(self):
        """Test user can be created"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpass123'))

    def test_user_profile_creation(self):
        """Test user profile is created"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        profile = UserProfile.objects.create(user=user)
        self.assertEqual(profile.user, user)
        self.assertEqual(profile.game_scores, {})
