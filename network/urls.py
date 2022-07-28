
from django.urls import path

from . import views

urlpatterns = [
    # Home
        # Returns the user to the front page
    path("", views.index, name="index"),

    # User Login/out and Registration
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # Post Functions
        # For submitting newly-created posts and editing posts
    path("submit_post",views.submit_post, name="submit_post"),
        # For generating lists of posts
    path("generate",views.generate_posts, name="generate_posts"),
        # Filters generated lists of posts for those a logged-in user is following
    path("generate/followed",views.generate_following, name="generate_following"),
        # For toggling like/unlike of posts
    path("post/<int:post_id>/like_toggle",views.like_toggle,name="like_toggle"),

    # User Profile
        # Path to specified author's profile
    path("profile/<int:user_id>",views.profile, name="profile"),
        # For toggling follow/unfollow of an author's profile being viewed
    path("profile/<int:profile_id>/follow_toggle", views.follow_toggle, name="follow_toggle"),
        # For editing a logged-in user's username or e-mail
    path("profile/edit-profile", views.edit_user_profile, name="edit_user_profile")
]
