import createHttpError from "http-errors";
import { router } from "./index.js";
import Joi from "joi";
import userController from "../controllers/user.controller.js";

const userRouter = router;
userRouter.post("/register", userController.register);

export default userRouter;
