from django.contrib import admin
from .models import Tournament, TournamentFormat, TournamentPlay, TournamentPool, PoolMembership


class TournamentFormatInline(admin.StackedInline):
    model = TournamentFormat
    extra = 0


@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ['name', 'tournament_type', 'status', 'start_date', 'end_date']
    list_filter = ['status', 'tournament_type']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [TournamentFormatInline]


@admin.register(TournamentPlay)
class TournamentPlayAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'tournament', 'status', 'current_phase', 'score', 'created_at']
    list_filter = ['status', 'current_phase', 'tournament']
    search_fields = ['name', 'user__username']
    raw_id_fields = ['user', 'tournament']


@admin.register(TournamentPool)
class TournamentPoolAdmin(admin.ModelAdmin):
    list_display = ['name', 'tournament', 'is_public', 'current_member_count', 'created_by']
    list_filter = ['is_public', 'tournament']
    search_fields = ['name']


@admin.register(PoolMembership)
class PoolMembershipAdmin(admin.ModelAdmin):
    list_display = ['pool', 'play', 'joined_at']
    raw_id_fields = ['pool', 'play']
