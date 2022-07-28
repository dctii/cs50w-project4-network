from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django import forms
from django.contrib.auth.decorators import login_required

# https://docs.djangoproject.com/en/4.0/topics/auth/default/#django.contrib.auth.forms.UserChangeForm 'Using the Django authentication system: class UserChangeForm'
from django.contrib.auth.forms import UserChangeForm

# https://docs.djangoproject.com/en/4.0/ref/paginator/ 'Paginator'
from django.core.paginator import Paginator

import json

from .models import *

# Profile Edit Form
class ProfileForm(UserChangeForm):
    # Disable password-field-related information from appearing
    password = None
    class Meta:
        # Model that we retrieve fields from
        model = User
        # Fields from the model to include
        fields = ['username', 'email']
        # Set input type and appearance of the form fields for the user to interface with
        widgets = {
            'username': forms.TextInput(attrs={
                'class': 'w-50 form-control bg bg-light',
                'style': 'border-right: 1px solid lightgrey;',
            }),
            'email': forms.TextInput(attrs={
                'class': 'w-50 form-control bg bg-light',
                'style': 'border-right: 1px solid lightgrey;',
            })
        }

# Sends the user home
def index(request):
    return render(request, "network/index.html")


# User login
def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)    
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


# User logout
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


# User registration
def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
            # Save the user information to the Profile model--will enable representation of the username when showing the Profile View on the website
            Profile(user=user).save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


# Function where the user can edit their profile username and e-mail
@login_required
def edit_user_profile(request):
    # Variable calling the ProfileForm for the logged-in user
    form = ProfileForm(request.POST or None, instance=request.user)

    # If the user is posting information, then it will call ProfileForm
    if request.method == 'POST':
        # If the form has no errors, then do this
        if form.is_valid():
            # https://bit.ly/3cHovRt 'Creating forms from models: The save() method'
            # Creates the form without saving
            profile_info = form.save(commit = False)
            # Calls the logged-in user
            profile_info.user = request.user
            # Saves the updated profile information
            profile_info.save()
            # Returns the form information
            return render(request, "network/edit_user_profile.html", {
                # Mapping variable for ProfileForm
                "form": form,
                # Boolean value passed to Django for a condition that will produce an alert that the save was successful
                "success":True
            })
        else:
            return render(request, "nework/edit_user_profile.html", {
                "form":form,
            })
    else:
        return render(request, "network/edit_user_profile.html", {
            "form":form
        })


# Function for creating new posts and post editing
@login_required
def submit_post(request):
    # When posting information, the text input and the poster's information with that text input is submitted and saved
    if request.method == "POST":
        form = Post(content=request.POST['content'])
        form.author = Profile.objects.get(user=request.user)
        form.save()
        return HttpResponseRedirect(reverse("index"))
    # When a user edits their post, call the existing content and then save the text in the input box whether changed or not changed
    elif request.method == "PUT":
        # Variable for pre-existing JSON data for the posts
        data = json.loads(request.body)
        # Variable the ID# of the post to-be-edited
        post_id = int(data["post_id"])
        # Variable for the text that will be present when saving the text in editing mode
        user_edited_text = data["user_edited_text"]
        # Variable that calls the post from the data base according to the ID, while reducing it to the first, most accurate object that is called
        post = Post.objects.filter(id=post_id).first()
        # If the editor of the post is not the author of the post, then return a 401 response
        if post.author.user != request.user:
            return HttpResponse(status=401)
        # The content field in the Post model is replaced with the content in the text input in editing mode
        post.content = user_edited_text
        # Save the information to the model
        post.save()
        # Return a JsonResponse where a "true" boolean value to the mapping variable "savePost", which passes to Generator.js permits the coordinated adjustment of the apperance of the post, reverting it back to the read-post mode
        return JsonResponse({
            "savePost": True
        })
    # When the user submits a post, it may take the user to the /submit_post path, so this is here if the user is on the /submit_post path and they use the "GET" method via refreshing the /submit_post path or trying to visit the /submit_post path manually.
    elif request.method == "GET":
        return HttpResponseRedirect(reverse("index"))
    # If none of the methods work, return an error
    else:
        return JsonResponse({
                "error": f"request methods supported: POST, PUT, GET"
            })


# Function that generates all posts, for logged-in and guest users
def generate_posts(request):
    # Variable for a user profile, so when the user clicks on the header of the card of a post, then it can identify which profile it will generate a view for
    profile = request.GET.get("profile", None)
    # When a specific profile is requested, then show all of the posts of that user on their profile
    if (profile):
        posts = Post.objects.filter(author=profile).all()
    # Otherwise, show all of the posts -- this is the default page
    else:
        posts = Post.objects.all()
    # Pass the conditions to the posts_by_page function
    return posts_by_page(request,posts)


# Function that creates pages, where for every 10 posts, a new page will be appeneded to hold the next 1-10 posts.
def posts_by_page(request, posts):
    # Variable for the order of posts by their post date, where the most recent dates will appear first
    posts = posts.order_by("-post_date").all()
    # Variable for Paginator class, takes in the post objects and sets a limit 10 objects for every page
    paginator = Paginator(posts, 10)
    # https://bit.ly/3PDwhuo 'Methods: Paginator.get_page(number)'
        # Variable for get_page method via the Django Paginator, which retrieves the objects for each page
    page = paginator.get_page(request.GET["page"])
    # Return JsonResponse with mapping variables that pass into Generator.js
    return JsonResponse({
        # Pass information from class Post in models.py to Generator.js
        "posts": [post.serialize(request.user) for post in page],
        # https://bit.ly/3z7eEft 'Paginator.num_pages'
            # With Django Paginator, pass the number pages to Generator.js
        "pagesSum": paginator.num_pages
        }
        # Allows any objects to be passed for serialization
        # https://bit.ly/3veDSHE 'Django JSON Response safe=False'
        , safe=False)


# Function for switching the boolen value for liked and not-liked of of a post
@login_required 
def like_toggle(request, post_id):
    # Variable for the called unique profile given the user who is currently logged-in
    profile = Profile.objects.filter(user=request.user).first()
    # Variable for the called unique post given the post_id
    post = Post.objects.get(id=post_id)
    # When the post to the logged-in user is liked by the user, then set the liked status of the post to false and remove it from the logged-in user's set of liked posts
    if post in profile.filter_like_status.all():
        liked_status = False
        post.likes.remove(profile)
    # Otherwise, set the liekd status of the post to true and add it to the logged-in user's set of liked posts
    else:
        liked_status = True
        post.likes.add(profile)
    # Save the post information
    post.save()
    # Return a JsonResponse with the updated information
    return JsonResponse({
        # Return the liked status
        "liked": liked_status, 
        # Return the updated count of likes on the post after the liked status has changed
        "likesCount": post.likes.count()
        })


# Function that returns profile information based on user ID
def profile(request, user_id):
    # Variable for the called unique profile given via the user_id
    profile = Profile.objects.filter(id=user_id).first()
    # Returns the serialized information of the called unique profile
    return JsonResponse(profile.serialize(request.user))


# Function for switching the boolen value for followed and not-followed of a user's profile
@login_required 
def follow_toggle(request, profile_id):
    # Variable for the called profile given the unique profile_id
    profile = Profile.objects.get(id=profile_id)
    # When the profile is followed by the logged-in user, then set the followed status of the profile for this user as false and remove the profile from the set of followed users of the user
    if profile in request.user.profiles_followed.all():
        followed_status = False
        profile.followers.remove(request.user)
    # Otherwise, set the followed status of the profile as false and remove the profile from the set
    else:
        followed_status = True
        profile.followers.add(request.user)
    # Update the logged-in user's information
    profile.save()
    # Return a JsonResponse with the updated information
    return JsonResponse({
        # Return the followed_status
        "followed": followed_status,
        # Return the updated count of followers on the post after the liked status has changed
        "followersCount": profile.followers.count()
        })


# Function where posts are generated and filtered by who the user is following
@login_required
def generate_following(request):
    # Variable for profiles that are being followed by the logged-in user
    followed_profiles = request.user.profiles_followed.all()
    # Variable for the Post model where the called posts belong to those the user is following
    posts = Post.objects.filter(author__in=followed_profiles).all()
    # Pass the conditions to the posts_by_page function, where the passed values are the request and the posts included in the foreset variables
    return posts_by_page(request,posts)