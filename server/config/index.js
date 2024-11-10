import { config } from "dotenv";
config();
export const {
  PORT,
  MONGO_URI,
  EMAIL_USER,
  EMAIL_PASS,
  BACKEND_DOMAIN,
  JWT_SECRET,
  CLOUD_API_KEY,
  CLOUD_API_SECRET,
  CLOUD_NAME,
} = process.env;
