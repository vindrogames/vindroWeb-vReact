"""
URL configuration for highscores app
"""
from django.urls import path
from . import views

app_name = 'highscores'

urlpatterns = [
    path('', views.list_gamescores, name='list_gamescores'),
    path('create/', views.create_gamescore, name='create_gamescore'),
    path('me/', views.my_gamescores, name='my_gamescores'),
    path('<int:gamescore_id>/', views.delete_gamescore, name='delete_gamescore'),
]
