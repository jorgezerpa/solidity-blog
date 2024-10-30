// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Blog {
    struct Post {
        uint256 id;
        string title;
        string content;
        address author;
        uint256 timestamp;
        uint256 likes;
        uint256 dislikes;
        bool isTokenized;
    }
    
    Post[] public posts;
    mapping(address => Post[]) public userPosts;
    
    function createPost(string memory _title, string memory _content) public {
        Post memory newPost = Post(posts.length, _title, _content, msg.sender, block.timestamp, 0, 0, false);
        posts.push(newPost);
        userPosts[msg.sender].push(newPost);
    }
    
	function getPost(uint256 _postId) public view returns (Post memory) {
        return posts[_postId];
    }
    
	function getPosts() public view returns (Post[] memory) {
        return posts;
    }
    
		function updatePost(uint256 _postId, string memory _newTitle, string memory _newContent) public {
        require(msg.sender == posts[_postId].author, "Only the author can update the post");
        posts[_postId].title = _newTitle;
        posts[_postId].content = _newContent;
    }

		function likePost(uint256 _postId) public {
        posts[_postId].likes++;
    }

    function dislikePost(uint256 _postId) public {
        posts[_postId].dislikes++;
    }
}