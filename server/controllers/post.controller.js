import { Post } from "../model/post.model.js"; // Assuming a Post model exists
import { User } from "../model/user.model.js"; // Assuming a User model exists for liking/unliking posts
import createHttpError from "http-errors";
import uploadOnCloudinary from "../services/cloudinary.js"; // For image uploads
import postSchema from "../validator/postSchema.js"; // Assuming a post validation schema exists
import { Like } from "../model/like.model.js";
import { Comment } from "../model/comment.model.js";

const postController = {
  // Create a new post
  async createPost(req, res, next) {
    const { error } = postSchema.validate(req.body);
    if (error) {
      return next(createHttpError(400, error.message));
    }

    const { title, content } = req.body;
    const authorId = req.user.id; // Assuming user ID is available from middleware

    try {
      let imageUrl;
      // If an image is uploaded, upload to Cloudinary
      if (req.files && req.files.image && req.files.image[0]) {
        const imageFile = req.files.image[0];
        imageUrl = await uploadOnCloudinary(imageFile.buffer);
      }

      const newPost = new Post({
        title,
        content,
        author: authorId,
        image: imageUrl,
      });

      const savedPost = await newPost.save();

      res
        .status(201)
        .json({ message: "Post created successfully!", post: savedPost });
    } catch (err) {
      next(createHttpError(500, err.message));
    }
  },

  // Fetch all posts with optional pagination
  async getAllPosts(req, res, next) {
    const { page = 1, limit = 10 } = req.query;
  
    try {
      // Fetch all posts with pagination
      const posts = await Post.find()
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate("author", "name email image") // Populate author data
        .sort({ createdAt: -1 })
        .select("-__v"); // Exclude __v field
  
      const totalPosts = await Post.countDocuments();
  
      // Loop over the posts to add like count, comment count, and comments with details
      const postsWithDetails = await Promise.all(
        posts.map(async (post) => {
          // Fetch like count for each post
          const likeCount = await Like.countDocuments({ post: post._id });
  
          // Fetch comments with user details for each post
          const comments = await Comment.find({ post: post._id })
            .populate("user", "name email image") // Populate commenter details
            .select("-__v"); // Exclude unnecessary fields
  
          return {
            ...post.toObject(),
            likeCount,       // Add like count to post object
            commentCount: comments.length,  // Calculate comment count
            comments,        // Include full comment details
          };
        })
      );
  
      res.status(200).json({
        posts: postsWithDetails,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          totalPosts,
        },
      });
    } catch (err) {
      console.log(err.message);
      next(createHttpError(500, err.message));
    }
  },
  

  // Fetch a single post by ID
  async getPostById(req, res, next) {
    const { postId } = req.params;

    try {
      const post = await Post.findById(postId).populate(
        "author",
        "name email image"
      );
      if (!post) {
        return next(createHttpError(404, "Post not found"));
      }

      // Fetch like count for the post
      const likeCount = await Like.countDocuments({ post: post._id });

      // Fetch comment count for the post
      const commentCount = await Comment.countDocuments({ post: post._id });

      // Return post with like and comment counts
      const postWithCounts = {
        ...post.toObject(),
        likeCount,
        commentCount,
      };

      res.status(200).json(postWithCounts);
    } catch (err) {
      next(createHttpError(500, err.message));
    }
  },
  // Update a post
  async updatePost(req, res, next) {
    const { postId } = req.params;
    const { title, content } = req.body;

    try {
      const post = await Post.findById(postId);
      if (!post) {
        return next(createHttpError(404, "Post not found"));
      }

      // Check if the logged-in user is the author of the post
      if (post.author.toString() !== req.user.id) {
        return next(createHttpError(403, "Unauthorized to update this post"));
      }

      // If an image is uploaded, update the image
      let imageUrl = post.image;
      if (req.files && req.files.image && req.files.image[0]) {
        imageUrl = await uploadOnCloudinary(req.files.image[0].buffer);
      }

      // Update post data
      post.title = title || post.title;
      post.content = content || post.content;
      post.image = imageUrl;

      const updatedPost = await post.save();
      res
        .status(200)
        .json({ message: "Post updated successfully", updatedPost });
    } catch (err) {
      next(createHttpError(500, err.message));
    }
  },

  // Delete a post
  async deletePost(req, res, next) {
    const { postId } = req.params;

    try {
      const post = await Post.findById(postId);
      if (!post) {
        return next(createHttpError(404, "Post not found"));
      }

      // Check if the logged-in user is the author
      if (post.author.toString() !== req.user.id) {
        return next(createHttpError(403, "Unauthorized to delete this post"));
      }
      // Delete all likes associated with the post
      await Like.deleteMany({ post: postId });

      // Delete all comments associated with the post
      await Comment.deleteMany({ post: postId });

      await Post.findByIdAndDelete(postId);
      res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
      next(createHttpError(500, err.message));
    }
  },

  // Like a post
  async likePost(req, res, next) {
    const { postId } = req.params;
    const userId = req.user.id;

    try {
      // Check if the post exists
      const post = await Post.findById(postId);
      if (!post) {
        return next(createHttpError(404, "Post not found"));
      }

      // Check if the user has already liked the post
      const existingLike = await Like.findOne({ post: postId, user: userId });
      if (existingLike) {
        return next(createHttpError(400, "Post already liked"));
      }

      // Create and save a new like record
      const newLike = new Like({ post: postId, user: userId });
      await newLike.save();

      res.status(200).json({ message: "Post liked successfully" });
    } catch (err) {
      next(createHttpError(500, err.message));
    }
  },

  // Unlike a post
  async unlikePost(req, res, next) {
    const { postId } = req.params;
    const userId = req.user.id;

    try {
      // Check if the post exists
      const post = await Post.findById(postId);
      if (!post) {
        return next(createHttpError(404, "Post not found"));
      }

      // Check if the like exists
      const existingLike = await Like.findOne({ post: postId, user: userId });
      if (!existingLike) {
        return next(createHttpError(400, "Post not liked by user"));
      }

      // Remove the like from the Like collection
      await Like.deleteOne({ _id: existingLike._id });

      res.status(200).json({ message: "Post unliked successfully" });
    } catch (err) {
      next(createHttpError(500, err.message));
    }
  },
  async getUserLikedPosts(req, res, next) {
    console.log("Hii");
    const userId = req.user.id;
    console.log(userId);

    try {
      // Find all likes by the user
      const likedPosts = await Like.find({ user: userId }).select("post");

      // Check if the user has liked any posts
      if (likedPosts.length === 0) {
        return res
          .status(200)
          .json({ message: "No liked posts found", likedPosts: [] });
      }

      // Extract post IDs from the results
      const postIds = likedPosts.map((like) => like.post);

      res.status(200).json({ likedPosts: postIds });
    } catch (err) {
      next(createHttpError(500, err.message));
    }
  },
  // Comment on a post
  async commentOnPost(req, res, next) {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    try {
      // Check if the post exists
      const post = await Post.findById(postId);
      if (!post) {
        return next(createHttpError(404, "Post not found"));
      }

      // Create a new comment in the Comment collection
      const newComment = new Comment({
        user: userId,
        post: postId,
        content,
      });

      // Save the new comment
      await newComment.save();

      // Return the new comment
      res.status(200).json({
        message: "Comment added successfully",
        comment: newComment,
      });
    } catch (err) {
      next(createHttpError(500, err.message));
    }
  },
  async getCommentsForPost(req, res, next) {
    const { postId } = req.params;

    try {
      // Find all comments for the post
      const comments = await Comment.find({ post: postId })
        .populate("user", "name email image") // Populate user data (e.g., name, email, image)
        .sort({ createdAt: -1 }); // Sort comments by creation date (latest first)

      if (!comments) {
        return next(createHttpError(404, "No comments found for this post"));
      }

      res.status(200).json({
        comments,
      });
    } catch (err) {
      next(createHttpError(500, err.message));
    }
  },

  // Delete a comment
  async deleteComment(req, res, next) {
    const { postId, commentId } = req.params;
    const userId = req.user.id;

    try {
      const post = await Post.findById(postId);
      if (!post) {
        return next(createHttpError(404, "Post not found"));
      }

      const comment = post.comments.id(commentId);
      if (!comment) {
        return next(createHttpError(404, "Comment not found"));
      }

      // Only the user who created the comment or the post author can delete it
      if (
        comment.user.toString() !== userId &&
        post.author.toString() !== userId
      ) {
        return next(
          createHttpError(403, "Unauthorized to delete this comment")
        );
      }

      comment.remove();
      await post.save();
      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err) {
      next(createHttpError(500, err.message));
    }
  },
};

export default postController;
