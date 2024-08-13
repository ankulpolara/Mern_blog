const Post = require('../model/Post');
const User = require('../model/User');
const Comment = require('../model/Comment');
const { default: mongoose } = require('mongoose');

exports.createPost = async (req, res) => {
  const { title, content, tags, category, blogImage, description } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!title || !content || !tags || !description || !category || !blogImage || !userId) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields',
    });
  }

  try {
    // Create a new post
    const newPost = new Post({
      title,
      description,
      content,
      author: userId,
      tags,
      category,
      blogImage,
      status: 'draft',
    });

    // Save the post to the database
    const savedPost = await newPost.save();

    // Update the user's posts
    await User.findByIdAndUpdate(userId, {
      $push: { posts: savedPost._id }
    });

    // Respond with success and the saved post
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: savedPost,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};



// post update  by id    

exports.UpdatePost = async (req, res) => {
  const { postId } = req.params;
  const { title, content, tags, category, blogImage, description } = req.body;
  const userId = req?.user?._id
  console.log(postId, userId);
  console.log(req.body) 
  const newPostId = postId.slice(0,postId.length-1)
  // console.log("new id.....",  newId);
  

if (!mongoose.Types.ObjectId.isValid(newPostId)) {
  console.log("postId is not valid ///////////////////////");
  return res.status(400).json({ massage: 'Invalid post ID' });
}



  if (!newPostId || !title || !content || !tags || !description || !category || !blogImage || !userId) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields',
    });
  }

  try {
    // Find the post by ID and update it
    const updatedPost = await Post.findByIdAndUpdate(
      newPostId,
      {
        title,
        description,
        content,
        tags,
        category,
        blogImage,
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }


    console.log(toString(updatedPost.author ) , toString(userId) );
    
    // Ensure the user is the author of the post
    if (toString(updatedPost.author ) !== toString(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this post',
      });
    }

    // Respond with success and the updated post
    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      // data: updatedPost,
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({

      success: false,
      message: 'Server error',
    });
  }
};






// getting all post  

exports.getAllFreshPosts = async (req, res) => {
  try {
    // Extract pagination parameters from the request query
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 4;
    const skip = (page - 1) * limit;

    // Fetch posts with pagination
    const posts = await Post.find({})
      .select("title content blogImage _id description category publishedAt")
      .sort({ publishedAt: -1 }) // Sort by creation date in descending order
      .populate('author', 'userName email ImageURL') // Populate the author field with name and email
      .skip(skip) // Skip documents based on the current page
      .limit(limit) // Limit the number of documents returned
      .exec();

    // Get the total count of documents
    const totalPosts = await Post.countDocuments();

    res.status(200).json({
      success: true,
      message: 'Get all fresh blogs',
      data: posts,
      totalPosts: totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};










// search pospt  /////////////////////



// Search and pagination controller using aggregation
exports.searchPosts = async (req, res) => {
  try {
    // Extract search and pagination parameters from the request query
    const search = req.query.search || '';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 4;
    const skip = (page - 1) * limit;

    // Build aggregation pipeline
    const pipeline = [
      {
        $match: {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [search] } },
            { category: { $regex: search, $options: 'i' } }
          ]
        }
      },
      {
        $facet: {
          totalPosts: [{ $count: 'count' }],
          posts: [
            { $skip: skip },
            { $limit: limit }
          ]
        }
      },
      {
        $unwind: {
          path: '$totalPosts',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          totalPosts: { $ifNull: ['$totalPosts.count', 0] },
          posts: 1
        }
      }
    ];

    // Execute aggregation pipeline
    const results = await Post.aggregate(pipeline);

    // Check if posts are found
    if (results[0].posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No posts found matching the search criteria.',
      });
    }

    // Return response with results
    res.status(200).json({
      success: true,
      message: 'Search results',
      data: results[0].posts,
      totalPosts: results[0].totalPosts,
      totalPages: Math.ceil(results[0].totalPosts / limit),
      currentPage: page,
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};







// getPost by category 


// In your controller file

exports.getPostsByCategory = async (req, res) => {
  try {
    const { category } = req.params; // Extract the category from the route params
    const page = parseInt(req.query.page) || 1; // Get the page number from query params or default to 1
    const limit = parseInt(req.query.limit) || 4; // Set the limit for posts per page
    const skip = (page - 1) * limit; // Calculate the number of posts to skip

    // Ensure category is used correctly in the query
    const posts = await Post.find({ category }) // Query based on the category field
      .select("title content blogImage _id description category publishedAt") // Select the required fields
      .sort({ publishedAt: -1 }) // Sort by publication date, most recent first
      .populate('author', 'userName email ImageURL') // Populate the author field
      .skip(skip) // Skip the necessary number of posts for pagination
      .limit(limit) // Limit the results to the specified number
      .exec(); // Execute the query

    // Get the total number of posts in this category
    const totalPosts = await Post.countDocuments({ category });

    res.status(200).json({
      success: true,
      message: `Get all blogs for category: ${category}`,
      data: posts,
      totalPosts: totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};






// get single  post with all madatory data 



// Controller to get a single post by its ID
exports.getPostById = async (req, res) => {
  try {
    const postId = req.params.id;

    // Find the post by ID and populate related data
    const post = await Post.findById(postId)
      .populate({
        path: 'author',
        select: 'userName email ImageURL' // Adjust fields as needed
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'userName email ImageURL' // Adjust fields as needed
        }
      });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Send the post data as a response
    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// get post by userId user    fewtch all of of the what writen by user ; 








// Controller to get all posts by a specific user
exports.getPostsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find all posts where the author field matches the provided userId
    const posts = await Post.find({ author: userId }).populate("author", "userName email ImageURL")
      .sort({ publishedAt: -1 }).exec();

    // If no posts are found, return a message
    if (posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No posts found for this user',
      });
    }

    // Return the found posts
    return res.status(200).json({
      success: true,
      message: 'Posts fetched successfully',
      data: posts,
    });
  } catch (error) {
    // Handle any errors that occur during the query
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};






exports.DeletePost = async (req, res) => {
    try {
        const { postId } = req.params;

        // Find the post to delete
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Delete associated comments
        if (post.comments && post.comments.length > 0) {
            await Comment.deleteMany({ _id: { $in: post.comments } });
        }

        // Delete the post
        await Post.findByIdAndDelete(postId);

        return res.status(200).json({ success: true, message: 'Post and associated comments deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};


















// Toggle like/dislike for post
exports.toggleLike = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user ? req.user.id : null;
  const type = req.params.type; // 'like' or 'dislike'

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  try {
    const post = await Post.findById(postId)
      .populate('author', 'userName ImageURL email') // Populate author details
      .exec();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (type === 'like') {
      if (!post.likes.includes(userId)) {
        post.likes.push(userId);
        post.likesCount += 1;
        await post.save();

        return res.status(200).json({
          success: true,
          message: 'Post liked successfully',
          data: post, // Include author details within the post
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'User has already liked this post',
        });
      }
    } else if (type === 'dislike') {
      const index = post.likes.indexOf(userId);
      if (index > -1) {
        post.likes.splice(index, 1);
        post.likesCount -= 1;
        await post.save();

        return res.status(200).json({
          success: true,
          message: 'Like removed successfully',
          data: post, // Include author details within the post
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'User has not liked this post',
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid type parameter',
      });
    }
  } catch (error) {
    console.error('Error toggling like/dislike:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
