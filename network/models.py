from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.utils.html import mark_safe

class User(AbstractUser):
    pass

# Model for an author profiles
class Profile(models.Model):
    # Link the registered user information to their profile, which is needed for follow status and permission data
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # Image that can be uploaded by the admin for a user's profile photo
        # To improve this, this could be appended to the ProfileForm and the user can upload their own image URL to set their own profile photo
    image = models.CharField(max_length=2048)
    # Followers for the given user
    followers = models.ManyToManyField(User, related_name="profiles_followed")

    # https://bit.ly/3PNd9cU 'Serializing Django objects'
    # List of mapping variables for use with JavaScript
    def serialize(self,user):
        return {
            # Return the user's Profile ID
            "profileId": self.user.id,
            # Return the user's profile photo
            "profilePhoto": self.image,
            # Return the user's username
            "profileUsername": self.user.username,
            # Return the number of followers the user has
            "profileFollowers": self.followers.count(),
            # Return the number of authors the user is following
            "profileFollowing": self.user.profiles_followed.count(),
            # Return whether or not the user is able to follow a given user and if the logged-in-user or a non-logged-in-user is viewing their own profile, then they will not be followable
            "profileFollowable": (not user.is_anonymous) and self.user != user,
            # Return whether or not it is true that the user is following the author being viewed, unavailable to a not-logged-in-user and logged-in-user viewing themselves
            "isFollowing": not user.is_anonymous and self in user.profiles_followed.all(),
        }
    
    # Thumbnail to view in the admin panel for Profile model
    def image_tag(self):
        return mark_safe('<img src="%s" width="50" height="50">' % (self.image))

# Model for an author posts
class Post(models.Model):
    # Author information sourced from the Profile model
    author = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="author")
    # Current date of any newly created post
    post_date = models.DateTimeField(default=timezone.now)
    # Text an author includes in their post, limited to 280 like twitter
    content = models.CharField(max_length=280)
    # Likes on a given post
    likes = models.ManyToManyField(Profile, blank=True, related_name="filter_like_status")

    # https://bit.ly/3PNd9cU 'Serializing Django objects'
    # List of mapping variables for use with JavaScript
    def serialize(self, user):
        return {
            # Return the ID # for the post
            "postId": self.id,
            # Return the author's ID # for the Post model
            "authorId": self.author.id,
            # Return the author's user name, derived from the class Profile model, further derived from the User model
            "authorUsername": self.author.user.username,
            # Return the profile photo for the author, derived from the class Profile model
            "authorProfilePhoto":self.author.image,
            # Return the content of the author's post
            "authorContent": self.content,
            # Return a timestamp that the post was created
            "postDate": self.post_date.strftime("%b %d %Y @ %I:%M %p"),
            # Return the count of likes on the given post
            "postLikes": self.likes.count(),
            # If the logged-in user has liked posts or not, filter them relative to the user
            "isLiked": not user.is_anonymous and self in Profile.objects.filter(user=user).first().filter_like_status.all(),
            # Posts are editable for posts that belong to the logged in user
            "postEditable": self.author.user == user
        }
