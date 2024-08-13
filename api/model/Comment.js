const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post', // Reference to the Post model
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create the Comment model
const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
