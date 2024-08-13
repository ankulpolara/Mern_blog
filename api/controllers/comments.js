const Comment = require('../model/Comment'); // Adjust the path as necessary
const Post = require('../model/Post');
const User = require('../model/User'); // Assuming you have a User model

// Controller function to get comments by post ID
exports.getCommentsByPost = async (req, res) => {
  const { postId } = req.params;

  try {
    // Fetch comments related to the specified post
    const comments = await Comment.find({ post: postId })
    .populate('author', 'userName ImageURL email')
    .sort({ createdAt: -1 });

    if (!comments) {
      return res.status(404).json({ message: 'No comments found for this post.' });
    }

    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// module.exports = {
//   getCommentsByPost,
// };





//  submit comment handler 
// controllers/commentController.js


exports.submitComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = new Comment({
      post: postId,
      author: userId,
      content: content,
    });

    await newComment.save();

    // Push the comment ID into the post's comments array
    post.comments.push(newComment._id);
    await post.save();

    // Populate the post with comments and authors for each comment
    const populatedPost = await Post.findById(postId)
      .populate({
        path: 'comments',
        populate: { path: 'author' },
      })
      .populate('author'); // Also populate the post's author if needed

    res.status(201).json({ success: true, post: populatedPost, message: "Comment submitted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};







// delete coomments   
exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    // Find the comment by ID
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if the user is the author of the comment
    if (comment.author.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }

    // Get the associated post ID from the comment
    const postId = comment.post;

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    // Remove the comment reference from the post's comments array
    await Post.findByIdAndUpdate(postId, {
      $pull: { comments: commentId }
    });

    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({success:false , error: 'Server error' });
  }
};

