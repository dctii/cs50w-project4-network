from django.contrib import admin
from .models import *

# Registered models with custom display and custom list-view-editability

class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'date_joined', 'last_login')
admin.site.register(User, UserAdmin)

class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'post_date', 'content')
admin.site.register(Post, PostAdmin)

class ProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'image_tag', 'user', 'image')
    list_editable = ('image', 'image')
admin.site.register(Profile, ProfileAdmin)
