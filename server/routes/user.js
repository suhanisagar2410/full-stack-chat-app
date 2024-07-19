import express from "express";
import {
  acceptFriendRequest,
  getAllMyNotifications,
  getMyFriends,
  getMyProfile,
  login,
  logout,
  newUser,
  renameUserData,
  searchUser,
  sendFriendRequest,
} from "../controllers/user.js";
import { singleAvatar } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  acceptRequestValidator,
  loginValidator,
  registerValidator,
  renameUserDataValidator,
  sendRequestValidator,
  validateHandler,
  
} from "../lib/validators.js";

const app = express.Router();
app.post("/new", singleAvatar, registerValidator(), validateHandler, newUser);
app.post("/login", loginValidator(), validateHandler, login);
//after here user must be logged in to access route
app.use(isAuthenticated);
app.get("/me", getMyProfile);
app.get("/logout", logout);
app.get("/search", searchUser);
app.put(
  "/send-request",
  sendRequestValidator(),
  validateHandler,
  sendFriendRequest
);
app.put(
  "/accept-request",
  singleAvatar,
  acceptRequestValidator(),
  validateHandler,
  acceptFriendRequest
);
app.put(
  "/update-user-data",
  singleAvatar,
  renameUserDataValidator(),
  validateHandler,
  renameUserData
);

app.get("/notifications", getAllMyNotifications);
app.get("/friends", getMyFriends);
export default app;
