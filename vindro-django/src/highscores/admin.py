"""
Django admin configuration for highscores
"""
from django.contrib import admin
from .models import Gamescore


@admin.register(Gamescore)
class HighscoreAdmin(admin.ModelAdmin):
    list_display = ('user', 'game_name', 'score', 'created_at')
    list_filter = ('game_name', 'created_at')
    search_fields = ('user__username', 'game_name')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-score', '-created_at')

    fieldsets = (
        ('Game Information', {
            'fields': ('game_name', 'score')
        }),
        ('Player Information', {
            'fields': ('user',)
        }),
        ('Additional Data', {
            'fields': ('game_metadata',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        qs = super().get_queryset(request)
        return qs.select_related('user')
