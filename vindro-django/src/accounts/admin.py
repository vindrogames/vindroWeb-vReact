from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'avatar', 'is_staff', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('avatar',)}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('avatar',)}),
    )


admin.site.register(User, UserAdmin)
