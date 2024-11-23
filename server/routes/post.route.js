import { router } from "./index.js";
import postController from "../controllers/post.controller.js";
import authMiddleware from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.js";

const postRouter = router;

// Route for creating a new post
postRouter.post(
  "/create",
  [
    upload.fields([
      {
        name: "image", // Field for uploading post image
        maxCount: 1,
      },
    ]),

    authMiddleware, // Authentication middleware to ensure only authenticated users can update
  ], // Ensure the user is authenticated before creating a post
  postController.createPost
);

// Route for fetching all posts (with optional pagination)
postRouter.get(
  "/",
  authMiddleware, // Ensure the user is authenticated before fetching posts
  postController.getAllPosts
);

// Route for fetching a single post by ID
postRouter.get(
  "/:postId",
  authMiddleware, // Ensure the user is authenticated before fetching a specific post
  postController.getPostById
);

// Route for updating an existing post (including image upload)
postRouter.patch(
  "/:postId/update",
  [
    upload.fields([
      {
        name: "image", // Field for uploading post image
        maxCount: 1,
      },
    ]),

    authMiddleware, // Authentication middleware to ensure only authenticated users can update
  ],
  postController.updatePost
);

// Route for deleting a post
postRouter.delete(
  "/:postId/delete",
  authMiddleware, // Authentication middleware to ensure only authenticated users can delete
  postController.deletePost
);

// Route for liking a post
postRouter.post(
  "/:postId/like",
  authMiddleware, // Ensure the user is authenticated before liking a post
  postController.likePost // Assuming you have a `likePost` function in the controller
);

// Route for unliking a post
postRouter.post(
  "/:postId/unlike",
  authMiddleware, // Ensure the user is authenticated before unliking a post
  postController.unlikePost // Assuming you have a `unlikePost` function in the controller
);

postRouter.get(
  "/liked/posts",
  authMiddleware,
  postController.getUserLikedPosts
);

// Route for commenting on a post
postRouter.post(
  "/:postId/comment",
  authMiddleware, // Ensure the user is authenticated before commenting
  postController.commentOnPost // Assuming you have a `commentOnPost` function in the controller
);

// Route for getting comments on a particular post
postRouter.get(
  "/:postId/comments",
  authMiddleware,
  postController.getCommentsForPost
);

// Route for deleting a comment on a post
postRouter.delete(
  "/:postId/comment/:commentId/delete",
  authMiddleware, // Ensure the user is authenticated before deleting a comment
  postController.deleteComment // Assuming you have a `deleteComment` function in the controller
);

export default postRouter;
