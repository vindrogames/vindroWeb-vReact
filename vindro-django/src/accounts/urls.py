from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('logout/', views.logout_view, name='logout'),
    path('me/', views.current_user, name='current_user'),
    path('oauth/redirect/', views.oauth_redirect, name='oauth_redirect'),
]
