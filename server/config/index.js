import { config } from "dotenv";
config();
export const { PORT, MONGO_URI } = process.env;
