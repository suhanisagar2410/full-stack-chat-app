import { compare } from "bcrypt";
import { NEW_REQUEST, REFETCH_CHATS } from "../constants/events.js";
import { getOtherMember } from "../lib/helper.js";
import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { Request } from "../models/request.js";
import { User } from "../models/user.js";
import {
  cookieOptions,
  deleteFilesFromCloudinary,
  emitEvent,
  sendToken,
  uploadFilesToCloudinary,
} from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";
//create a new user and save it to the database and save token in cookie
const newUser = TryCatch(async (req, res, next) => {
  const { name, username, password, bio } = req.body;
  const file = req.file;

  if (!file) return next(new ErrorHandler("Please uplaod Avatar", 400));
  const result = await uploadFilesToCloudinary([file]);

  const avatar = {
    public_id: result[0].public_id,
    url: result[0].url,
  };

  const user = await User.create({
    name,
    bio,
    username,
    password,
    avatar,
  });
  sendToken(res, user, 201, "User Created");
});

const login = TryCatch(async (req, res, next) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).select("+password");

  if (!user) return next(new ErrorHandler("Invalid Username or Password", 404));

  const isMatch = await compare(password, user.password);

  if (!isMatch)
    return next(new ErrorHandler("Invalid Username or Password", 404));

  sendToken(res, user, 200, `Welcome Back, ${user.name}`);
});
const getMyProfile = TryCatch(async (req, res, next) => {
  const userId = req.user;
  const user = await User.findById(userId);
  if (!user) return next(ErrorHandler("User Not Found ", 404));
  res.status(200).json({
    sucess: true,
    user,
  });
});
const renameUserData = TryCatch(async (req, res, next) => {
  const userId = req.user;

  const { name, username, bio } = req.body;

  const file = req.file;

  const user = await User.findById(userId);
  if (!user) return next(new ErrorHandler("User Not Found", 404));

  let avatar = user.avatar;

  if (file) {
    await deleteFilesFromCloudinary([avatar.public_id]);
    const result = await uploadFilesToCloudinary([file]);
    avatar = {
      public_id: result[0].public_id,
      url: result[0].url,
    };
  }

  user.name = name || user.name;
  user.username = username || user.username;
  user.bio = bio || user.bio;
  user.avatar = avatar;
  await user.save();
  return res.status(200).json({
    success: true,
    message: "User data updated successfully",
    user,
  });
});
const logout = TryCatch(async (req, res) => {
  return res
    .status(200)
    .cookie("Chat-shat-token", "", { ...cookieOptions, maxAge: 0 })
    .json({
      sucess: true,
      message: "Logged out SecessFully",
    });
});
const searchUser = TryCatch(async (req, res) => {
  const { name = "" } = req.query;
  //finding All my chats
  const myChats = await Chat.find({
    groupChat: false,
    members: req.user,
  });
  //extracting all users From My chats means friends or peopel I have chated with
  const allUsersFromMyChat = myChats.flatMap((chat) => chat.members);
  const allUsersExceptMeAndFriends = await User.find({
    _id: { $nin: allUsersFromMyChat },
    name: { $regex: name, $options: "i" },
  });
  //Modifying the response
  const users = allUsersExceptMeAndFriends.map(({ _id, name, avatar }) => ({
    _id,
    name,
    avatar: avatar.url,
  }));
  return res.status(200).json({
    sucess: true,
    users,
  });
});
const sendFriendRequest = TryCatch(async (req, res, next) => {
  const { userId } = req.body;
  const request = await Request.findOne({
    $or: [
      { sender: req.user, receiver: userId },
      { sender: userId, receiver: req.user },
    ],
  });
  if (request) return next(new ErrorHandler("Request already sent", 400));
  await Request.create({
    sender: req.user,
    receiver: userId,
  });
  emitEvent(req, NEW_REQUEST, [userId]);

  return res
    .status(200)

    .json({
      sucess: true,
      message: "Friend Request Sent SecessFully",
    });
});
const acceptFriendRequest = TryCatch(async (req, res, next) => {
  const { requestId, accept } = req.body;
  const request = await Request.findById(requestId)
    .populate("sender", "name")
    .populate("receiver", "name");
  console.log(request);

  if (!request) return next(new ErrorHandler("Request Not Found", 404));
  if (request.receiver._id.toString() !== req.user.toString())
    return next(
      new ErrorHandler("You are not authorized to accept this request", 401)
    );
  if (!accept) {
    await request.deleteOne();
    return res.status(200).json({
      sucess: true,
      message: "Request Rejected",
    });
  }
  const members = [request.sender._id, request.receiver._id];
  await Promise.all([
    Chat.create({
      members,
      name: `${request.sender.name}-${request.receiver.name}`,
    }),
    request.deleteOne(),
  ]);
  emitEvent(req, REFETCH_CHATS, members);

  return res
    .status(200)

    .json({
      sucess: true,
      message: "Friend Request Accepted",
      senderId: request.sender._id,
    });
});
const getAllMyNotifications = TryCatch(async (req, res) => {
  const requests = await Request.find({ receiver: req.user }).populate(
    "sender",
    "name avatar"
  );
  const allRequests = requests.map(({ _id, sender }) => ({
    _id,
    sender: {
      _id: sender._id,
      name: sender.name,
      avatar: [sender.avatar.url],
    },
  }));
  return res.status(200).json({
    success: true,
    allRequests,
  });
});
const getMyFriends = TryCatch(async (req, res) => {
  const chatId = req.query.chatId;
  const chats = await Chat.find({
    members: req.user,
    groupChat: false,
  }).populate("members", "name avatar");
  const friends = chats.map(({ members }) => {
    const otherUser = getOtherMember(members, req.user);
    return {
      _id: otherUser._id,
      name: otherUser.name,
      avatar: otherUser.avatar.url,
    };
  });
  if (chatId) {
    const chat = await Chat.findById(chatId);
    const availableFriends = friends.filter(
      (friend) => !chat.members.includes(friend._id)
    );
    return res.status(200).json({
      sucess: true,
      friends: availableFriends,
    });
  } else {
    return res.status(200).json({
      success: true,
      friends,
    });
  }
});
export {
  acceptFriendRequest,
  getAllMyNotifications,
  getMyFriends,
  getMyProfile,
  renameUserData,
  login,
  logout,
  newUser,
  searchUser,
  sendFriendRequest,
};
