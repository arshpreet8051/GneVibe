import express from "express";
import { PORT } from "./config/index.js";
import errorHandler from "./middlewares/errorHandler.js";
import userRouter from "./routes/user.route.js";
import connectDB from "./config/db.js";
import cors from "cors";
import postRouter from "./routes/post.route.js";
import eventRouter from "./routes/event.route.js";


const app = express();

// cors
app.use(cors());
// parsing req.body
app.use(express.json());

// user route with prefix /user
app.use("/api/user", userRouter);
// post route with prefix /post
app.use("/api/post", postRouter);
// event route with prefix /event
app.use("/api/event", eventRouter);

// Db Connection
connectDB();

// Server initialisation
app.listen(PORT, () => {
  console.log(`Listening on PORT:${PORT}`);
});

// Global error middleware
app.use(errorHandler);
