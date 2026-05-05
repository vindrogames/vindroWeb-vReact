from django.contrib.auth.models import AbstractUser
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.db import models


class User(AbstractUser):
    """
    Custom user model with simplified fields and OAuth provider tracking and login count:
    - id (auto)
    - username
    - email
    - avatar
    - provider: Which OAuth provider was used (google, github, facebook)
    - login_count: Number of times this user has logged in
    - date_joined (from AbstractUser)
    """
    username = models.CharField(
        max_length=21,
        unique=True,
        validators=[UnicodeUsernameValidator()],
        error_messages={'unique': 'A user with that username already exists.'},
        help_text='Required. 21 characters or fewer. Letters, digits and @/./+/-/_ only.',
    )

    avatar = models.URLField(
        blank=True,
        default='/img/profile_icons/teal-simple.webp',
        help_text='URL to user avatar image'
    )

    provider = models.CharField(
        max_length=20,
        choices=[
            ('google', 'Google'),
            ('github', 'GitHub'),
            ('facebook', 'Facebook'),
        ],
        null=True,
        blank=True,
        help_text='OAuth provider used for authentication'
    )
    
    login_count = models.IntegerField(
        default=0,
        help_text='Number of times user has logged in'
    )

    def __str__(self):
        return self.username

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
