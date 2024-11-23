import { router } from "./index.js";
import userController from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.js";

const userRouter = router;

// Route for registering a new user
userRouter.post("/register", userController.register);

// Route for verifying user's email
userRouter.get("/verify-email", userController.verifyUser);

// Route for user login
userRouter.post("/login", userController.login);

// Route for fetching the current logged-in user's profile
userRouter.get("/me", authMiddleware, userController.me);

// Route for updating a user's details (including image upload)
userRouter.patch(
  "/update",
  [
    upload.fields([
      {
        name: "image", // Field for uploading user's image
        maxCount: 1,
      },
    ]),

    authMiddleware, // Authentication middleware to ensure only authenticated users can update
  ],
  userController.update
);

// Route for sending a connection request to another user
userRouter.post(
  "/send-connection-request/:userId",
  authMiddleware,
  userController.sendConnectionRequest
);

// Route for accepting a connection request from another user
userRouter.post(
  "/accept-connection-request/:userId",
  authMiddleware,
  userController.acceptConnectionRequest
);

// Route for rejecting a connection request from another user
userRouter.post(
  "/reject-connection-request/:userId",
  authMiddleware,
  userController.rejectConnectionRequest
);

// Routes for fetching all the connections of user
userRouter.get('/connections', authMiddleware, userController.getConnectionsList)
// Routes for fetching all the pending connections of user
userRouter.get('/connections/pending', authMiddleware, userController.getPendingConnectionsList)

// Route for fetching the list of users with optional filters and pagination
userRouter.get("/users", authMiddleware, userController.getUsers);

// Route for fetching the single user
userRouter.get('/user/:userId', authMiddleware, userController.getSingleUser);

export default userRouter;
