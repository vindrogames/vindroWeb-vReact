from uuid import uuid4
from django.db import models
from django.db.models import UniqueConstraint, Q    
from django.contrib.auth import get_user_model

User = get_user_model()


class Tournament(models.Model):
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),   # announced, not yet open for picks
        ('open', 'Open'),           # accepting predictions
        ('in_play', 'In Play'),     # games being played, no predictions
        ('closed', 'Closed'),       # tournament is over
    ]

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    tournament_type = models.CharField(max_length=50)  # "world_cup", "champions_league"
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    card_info = models.JSONField(default=dict, blank=True)

    start_date = models.DateTimeField()
    entries_close = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField()
    groups_end_date = models.DateTimeField()
    bracket_start_date = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return self.name

    @property
    def group_stage_status(self):
        from django.utils import timezone
        if self.status in ('upcoming', 'closed'):
            return self.status
        now = timezone.now()
        if now < self.start_date:
            return 'open'
        if now < self.groups_end_date:
            return 'in_play'
        return 'closed'

    @property
    def bracket_stage_status(self):
        from django.utils import timezone
        if self.status in ('upcoming', 'closed'):
            return self.status
        now = timezone.now()
        if now < self.groups_end_date:
            return 'upcoming'
        if now < self.bracket_start_date:
            return 'open'
        if now < self.end_date:
            return 'in_play'
        return 'closed'


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
    name = models.CharField(max_length=28)

    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='plays')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tournament_plays')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    current_phase = models.CharField(max_length=20, choices=PHASE_CHOICES, default='groups')

    slug = models.CharField(max_length=28, blank=True, default='')

    group_predictions = models.JSONField(default=dict)
    bracket_predictions = models.JSONField(default=dict)

    group_points = models.IntegerField(default=0)
    group_points_spent = models.IntegerField(default=0)
    bracket_points = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            UniqueConstraint(
                fields=['user', 'tournament', 'name'],
                name='unique_play_name_per_user_per_tournament'
            ),
            UniqueConstraint(
                fields=['user', 'tournament', 'slug'],
                name='unique_play_slug_per_user_per_tournament'
            ),
        ]

    def __str__(self):
        return f'{self.user.username} — {self.name} ({self.tournament.name})'


class TournamentPool(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='pools')
    name = models.CharField(max_length=28, unique=True)

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
    join_code = models.CharField(max_length=16, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # MONEY FEATURES
    is_money_pool = models.BooleanField(default=False)
    cost_per_play = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=3, default='€', blank=True)

    # SETTINGS
    allow_multiple_plays_per_user = models.BooleanField(default=True)

    # PAYOUTS  {position_str: integer_percent}  e.g. {"1": 60, "2": 30, "3": 10}
    payout_config = models.JSONField(default=dict, blank=True)

    slug = models.SlugField(max_length=28, unique=True, blank=True, default='')

    # ADDITION: The 'through' relationship for easier querying
    members = models.ManyToManyField(
        TournamentPlay, 
        through='PoolMembership', 
        related_name='pools'
    )

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
    pool = models.ForeignKey('TournamentPool', on_delete=models.CASCADE, related_name='pool_memberships')
    play = models.ForeignKey('TournamentPlay', on_delete=models.CASCADE, related_name='play_memberships')
    
    # NEW: Money tracking for private/money pools
    has_paid = models.BooleanField(default=False, help_text="Tracks if the user has paid the entry fee for this specific play.")
    
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Ensures a user cannot put the exact same Play into a Pool twice.
        # However, they CAN put 'Play A' and 'Play B' into the same Pool.
        unique_together = [('pool', 'play')]
        verbose_name = "Pool Membership"
        verbose_name_plural = "Pool Memberships"

    def __str__(self):
        return f"{self.play.name} ({self.play.user.username}) in {self.pool.name}"
