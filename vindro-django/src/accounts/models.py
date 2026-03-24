from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model with simplified fields:
    - id (auto)
    - username
    - email
    - avatar
    - date_joined (from AbstractUser)
    """
    avatar = models.URLField(
        blank=True,
        default='/img/profile_icons/teal-simple.webp',
        help_text='URL to user avatar image'
    )

    def __str__(self):
        return self.username

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
