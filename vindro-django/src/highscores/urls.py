"""
URL configuration for highscores app
"""
from django.urls import path
from . import views

app_name = 'gamescores'

urlpatterns = [
    path('create/', views.create_highscore, name='create_highscore'),
    path('', views.list_highscores, name='list_highscores'),
    path('me/', views.my_highscores, name='my_highscores'),
    path('<int:gamescore_id>/', views.delete_highscore, name='delete_highscore'),
]
