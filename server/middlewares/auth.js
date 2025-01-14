import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/utility.js";
import { TryCatch } from "./error.js";
import { adminSecretKey } from "../app.js";

import { chat_shat_token } from "../constants/config.js";
import { User } from "../models/user.js";

const isAuthenticated = TryCatch(async (req, res, next) => {
  const token = req.cookies[chat_shat_token];

  if (!token)
    return next(new ErrorHandler("Please Login to access this route", 401));
  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decodedData._id;
  next();
});
const adminOnly = TryCatch(async (req, res, next) => {
  const token = req.cookies["chat-shat-admin-token"];
  if (!token)
    return next(new ErrorHandler("Only Admin Can Access this route", 401));
  // const adminId = jwt.verify(token, process.env.JWT_SECRET);

  const isMatched = adminSecretKey;
  if (!isMatched)
    return next(new ErrorHandler("Only Admin Can Access this route", 401));

  next();
});
const socketAuthenticator = async (err, socket, next) => {
  try {
    if (err) return next(err);

    const authToken = socket.request.cookies[chat_shat_token];

    if (!authToken)
      return next(new ErrorHandler("Please login to access this route", 401));

    const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);

    const user = await User.findById(decodedData._id);

    if (!user)
      return next(new ErrorHandler("Please login to access this route", 401));

    socket.user = user;

    return next();
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Please login to access this route", 401));
  }
};
export { isAuthenticated, adminOnly, socketAuthenticator };
