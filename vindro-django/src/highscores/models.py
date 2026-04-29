from django.conf import settings
from django.db import models


class Gamescore(models.Model):
    """
    Flexible highscore model supporting multiple games
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='gamescores'
    )
    game_name = models.CharField(
        max_length=100,
        db_index=True,
        help_text="Name of the game (e.g., 'snake', 'tetris', 'pong')"
    )
    game_score = models.IntegerField(
        help_text="Player's score for this game session"
    )

    game_time = models.CharField(
        max_length=50,
        help_text="Time spent in this game session (in seconds)"
    )

    game_metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional game-specific data (level reached, time played, etc.)"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True
    )
    

    def __str__(self):
        return f"{self.user.username} - {self.game_name}: {self.game_score}"

    class Meta:
        verbose_name = 'Gamescore'
        verbose_name_plural = 'Gamescores'
        ordering = ['-game_score', '-created_at']
        indexes = [
            models.Index(fields=['game_name', '-game_score']),
            models.Index(fields=['user', 'game_name', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]
