import { config } from "dotenv";
config();
export const {
  PORT,
  MONGO_URI,
  EMAIL_USER,
  EMAIL_PASS,
  BACKEND_DOMAIN,
  JWT_SECRET,
} = process.env;
