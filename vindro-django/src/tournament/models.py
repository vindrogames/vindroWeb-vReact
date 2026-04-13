from uuid import uuid4
from django.db import models
from django.db.models import UniqueConstraint
from django.contrib.auth import get_user_model

User = get_user_model()


class Tournament(models.Model):
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('active', 'Active'),
        ('completed', 'Completed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    tournament_type = models.CharField(max_length=50)  # "world_cup", "champions_league"
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True)

    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    groups_end_date = models.DateTimeField()
    bracket_start_date = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return self.name


class TournamentFormat(models.Model):
    tournament = models.OneToOneField(
        Tournament, on_delete=models.CASCADE, related_name='format'
    )
    # The static skeletons from your .py files
    groups_stage = models.JSONField(default=dict)    
    bracket_stage = models.JSONField(default=dict)   
    
    # Results (can stay empty until the tournament starts)
    groups_results = models.JSONField(default=dict, blank=True)
    bracket_results = models.JSONField(default=dict, blank=True)
    
    is_seeded = models.BooleanField(default=False) 
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Format — {self.tournament.name}'


class TournamentPlay(models.Model):
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('submitted', 'Submitted'),
        ('completed', 'Completed'),
    ]

    PHASE_CHOICES = [
        ('groups', 'Groups'),
        ('bracket', 'Bracket'),
        ('review', 'Review'),
        ('submitted', 'Submitted'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    tournament = models.ForeignKey(
        Tournament, on_delete=models.CASCADE, related_name='plays'
    )

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='tournament_plays'
    )

    name = models.CharField(max_length=100)

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=['user', 'tournament', 'name'], 
                name='unique_play_name_per_user_per_tournament'
            )
        ]

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    current_phase = models.CharField(max_length=20, choices=PHASE_CHOICES, default='groups')
    group_predictions = models.JSONField(default=dict)
    bracket_predictions = models.JSONField(default=dict)
    score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} — {self.name} ({self.tournament.name})'


class TournamentPool(models.Model):
    """
    Leaderboard group. Every tournament gets one auto-created public pool ("vindroPool").
    Users can create private pools shared via a join code.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    tournament = models.ForeignKey(
        Tournament, on_delete=models.CASCADE, related_name='pools'
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_pools',
        null=True,
        blank=True,
    )
    
    is_public = models.BooleanField(default=False)
    code_hash = models.CharField(max_length=255, unique=True, null=True, blank=True)
    current_member_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['tournament'],
                condition=models.Q(is_public=True),
                name='unique_public_pool_per_tournament',
            )
        ]

    def __str__(self):
        return f'{self.name} ({self.tournament.name})'


class PoolMembership(models.Model):
    pool = models.ForeignKey(
        TournamentPool, on_delete=models.CASCADE, related_name='memberships'
    )
    play = models.ForeignKey(
        TournamentPlay, on_delete=models.CASCADE, related_name='pool_memberships'
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [('pool', 'play')]

    def __str__(self):
        return f'{self.play} in {self.pool}'
