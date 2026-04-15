from django.urls import path
from . import views

app_name = 'tournament'

urlpatterns = [
    # Tournament list & detail
    path('', views.tournament_list, name='tournament_list'),
    path('<slug:tournament_slug>/', views.tournament_detail, name='tournament_detail'),
    path('<uuid:tournament_id>/results/', views.tournament_results, name='tournament_results'),

    # Plays
    # path('<uuid:tournament_id>/plays/', views.play_list_create, name='play_list_create'),
    # path('<slug:tournament_slug>/plays/', views.play_list_create, name='play_list_create'),
    # path('plays/<uuid:play_id>/', views.play_detail, name='play_detail'),
    # path('plays/<uuid:play_id>/submit/', views.play_submit, name='play_submit'),
    # Matches: /api/tournament/world-cup-2026/my-plays/
    path('<uuid:tournament_id>/user-plays/', views.user_tournament_plays),

    # Matches: /api/tournament/world-cup-2026/create/
    path('<uuid:tournament_id>/create/', views.create_new_play),
    path('plays/<uuid:play_id>/', views.tournament_play_detail),
    path('plays/<uuid:play_id>/update-groups/', views.update_groups),
    path('plays/<uuid:play_id>/update-bracket/', views.update_bracket),
    # path('plays/<uuid:play_id>/group_stage', views.tournament)
    # Fallback for UUID lookup: /api/tournament/plays/UUID/
    # path('plays/<uuid:play_id>/', views.get_play_by_id),
    # path('plays/<uuid:play_id>/submit/', views.finalize_tournament_play),

    # Pools
    path('<uuid:tournament_id>/pools/', views.pool_list_create, name='pool_list_create'),
    path('<uuid:tournament_id>/pools/join/', views.pool_join, name='pool_join'),
    path('pools/<uuid:pool_id>/leaderboard/', views.pool_leaderboard, name='pool_leaderboard'),
]
