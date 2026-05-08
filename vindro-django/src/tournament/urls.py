from django.urls import path
from . import views

app_name = 'tournament'

urlpatterns = [
    # Tournament list & detail
    path('', views.tournament_list, name='tournament_list'),
    path('<slug:tournament_slug>/', views.tournament_detail, name='tournament_detail'),
    path('<uuid:tournament_id>/results/', views.tournament_results, name='tournament_results'),

    # Plays
    path('<uuid:tournament_id>/user-plays/', views.user_tournament_plays),
    path('<uuid:tournament_id>/create/', views.create_new_play),
    # OPTION 2: fetch by tournament slug + user ID + play name (shareable URL)
    path('plays/<slug:tournament_slug>/<int:user_id>/<str:play_name>/', views.tournament_play_detail_by_name),
    # [UUID detail — kept for reference, superseded by tournament_play_detail_by_name]
    # path('plays/<uuid:play_id>/', views.tournament_play_detail),
    path('plays/<uuid:play_id>/update-groups/', views.update_groups),
    path('plays/<uuid:play_id>/update-bracket/', views.update_bracket),

    # Pools
    path('<uuid:tournament_id>/user-pool-submissions/', views.user_pool_submissions),
    path('<uuid:tournament_id>/pools/join/', views.pool_join, name='pool_join'),
    path('<uuid:tournament_id>/pools/create/', views.pool_create, name='pool_create'),
    # OPTION 2: fetch by pool name (shareable URL, auth optional)
    path('pools/name/<str:pool_name>/', views.pool_detail_by_name),
    # [UUID detail — kept for reference, superseded by pool_detail_by_name]
    # path('pools/<uuid:pool_id>/', views.pool_detail, name='pool_detail'),
    path('pools/<uuid:pool_id>/leave/', views.pool_leave, name='pool_leave'),
    path('pools/<uuid:pool_id>/plays/<uuid:play_id>/remove/', views.pool_remove_play, name='pool_remove_play'),
    path('pools/<uuid:pool_id>/plays/<uuid:play_id>/paid/', views.toggle_paid, name='toggle_paid'),
    path('pools/<uuid:pool_id>/payout/', views.pool_payout_config, name='pool_payout_config'),

    # Leaderboard — unified endpoint for any pool (public or private)
    path('pools/<uuid:pool_id>/leaderboard/', views.pool_leaderboard, name='pool_leaderboard'),
]
