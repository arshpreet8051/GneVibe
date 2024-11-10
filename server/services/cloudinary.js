import { v2 as cloudinary } from "cloudinary";
import {
  CLOUD_API_KEY,
  CLOUD_API_SECRET,
  CLOUD_NAME,
} from "../config/index.js";

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_API_SECRET,
});

const uploadOnCloudinary = async (fileBuffer) => {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error("No file buffer provided");
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );

      uploadStream.end(fileBuffer);
    });

    return result.url;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    throw error;
  }
};

export default uploadOnCloudinary;
