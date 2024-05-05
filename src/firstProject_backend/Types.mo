import Nat64 "mo:base/Nat64";
import Principal "mo:base/Principal";

module {
    public type UserId = Principal;

    public type User = {
        userName: Text;
        displayName: Text;
        createdTime: Int;
        updatedTime:?Int;
        bio: ?Text;
    };

    public type Post = {
        userId: UserId;
        createdTime: Int;
        title: Text;
        content: Text;
        comments:[Comment]
    };

   public type Comment = {
        commentId: Nat64;
        userId: UserId;
        createdTime: Int;
        content: Text;
    };
}