const mongoose = require('mongoose');
const moment = require('moment-timezone');

const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim :true 
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true
  },
  likesCount: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Array of user IDs who liked the post
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment', // Assuming you have a Comment model
    default: null
  }],
  tags: [{
    type: String
  }],
  category: {
    type: String,
    trim: true,
    required :true

  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date,
    default: () => moment().tz('Asia/Kolkata').toDate()
  },
  blogImage: {
    type: String,
    default: null
  }
});

// Middleware to automatically update the updatedAt field
postSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
