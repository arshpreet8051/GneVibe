import { JWT_SECRET } from "../config/index.js";
import { User } from "../model/user.model.js";
import sendVerificationEmail from "../services/nodemailer.js";
import userSchema from "../validator/registerSchema.js";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import loginSchema from "../validator/loginSchema.js";

const userController = {
  async register(req, res, next) {
    const { error } = userSchema.validate(req.body);

    if (error) {
      return next(createHttpError(400, error.message));
    }
    const { name, email, password, urn, crn, branch, yearOfAdmission } =
      req.body;
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
      console.log(emailToken);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        branch,
        crn,
        urn,
        yearOfAdmission,
        verificationToken: emailToken,
      });

      const savedUser = await newUser.save();

      await sendVerificationEmail(savedUser, emailToken);

      res.json({
        message: "Successful registeration. Please verify your email address",
      });
    } catch (err) {
      console.log(err);
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

      res.send("Email verified successfully. You can now log in.");
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
};

export default userController;
