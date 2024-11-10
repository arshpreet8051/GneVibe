import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    acadamics: {
      branch: {
        type: String,
        required: true,
      },

      urn: {
        type: String,
        required: true,
      },
      yearOfAdmission: {
        type: Number,
        required: true,
      },
    },
    image: {
      type: String,
      default: "https://placehold.co/400"
    },
    connections: [
       {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    pending_request: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    role: {
      type: String,
      enum: ['student', 'mentor'],
      default: 'student'
    },
    verificationToken: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
