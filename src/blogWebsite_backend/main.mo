import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Nat64 "mo:base/Nat64";
import Buffer "mo:base/Buffer";
import List "mo:base/List";
import Types "Types";
import Fuzz "mo:fuzz";

actor BLOGWEBSITE {

  //initialize the random text generator
  let fuzz = Fuzz.Fuzz();

  //USER
  // get a way to store the data for the users
  let authorStore = HashMap.HashMap<Principal, Types.User>(0, Principal.equal, Principal.hash);

  //store the post data
  let postStore = HashMap.HashMap<Text, Types.Post>(1, Text.equal, Text.hash);

  // let text = Fuzz.text.randomAlphabetic(10);

  //adding user profile
  public shared ({ caller }) func add_user(_username : Text, _displayName : Text, _bio : ?Text) : async Result.Result<(), Text> {
    switch (authorStore.get(caller)) {
      case (null) {

        let newUser : Types.User = {
          userName = _username;
          displayName = _displayName;
          createdTime = Time.now();
          updatedTime = null;
          bio = _bio;
        };
        //store the data
        authorStore.put(caller, newUser);
        return #ok();

      };
      case (?data) { return #err("User already registered") };
    };

  };

  //editing the profile

  public shared ({ caller }) func edit_user(_username : Text, _displayName : Text, _bio : ?Text) : async Result.Result<(), Text> {

    switch (authorStore.get(caller)) {
      case (null) { return #err("no user found") };
      case (?data) {

        let editedUser : Types.User = {
          userName = _username;
          displayName = _displayName;
          createdTime = data.createdTime;
          updatedTime = ?Time.now();
          bio = _bio;
        };

        //store the date
        authorStore.put(caller, editedUser);
        return #ok();
      };
    };

  };

  //deleting the profile
  public shared ({ caller }) func delete_user() : async Result.Result<(), Text> {
    authorStore.delete(caller);
    return #ok();
  };

  //getting the profile
  public query func get_user_profile(user : Principal) : async Result.Result<Types.User, Text> {
    switch (authorStore.get(user)) {
      case (null) { return #err("no user found") };
      case (?data) { return #ok(data) };
    };
  };

  //get all the users.
  public query func get_all_users() : async [(Principal, Types.User)] {
    Iter.toArray<(Principal, Types.User)>(authorStore.entries());
  };

  //POSTS

  //adding a new post
  public shared ({ caller }) func add_post(title : Text, content : Text) : async Result.Result<(), Text> {

    let newPost = {
      userId = caller;
      createdTime = Time.now();
      title;
      content;
      comments = List.nil<Types.Comment>();
    };

    let postID = fuzz.text.randomAlphabetic(10);
    postStore.put(postID, newPost);
    return #ok();
  };

  //editing a post
  public shared ({ caller }) func edit_post(postID : Text, title : Text, content : Text) : async Result.Result<(), Text> {
    switch (postStore.get(postID)) {
      case (null) { return #err("no post with id" # postID # "found") };
      case (?post) {
        if (caller != post.userId) {
          return #err("not authorized");
        };

        postStore.put(postID, { post with content = content; title = title });
        return #ok();
      };
    };
  };

  //deleting a post

  public func delete_post(postID : Text) : async Result.Result<(), Text> {
    postStore.delete(postID);
    return #ok();
  };

  public query func get_post_by_id(postID : Text) : async ?Types.Post {
    return postStore.get(postID);
  };

  //get all posts
  public query func get_all_posts() : async [(Text, Types.Post)] {
    Iter.toArray<(Text, Types.Post)>(postStore.entries());
  };

  //get posts by a specific user
  public query func get_posts_by_user(user : Principal) : async [Types.Post] {
    var tempPosts = Buffer.Buffer<Types.Post>(0);
    for (post in postStore.vals()) {
      if (post.userId == user) {
        tempPosts.add(post);
      };
    };
    return Buffer.toArray<Types.Post>(tempPosts);
  };

  //store the comments for each post

  //COMMENT

  var commentTrackID : Nat64 = 0;

  //add a comment

  public shared ({ caller }) func add_comment(_postID : Text,_comment : Text) : async Result.Result<(), Text> {

    switch (postStore.get(_postID)) {
      case (null) { return #err("no post found") };
      case (?post) {

        var comments = post.comments;

        comments := List.push<Types.Comment>(
          {
            commentId = commentTrackID;
            userId = caller;
            createdTime = Time.now();
            content = _comment

          },
          comments,
        );
        postStore.put(_postID, { post with comments = comments });
        commentTrackID := commentTrackID +1;
        return #ok();

      };
    };

  };

  //deleting a comment

  public shared ({ caller }) func delete_comment(_postID : Text, _commentID : Nat64) : async Result.Result<(), Text> {
    switch (postStore.get(_postID)) {
      case (?post) {

        if (caller != post.userId) {
          return #err("you are not authorized");
        };

      var comments = post.comments;
      comments := List.filter<Types.Comment>(comments, func comm { comm.commentId !=_commentID });
        postStore.put(_postID, { post with comments = comments });
        return #ok();
      };

      case (null) { return #err("no post found") };
    };
  };

  //get comments for a specific post
  public query func get_commnets_for_a_specific_post(_postID : Text) : async [Types.Comment] {
    switch (postStore.get(_postID)) {
      case (null) { return [] };
      case (?posts) { return List.toArray<Types.Comment>(posts.comments )};
    };

  };

  //edit the comment

  public shared ({ caller }) func edit_comment(_postID : Text, _commentID : Nat64, _newContent : Text) : async Result.Result<(), Text> {

    switch (postStore.get(_postID)) {
      case (null) { return #err("no post found") };
      case (?post) {

        var comments = post.comments;

        if (caller != post.userId) {
          return #err("you are not authorized");
        };

        switch(List.find<Types.Comment>(comments, func sub { sub.commentId == _commentID })) {
          case(?comment) { 
            
            var tempData = comment;
            tempData := { comment with content = _newContent };

                  var tempList = List.filter<Types.Comment>(comments, func hack { hack.commentId != _commentID });
                  tempList := List.push(tempData, comments);
                  ignore postStore.replace(_postID, {post with comments=tempList});
           };
          case(null) { return #err("no comment with that id found")};
        };

        

        

        return #ok();

      };
    };

  };

};

//delete a commemt
//edit the comment
//get comments for a specific post.
