import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/index.js";
const authMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next(createHttpError(401, "Not Authorized to make request!"));
  }
  const access_token = authorization.split(" ")[1];

  try {
    const { id, email } = jwt.verify(access_token, JWT_SECRET);
    const user = {
      id,
      email,
    };
    req.user = user;
    next();
  } catch (error) {
    return next(createHttpError(401, "Not Authorized to make request!"));
  }
};

export default authMiddleware;