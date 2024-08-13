const express = require('express');

const { createPost, getAllFreshPosts, getPostById, toggleLike, getPostsByCategory, searchPosts, getPostsByUser, UpdatePost, DeletePost } = require('../controllers/Post');
const { authenticateToken } = require('../middleware/auth');
const { getCommentsByPost, submitComment, deleteComment } = require('../controllers/comments');


const router = express.Router();

// Route to handle blog image upload
// router.post('/blogImage-upload', PostImageHandler);
router.post('/create-post', authenticateToken, createPost);

// update post   by post id 
// router.post('/post/update/:postId', authenticateToken, updatePost);
router.post("/post/update/:postId",authenticateToken  ,UpdatePost)



// Get all fresh new posts
router.get('/fresh-posts', getAllFreshPosts);

// search post 
router.get('/search', searchPosts);


// Define the route to get posts by category with pagination
router.get('/posts/category/:category', getPostsByCategory);




// Route to get a single post by ID
router.get('/posts/:id', getPostById)

// get all the post off the particular user   
router.get('/user/posts/:userId', getPostsByUser)

// Route to submit a comment
router.post("/post/:postId/comment" ,authenticateToken ,submitComment)

// Route to get all comments for a particular post
router.get('/post/:postId/comments', getCommentsByPost);

// delete comment  
router.delete('/comments/:commentId', authenticateToken, deleteComment);
// delete post by id   
router.delete('/posts/:postId', authenticateToken ,DeletePost)



router.post('/post/:postId/:type', authenticateToken, toggleLike);



module.exports = router;
