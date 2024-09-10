import mongoose from "mongoose";
import { MONGO_URI } from "./index.js";

const connectDB = async () => {
  await mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log(`Connection Established with DB`);
    })
    .catch((err) => {
      console.log(`Error while connecting to DB `, err);
    });
};
export default connectDB;
