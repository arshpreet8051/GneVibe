import express from "express";
import { PORT } from "./config/index.js";
import errorHandler from "./middlewares/errorHandler.js";
import userRouter from "./routes/user.route.js";
import connectDB from "./config/db.js";

const app = express();

// user route with prefix /user
app.use("/api/user", userRouter);

// Db Connection
connectDB();

// Server initialisation
app.listen(PORT, () => {
  console.log(`Listening on PORT:${PORT}`);
});

// Global error middleware
app.use(errorHandler);
