import createHttpError from "http-errors";
import { router } from "./index.js";
import Joi from "joi";
import userController from "../controllers/user.controller.js";

const userRouter = router;
userRouter.post("/register", userController.register);
userRouter.get("/verify-email", userController.verifyUser);

export default userRouter;
