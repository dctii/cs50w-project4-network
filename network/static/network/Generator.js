document.addEventListener('DOMContentLoaded', function() {
    // Hide Profile View
    document.querySelector('#profileView').style.display = 'none';
    /*  https://bit.ly/3vaPhYP 'CS50Web 2020: Lecture 6 Notes /Single Page Applications'
        https://bit.ly/3BaMC5n 'Introduction to the JavaScript history pushState() method'
        https://bit.ly/3RTP06B 'JavaScript Window History'
        https://mzl.la/3z9yBCi 'History.pushState()'
        https://bit.ly/3ve50GW 'GeekLaunch: pushState and popstate (YouTube.com)'
        Enables a history of state changes to occur on the page
    */
    window.history.pushState('', 'http://127.0.0.1:8000/');

    // If view of a followed profile is called, then do this
    if(document.getElementById('followingView')) {
        // When clicking on an element with the HTML id 'followingView', then do this
        document.getElementById('followingView').addEventListener('click', () => {
            // Hide the view of all posts
            document.querySelector('#postView').style.display = 'none';
            // Generate the posts that belong to the authors that the logged-in user is following
            generatePosts("/followed", 1);
            // Hide the profileView in case the user tries to navigate to the followingView while viewing a user's profile
            document.querySelector('#profileView').style.display = 'none';
            console.log(`View for posts that the user is following has been produced successfully.`)
        });
    }
    // By default, generate all posts
    generatePosts("", 1);
});

// Generates the list of all existing posts and pagination parameters
function generatePosts(pageNum, page) {
    // When the page number includes a '?' delimiter symbol, then do this
    if (pageNum.includes("?") === true) {
        // Add the page number to the query to call the posts from those pages
        pageNum += `&page=${page}`;
    // Otherwise, do this by default
    } else {
        pageNum += `?page=${page}`;
    }

    // Console message to show us the query string
    console.log(`Page Query: ${pageNum}`);
    // Get the page number via urls.py path
    fetch(`/generate${pageNum}`)
    .then(response => response.json())
    .then(response => {
        // Get list of posts
        document.getElementById('postsList').innerHTML="";
        // Run pagination generator
        generatePagination(pageNum, page, response.pagesSum);
        // For each post, run the Post Boostrap card for each post
        response.posts.forEach(post => generatePostCard(post));
        // Console message to show what page is being viewed
        console.log(`View for page `+page+` posts successfully produced.`)
    })
}


// Pagination generator
function generatePagination(pageNum, page, pagesSum) {
    // Container for pagination ID
    paginationContainer = document.getElementById('pagination');
        paginationContainer.innerHTML = "";
    
    // Previous Page Pagination Element
    const prevBtn = document.createElement('li');
        // If there is only one page, then disable the previous button
        if(page == 1){
            prevBtn.className = "page-item disabled";

        // Otherwise, do not disable the button and generate posts for the previous page of the current one
        } else {
            prevBtn.className = "page-item";    
            prevBtn.addEventListener('click', () => generatePosts(pageNum, page-1));
        }
    
    // Include a link on prevBtn
    const prevLink = document.createElement('a');
        prevLink.className = "page-link";
        prevLink.href = "#";
        // The display text is a left-facing caret
        prevLink.innerHTML = `<i class="fa fa-caret-left">`;
    // Append the link to prevBtn
    prevBtn.append(prevLink);
    // Append the prevBtn to the pagination controller
    paginationContainer.append(prevBtn);
    
    // Page Numbers Pagination Element
    for (let i = 1; i <= pagesSum; i++) {
        // Specific Page Button Element
        const pagesBtn = document.createElement('li');
            // If on the page that was selected, then do this
            if(i == page) {
                // If there is only one page, then disable the page button
                if(pagesSum == 1){
                    pagesBtn.className = "page-item disabled";
                // Otherwise, don't disable it and set whichever page is selected as active
                } else {
                    pagesBtn.className = "page-item active";
                }
            // Otherwise, set an event listener to run when clicking on page #i
            } else {
                pagesBtn.className = "page-item";    
                pagesBtn.addEventListener('click', () => generatePosts(pageNum, i));
            }
        // Include links for each of the pages
        const pagesLinks = document.createElement('a');
            pagesLinks.className = "page-link";
            pagesLinks.href = "#";
            // Set the display text to be whatever number 'i' is for the generated page button
            pagesLinks.innerHTML = i;
        // Append links to the page button
        pagesBtn.append(pagesLinks);
        
        // Append every pageBtn to the pagination controller
        paginationContainer.append(pagesBtn);
    }
    
    // Next Page Pagination Element
    const nextBtn = document.createElement('li');
    // If there is only one page, then disable the next button    
    if(page == pagesSum){
        nextBtn.className = "page-item disabled";
    
    // Otherwise, do not disable the button and generate posts for the next page of the current one
    } else {
        nextBtn.className = "page-item";    
        nextBtn.addEventListener('click', () => generatePosts(pageNum, page+1));
    }

    // Include a link on nextBtn
    const nextLink = document.createElement('a');
        nextLink.className = "page-link"; 
        nextLink.href = "#";
        // The display text is a right-facing caret
        nextLink.innerHTML = `<i class="fa fa-caret-right">`;
    // Append the link to nextBtn
    nextBtn.append(nextLink);
    // Append the nxtBtn to the pagination controller
    paginationContainer.append(nextBtn);
}


// Bootstrap Card generator for Posts
function generatePostCard(post) {
    // Card container for the post
    const postCard = document.createElement('div');
    postCard.id = `postCard-${post.postId}`;
    postCard.className = "card col col-6 shadow my-3 px-0";
    // https://bit.ly/3Ow5OgN 'Bootstrap 4 Card Deck Fixed Card Width'
    // Set custom width for the card container so it doesn't conflict with other CSS preconfiguration for cards across the website
    postCard.style = "max-width: 25rem;"

    // Card header which includes the username and user profile photo
    const postCardHeader = document.createElement('div');
        postCardHeader.id = `postCardHeader-${post.postId}`;
        postCardHeader.className = "card-header profile pb-0 pt-0";
        postCardHeader.title = "Click to go to this user's profile."
        // Header includes the relative username, profile photo, and post date
        postCardHeader.innerHTML = `<div class="p-1">
                                    <img class="img-responsive rounded-circle mb-1" src="`+post.authorProfilePhoto+`" width="30" />
                                    <b class="pl-2">` + post.authorUsername + `</b> 
                                    <span class="mb-3" profile-created-date style="font-size:75%"> on <i>` + post.postDate + `</i></span>`;
        // Event listener that will take the user to the posts's user when clicking on the card header
        postCardHeader.addEventListener('click', () => {
            // Generate posts for the profile
            generatePosts(`?profile=${post.authorId}`, 1);
            // Hide the all posts view
            document.querySelector('#postView').style.display = 'none';
            // Set element for the follow button
            followBtn = document.getElementById('followButton'); 
            followBtn.style.display = 'none';
            // Display a profileView block
            document.querySelector('#profileView').style.display = 'block';
            
            // Get the profile for the unique author ID
            fetch(`/profile/${post.authorId}`)
            .then(response => response.json())
            .then(profile => {
                // For sum of those the user is following, provide this HTML input -- (e.g., 1 Following)
                document.getElementById('followingSum').innerHTML = profile.profileFollowing + `&nbsp;Following`;
                // For sum of followers the user has
                    // If there is only one follower, provide the sum and the singular 'Follower'
                if (profile.profileFollowers == 1) {
                    document.getElementById('followersSum').innerHTML = profile.profileFollowers + `&nbsp;Follower`;
                    // If there is more than one follower, provide the same except with the pluralized 'Followers'
                } else {
                    document.getElementById('followersSum').innerHTML = profile.profileFollowers + `&nbsp;Followers`;
                }
                // If there is a profile photo for the user, then do this
                if(profile.profilePhoto !== null) {
                    document.getElementById('profilePhoto').innerHTML = `<div class="bg-white p-1 text-center">
                                                                        <img class="img-responsive rounded-circle" src="`+profile.profilePhoto+`" width="180" />`;
                // Otherwise, include a generic user photo
                } else {
                    document.getElementById('profilePhoto').innerHTML = `<div class="bg-white p-1 text-center">
                                                                            <img class="img-responsive rounded-circle" src="https://upload.wikimedia.org/wikipedia/commons/2/2b/Grey_-_Squared_-_User_archive_%28Deus_WikiProjects%29.png" width="180" />
                                                                            </div>`;
                }
                // Display a generic user Font Awesome icon and the user's user name -- for the NavBar
                document.getElementById('profileUsername').innerHTML= `<h3 style="color:rgb(0, 140, 255)">
                                                                        <i class="fa fa-user pr-2"></i>` + profile.profileUsername + 
                                                                        `</h3>`;

                // Console message returning successful production of profile view
                console.log(`Profile view for user '`+profile.profileUsername+`' successfully produced.`);

                // If the profile being viewed is able to be followed, then do this
                if(profile.profileFollowable) {
                    // https://mzl.la/3cFN9SJ 'unset'
                    followBtn.style.display = 'unset';
                    // If the logged-in user is following the viewed profile, then display the text 'Unfollow' on the follow button
                    if(profile.isFollowing === true) {
                        followBtn.innerHTML = 'Unfollow';
                    // If the logged-in user is not following the viewed profile, then display the text 'Follow' on the follow button
                    } else {
                        followBtn.innerHTML = 'Follow';
                    }
                    // Event listener for clicking the follow button
                    followBtn.addEventListener('click', () => {
                        // Get the follow toggle function from views.py for the viewed profile
                        fetch(`/profile/${post.authorId}/follow_toggle`)
                        .then(response => response.json())
                        .then(response => {
                            // For the follow button
                            followBtn = document.getElementById('followButton');
                            // If the user is being followed, then change the display text from 'Follow' to 'Unfollow'
                            if (response.followed == true) {
                                followBtn.innerHTML = "Unfollow";
                                // Console message from the response
                                console.log(response)
                                // Console message reporting that the user of the profile is now being followed
                                console.log(`Successfully following user '`+profile.profileUsername+`'.`)
                            // Otherwise, if the user is not being followed, then change the display text from 'Unfollow' to 'Follow'
                            } else {
                                followBtn.innerHTML = "Follow";
                                // Console message from the response
                                console.log(response)
                                // Console message reporting that the user of the profile is no longer being followed
                                console.log(`Successfully unfollowing user '`+profile.profileUsername+`'.`)
                            }
                            // If there is only one follower, then change to a singular 'Follower'
                            if (response.followersCount == 1) {
                                document.getElementById('followersSum').innerHTML= response.followersCount + `&nbsp;Follower`;
                                console.log(`Updated '`+profile.profileUsername+`' to `+response.followersCount+` follower.`)
                            // Otherwise, keep it or change it to the plural 'Followers'
                            } else {
                                document.getElementById('followersSum').innerHTML= response.followersCount + `&nbsp;Followers`;
                                console.log(`Updated '`+profile.profileUsername+`' to `+response.followersCount+` followers.`)
                            }
                        });
                    })
                }
            })
            // When clicking on the card header, it will return the user back to the topmost part of the page
            window.scrollTo(0, 0);
        });
    // Append the header information to the card container
    postCard.append(postCardHeader);
    
    // Card body which includes the post author's content and like toggler
    const postCardBody = document.createElement('div');
        postCardBody.className = "card-body border-bottom-0";
        postCardBody.id = `postCardBody-${post.postId}`;
    
    // The message of the user's post
    const authorContent = document.createElement('p');
        authorContent.className = "card-text";
        authorContent.id = `authorContent-${post.postId}`;
        authorContent.innerHTML = post.authorContent;
    // Append the content to the card body
    postCardBody.append(authorContent);

    // The subdivision of the card body which holds the like toggler
    const postCardBodySub = document.createElement('div');
        postCardBodySub.id = `postCardBodySub-${post.postId}`;
        postCardBodySub.className = "row align-items-center";

    // The like toggler
    const likeToggle = document.createElement('i');
        likeToggle.id = `likeToggle-${post.postId}`;
        // If the post is already liked by the logged-in user, then do not include a suffix to 'fa-heart', so it apears as a filled heart
        if(post.isLiked == true) {
            likeToggle.className = `fa fa-heart text-danger pl-3 pr-1`;
        // If the post is not already liked by the logged-in user, then suffix 'fa-heart' with '-o' to include an unfilled, outlined heart
        } else {
            likeToggle.className = `fa fa-heart-o text-danger pl-3 pr-1`;
        }

    // The pre-existing likes for the page when initially generated
    const likesSum = document.createElement('div');
        likesSum.id = `likesSum-${post.postId}`;
        likesSum.className = "card-text likeToggle pl-1";
    // If one like on the post, then singularize 'like'
        if(post.postLikes == 1){
            likesSum.innerHTML = post.postLikes + `&nbsp;like`;
        // Otherwise, then pluralize 'like'
        } else {
            likesSum.innerHTML = post.postLikes + `&nbsp;likes`;
        }

        // If able to be in followingView, it signals that the user is logged and says to then do this
            // Since getElementById('postView') and getElementById('profileView') is available to guest users, then it cannot be considered as a view limited to being logged-in
        if(document.getElementById('followingView'))  {
            // Event listener to activate the like toggle function
            likeToggle.addEventListener('click', () => {
                fetch(`/post/${post.postId}/like_toggle`)
                .then(response => response.json())
                .then(response => {
                    // If the post is already liked by the user, then do this
                    if (response.liked === true) {
                        // For the given postId, generate a filled heart with these attributes
                        document.getElementById(`likeToggle-${post.postId}`).className = "fa fa-heart text-danger pl-3 pr-1";
                        // Return a message that the specific postId has been liked for the author of the post
                        console.log(`Post #`+post.postId+` by user '`+post.authorUsername+`' liked successfully.`)

                    } else {
                        // For the given postId, generate an unfilled, open heart with these attributes
                        document.getElementById(`likeToggle-${post.postId}`).className = "fa fa-heart-o text-danger pl-3 pr-1";
                        // Return a message that the specific postId has been unliked for the author of the post
                        console.log(`Post #`+post.postId+` by user '`+post.authorUsername+`' unliked successfully.`)
                    }
                    // If there is only one like, then singularize 'like'
                    if(response.likesCount == 1){
                        document.getElementById(`likesSum-${post.postId}`).innerHTML = response.likesCount + `&nbsp;like`;
                        // Otherwise, then pluralize 'like'
                    } else {
                        document.getElementById(`likesSum-${post.postId}`).innerHTML = response.likesCount + `&nbsp;likes`;
                    }
                })
            });
        // Otherwise, redirect the user, who is not logged-in, to the login path
        } else {
            likeToggle.addEventListener('click', () => {
                document.getElementById('login').click()
                console.log(`Redirected to 'login'. User must be logged in to like posts.`)
                alert("Must be logged in to like posts.")
            });
        }
    // Append the like toggler to the subdivision of the card body
    postCardBodySub.append(likeToggle);
    // Append likes sum to the subdivision of the card body, which will be juxtaposed to the right of the heart icon
    postCardBodySub.append(likesSum);

    // Append the body's subdivision to the card's body
    postCardBody.append(postCardBodySub);
    // Append the card's body to the card container
    postCard.append(postCardBody);
    
    // If the post is able to be edited, because it belongs to the logged-in user, then do this
    if(post.postEditable === true) {
        // Card footer
        const postCardFooter = document.createElement('div');
            postCardFooter.id = `postCardFooter-${post.postId}`;
            postCardFooter.className = "card-footer border-0 p-0";
            
        // Generate a button for the card footer
        const postEdit = document.createElement('button');
            postEdit.className = "card-text col-auto btn btn-secondary profile btn-block rounded-bottom rounded-top-0";
            postEdit.innerHTML = "Edit";
            // Event listener that will run the editPost function when clicking
            postEdit.addEventListener('click', () => {
                editPost(post);
                // Console message saying whether or not the click function was heard or not
                console.log(`'Edit Post' click function heard.`)
            });

        // Append the Edit button to the card's footer
        postCardFooter.append(postEdit);
        // Append the card footer to the card container
        postCard.append(postCardFooter);
    }

    // Row to hold a card container, made to create a 1 x (n) vertical list
    const postRow = document.createElement('div');
        postRow.className = "row justify-content-center";
    // Append the card container, and its contents, to the row
    postRow.append(postCard);

    // Append the row, and its appended card container, to the queried list of posts, generating
    document.querySelector('#postsList').append(postRow);
}

// Edit Post function
function editPost(post) {
    // Call pre-generated structures and content that is to have its states modified for editing mode
    const postCardBody = document.getElementById(`postCardBody-${post.postId}`);
    const postCardBodySub = document.getElementById(`postCardBodySub-${post.postId}`); 
    const authorContent = document.getElementById(`authorContent-${post.postId}`);

    // Edit Post structure section defined
    const postEditor = document.createElement('div');
        postEditor.className = "row justify-content-center";
    
    // Edit textarea input box
    const postEditorTextBox = document.createElement('input');
        postEditorTextBox.id = `userEditedText-${post.postId}`;
        postEditorTextBox.type = "textarea";
        postEditorTextBox.className = "form-control rounded-0 col-8";
        // Set max character length of the editing box
        postEditorTextBox.maxLength = "280"
        // Prepopulate the box with the original content
        postEditorTextBox.value = authorContent.innerHTML;

    // Save button for edited content
    const saveEdit = document.createElement('button');
        saveEdit.className = "btn btn-success rounded-0 rounded-left col-auto";
        saveEdit.type = "button";
        // Font Awesome check icon
        saveEdit.innerHTML = `<i class="fa fa-check" style="color:white;"></i>`;
        saveEdit.addEventListener('click', () => {
            /*  https://bit.ly/3OsuJlE '1.9 Reading and Writing Strings for Cookies'
                https://mzl.la/3J2FLgn 'Document.cookie'
                Function to retrieve the CSRF token value that allows the user to edit the post for their session
                */
            function getCookie(name) {
                // Take the CSRF token value and separate the value on the right operand of the equation
                const csrfTokenValue = `${document.cookie}`.split(`${name}=`);
                if (csrfTokenValue.length === 2) {
                    // *** Use this to explain what the cookies does
                    return csrfTokenValue.pop().split().shift();
                }
            }
            // Set constant for the edited text for the post
            const userEditedText = document.getElementById(`userEditedText-${post.postId}`).value;
            // Go to the submit_post path with the put method
            fetch(`/submit_post`, {
                method: 'PUT',
                headers: {
                    'X-CSRFToken': getCookie("csrftoken")
                },
                body: body = JSON.stringify({
                post_id: post.postId,
                user_edited_text: userEditedText,
                })
            })
            // Return a message saying if the CSRF token has been retrieved for the edit during the user's session
            .then (console.log(`CSRF Token retrieved.`))
            .then(response => response.json())
            .then(response => {
                // If the edited post is saved, then do this
                if(response.savePost === true) {
                    // Replace the original content with the edit
                    authorContent.innerHTML = userEditedText;
                    // Provide a browser alert that the edit was successful
                    alert("Edit successful!")
                    // Console message of the response, should return as 'true'
                    console.log(response)
                    // Console message saying the edit for the relative post id for the relative author was successful and include the edited message
                    console.log(`Successfully edited Text for Post #`+post.postId+` by user '`+post.authorUsername+`' : "`+userEditedText+`"`)
                // Otherwise, do this
                } else {
                    // Provide a browser alert saying it was not possible to edit
                    alert("Unable to edit.");
                    // Console message, savePost, should be 'false' if unable to edit
                    console.log(response)
                    // Console message saying it was not possible to edit
                    console.log(`Unable to edit.`)
                }
                // When finishing editing, remove the postEditor division and its contents
                postEditor.remove();
                postEditorTextBox.remove();
                // When finishing editing, re-append postCardBodySub and the authorContent
                postCardBody.append(authorContent);
                postCardBody.append(postCardBodySub);
            })
        })

    // Cancel edit button
    const cancelEdit = document.createElement('button');
        cancelEdit.className = "btn btn-danger rounded-0 rounded-left col-auto";
        cancelEdit.type = "button";
        // Font Awesome cross icon
        cancelEdit.innerHTML = `<i class="fa fa-times" style="color:white;"></i>`;
        // Event listener to end editing mode without making any changes upon click
        cancelEdit.addEventListener('click', () => {
            // Remove the postEditor container and the editing textfield box
            postEditor.remove();
            postEditorTextBox.remove();
            // Append the original author content and the subdivision of the card's body
            postCardBody.append(authorContent);
            postCardBody.append(postCardBodySub);
            // Console message that the edit has been cancelled successfully
            console.log("Edit cancelled successfully.")
        });

    // Remove the authorContent and the postCardBodySub for the specific post
    document.getElementById(`authorContent-${post.postId}`).remove();
    document.getElementById(`postCardBodySub-${post.postId}`).remove();
    // Append the save edit button, the cancel edit button, and the input box
    postEditor.append(saveEdit);
    postEditor.append(postEditorTextBox);
    postEditor.append(cancelEdit);
    // Append the postEditor container to the postCardBody
    postCardBody.append(postEditor);
    // Console message that editing mode was successfully produced into view
    console.log(`'Edit Post View' sucessfully produced.`)
}