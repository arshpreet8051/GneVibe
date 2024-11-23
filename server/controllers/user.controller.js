import { JWT_SECRET } from "../config/index.js";
import { User } from "../model/user.model.js";
import sendVerificationEmail from "../services/nodemailer.js";
import userSchema from "../validator/registerSchema.js";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import loginSchema from "../validator/loginSchema.js";
import updateUserSchema from "../validator/updateSchema.js";
import uploadOnCloudinary from "../services/cloudinary.js";

const userController = {
  async register(req, res, next) {
    const { error } = userSchema.validate(req.body);

    if (error) {
      return next(createHttpError(400, error.message));
    }
    const { name, email, password, acadamics } = req.body;
    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        if (existingUser.isVerified) {
          // User exists and is verified
          return res
            .status(400)
            .json({ message: "User already exists. Please log in." });
        } else {
          // User exists but is not verified
          return res.status(400).json({
            message:
              "User already registered. Please verify your account first.",
          });
        }
      }
      // User doesnot exist
      const hashedPassword = await bcrypt.hash(password, 10);
      const emailToken = jwt.sign({ email: email }, JWT_SECRET);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        acadamics,
        verificationToken: emailToken,
      });

      const savedUser = await newUser.save();

      await sendVerificationEmail(savedUser, emailToken);

      res.json({
        message:
          "Registration successful! Please check your email to verify your account.",
      });
    } catch (err) {
      console.log(err.message);
      return next(500, "Internal server error");
    }
  },
  async verifyUser(req, res, next) {
    const token = req.query.token;

    try {
      const user = await User.findOne({ verificationToken: token });

      if (!user) {
        return res.status(400).send("Invalid token");
      }

      user.isVerified = true;
      user.verificationToken = undefined; // Clear the token after verification
      await user.save();

      res.redirect("http://localhost:3000/login");
    } catch (error) {
      res.status(500).send("Server error");
    }
  },
  async login(req, res, next) {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return next(createHttpError(400, error.message));
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return next(createHttpError(400, "Invalid email or password"));
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return next(createHttpError(400, "Invalid email or password"));
      }

      if (!user.isVerified) {
        return next(createHttpError(400, "Please verify your email first"));
      }

      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
        expiresIn: "10h",
      });

      res.json({ message: "Login successful", token });
    } catch (err) {
      return next(createHttpError(500, err.message));
    }
  },
  async me(req, res, next) {
    const { email, id } = req.user;

    try {
      const user = await User.findOne({
        $or: [{ email: email }, { _id: id }],
      }).select("-__v -password   -isVerified -createdAt -updatedAt ");
      if (!user) {
        return next(customErrorHandler.notFound("No user found!"));
      }
      return res.json(user);
    } catch (error) {
      return next(error);
    }
  },
  async update(req, res, next) {
    try {
      const { error } = updateUserSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const userId = req.user.id;
      const updateData = { ...req.body };
      const user = await User.findById(userId);
      if (!user) {
        return next(createHttpError(404, "User not found"));
      }

      if (req.body.branch || req.body.urn || req.body.yearOfAdmission) {
        updateData.acadamics = {
          branch: req.body.branch || user.acadamics.branch, // Keep old if not provided
          urn: req.body.urn || user.acadamics.urn, // Keep old if not provided
          yearOfAdmission:
            req.body.yearOfAdmission || user.acadamics.yearOfAdmission, // Keep old if not provided
        };
      }
      // If an image is uploaded, upload to Cloudinary
      let imageUrl;
      if (req.files && req.files.image && req.files.image[0]) {
        try {
          const imageFile = req.files.image[0];
          imageUrl = await uploadOnCloudinary(imageFile.buffer);
        } catch (error) {
          return next(createHttpError(500, "Error uploading image"));
        }
      }

      if (imageUrl) {
        updateData.image = imageUrl;
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true, // Return the updated document
        runValidators: true, // Ensure validation runs
      });

      if (!updatedUser) {
        return next(createHttpError(404, "User not found"));
      }

      res.status(200).json({
        message: "User updated successfully!",
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
  async sendConnectionRequest(req, res, next) {
    const { userId } = req.params; // Receiver's user ID
    const senderId = req.user.id; // Sender's user ID (from authMiddleware)

    if (userId === senderId) {
      return next(
        createHttpError(
          400,
          "You cannot send a connection request to yourself."
        )
      );
    }

    try {
      // Find the receiver user
      const receiver = await User.findById(userId);
      if (!receiver) {
        return next(createHttpError(404, "Receiver not found."));
      }

      // Check if the connection request already exists or is already connected
      if (receiver.pending_request.includes(senderId)) {
        return next(createHttpError(400, "Connection request already sent."));
      }

      if (receiver.connections.includes(senderId)) {
        return next(
          createHttpError(400, "You are already connected with this user.")
        );
      }

      // Add sender to receiver's pending requests
      receiver.pending_request.push(senderId);
      await receiver.save();

      // Return success response
      res.status(200).json({
        message: "Connection request sent successfully!",
      });
    } catch (err) {
      return next(createHttpError(500, err.message));
    }
  },
  async getPendingConnectionsList(req, res, next) {
    const userId = req.user.id;

    try {
      // Fetch the user with their pending connection requests populated
      const user = await User.findById(userId).populate({
        path: "pending_request", // Populate the pending_request field
        select: "name email image acadamics role", // Select relevant fields
      });

      if (!user) {
        return next(createHttpError(404, "User not found"));
      }

      // Extract the pending connections (requests from other users)
      const formattedPendingConnections = user.pending_request.map(
        (connection) => ({
          id: connection._id,
          name: connection.name,
          email: connection.email,
          image: connection.image,
          acadamics: connection.acadamics, // Include academic details if needed
          role: connection.role, // Include role details (student/mentor)
        })
      );

      res.status(200).json({
        pendingConnections: formattedPendingConnections,
        totalPendingConnections: formattedPendingConnections.length,
      });
    } catch (err) {
      console.error(err.message);
      next(createHttpError(500, "Failed to fetch pending connections"));
    }
  },
  // Accept connection request (receiver accepts the request)
  async acceptConnectionRequest(req, res, next) {
    const { userId } = req.params; // Sender's user ID
    const receiverId = req.user.id; // Receiver's user ID (from authMiddleware)

    if (userId === receiverId) {
      return next(
        createHttpError(
          400,
          "You cannot accept a connection request from yourself."
        )
      );
    }

    try {
      // Find the sender user
      const sender = await User.findById(userId);
      if (!sender) {
        return next(createHttpError(404, "Sender not found."));
      }

      // Find the receiver user
      const receiver = await User.findById(receiverId);
      if (!receiver) {
        return next(createHttpError(404, "Receiver not found."));
      }

      // Check if the sender's ID exists in the receiver's pending request list
      const requestIndex = receiver.pending_request.indexOf(userId);
      if (requestIndex === -1) {
        return next(createHttpError(400, "No connection request found."));
      }
      // Check if the receiver Id exist in the sending pending request list
      const requestReceiverIndex = sender.pending_request.indexOf(receiverId);
      if (requestIndex !== -1) {
        sender.pending_request.splice(requestReceiverIndex, 1);
      }

      // Remove the sender from the receiver's pending request list
      receiver.pending_request.splice(requestIndex, 1);

      // Add the sender to the receiver's connections list
      receiver.connections.push(userId);

      // Add the receiver to the sender's connections list
      sender.connections.push(receiverId);

      // Save both users' updated data
      await receiver.save();
      await sender.save();

      res.status(200).json({
        message: "Connection request accepted successfully!",
      });
    } catch (err) {
      console.error(err.message);
      return next(createHttpError(500, err.message));
    }
  },
  // Reject connection request (receiver rejects the request)
  async rejectConnectionRequest(req, res, next) {
    const { userId } = req.params; // Sender's user ID
    const receiverId = req.user.id; // Receiver's user ID (from authMiddleware)

    if (userId === receiverId) {
      return next(
        createHttpError(
          400,
          "You cannot reject a connection request from yourself."
        )
      );
    }

    try {
      // Find the receiver user
      const receiver = await User.findById(receiverId);
      if (!receiver) {
        return next(createHttpError(404, "Receiver not found."));
      }

      // Check if the sender's ID exists in the receiver's pending requests
      const requestIndex = receiver.pending_request.indexOf(userId);
      if (requestIndex === -1) {
        return next(createHttpError(400, "No connection request found."));
      }

      // Remove the sender from pending requests
      receiver.pending_request.splice(requestIndex, 1);
      await receiver.save();

      res.status(200).json({
        message: "Connection request rejected successfully!",
      });
    } catch (err) {
      return next(createHttpError(500, err.message));
    }
  },
  async getConnectionsList(req, res, next) {
    const userId = req.user.id;

    try {
      // Fetch the user with their connections populated
      const user = await User.findById(userId).populate({
        path: "connections", // Assuming connections field stores references to other users
        select: "name email image", // Select necessary fields
      });

      if (!user) {
        return next(createHttpError(404, "User not found"));
      }

      // Extract the connections from the user document
      const formattedConnections = user.connections.map((connection) => ({
        id: connection._id,
        name: connection.name,
        email: connection.email,
        image: connection.image,
      }));

      res.status(200).json({
        connections: formattedConnections,
        totalConnections: formattedConnections.length,
      });
    } catch (err) {
      console.error(err.message);
      next(createHttpError(500, "Failed to fetch connections"));
    }
  },
  async getUsers(req, res, next) {
    const userId = req.user.id; // Current logged-in user ID
    const {
      page = 1,
      limit = 10,
      search = "",
      filter = "all",
      sort = "name",
    } = req.query;

    try {
      // Prepare the filters for the query
      const filterConditions = {};

      // Filter by name or other criteria (like branch)
      if (search) {
        filterConditions.$or = [
          { name: { $regex: search, $options: "i" } }, // case-insensitive search
          { branch: { $regex: search, $options: "i" } },
        ];
      }

      // Filter by connection status
      if (filter === "not-connected") {
        filterConditions._id = { $ne: userId }; // exclude current user
        filterConditions.connections = { $nin: [userId] }; // exclude already connected users
      } else if (filter === "pending-request") {
        filterConditions._id = { $ne: userId }; // exclude current user
        filterConditions.pending_request = { $in: [userId] }; // users with pending requests
      }

      // Sort options (could be by name, registration date, etc.)
      const sortOptions = {};
      if (sort === "name") {
        sortOptions.name = 1; // Ascending order
      } else if (sort === "newest") {
        sortOptions.createdAt = -1; // Sort by creation date (newest first)
      }

      // Pagination setup
      const skip = (page - 1) * limit;
      const users = await User.find(filterConditions)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .select(
          "-__v -password -connections -pending_request -isVerified -createdAt -updatedAt "
        );

      // Get total count of users for pagination metadata
      const totalCount = await User.countDocuments(filterConditions);

      res.status(200).json({
        message: "Users fetched successfully",
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalUsers: totalCount,
        },
      });
    } catch (err) {
      return next(createHttpError(500, err.message));
    }
  },
  async getSingleUser(req, res, next) {
    try {
      // Extract user ID from the URL parameters and logged-in user's ID
      const { userId } = req.params;
      const loggedInUserId = req.user.id;

      // Validate if the requested userId is in a valid format (optional, if using MongoDB)
      if (!userId) {
        return next(createHttpError(400, "User ID is required."));
      }

      // Fetch the user from the database
      const user = await User.findById(userId);
      // Check if the user exists
      if (!user) {
        return next(createHttpError(404, "User not found."));
      }
      res.status(200).json({ user });
    } catch (error) {
      console.log(error.message);
      return next(createHttpError(500, "Internal Server Error"));
    }
  },
};

export default userController;
