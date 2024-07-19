import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import {v2 as cloudinary} from 'cloudinary'
import { getBase64, getSockets } from "../lib/helper.js";
const cookieOptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  sameSite: "none",
  httpOnly: true,
  secure: true,
};

const connectDB = (uri) => {
  mongoose
    .connect(uri, { dbName: "Chat-shat" })
    .then((data) => console.log(`Connected to DB ${data.connection.host}`))
    .catch((err) => {
      throw err;
    });
};
const sendToken = (res, user, code, message) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  

  const key = "Chat-shat-token";
  return res.status(code).cookie(key, token, cookieOptions).json({
    success: true,
    user,
    message,
  });
};
const emitEvent = (req, event, users, data) => {
  let  io = req.app.get("io")
  const userSocket = getSockets(users)
  io.to(userSocket).emit(event,data)

};
const uploadFilesToCloudinary = async (files = []) => {
  
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        getBase64(file),
      
        {
          resource_type: "auto",
          public_id: uuid(),
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
  });
  try {
    const results = await Promise.all(uploadPromises)
  
    const formatedResult = results.map((result)=>({
      public_id:result.public_id,
      url:result.secure_url
    }))
    return formatedResult
  } catch (err) {
    throw new Error("Error Uploading Files To Cloudinary",err)
  }
};
const deleteFilesFromCloudinary = async (public_ids = []) => {
  if (!public_ids.length) {
    throw new Error("No public IDs provided for deletion.");
  }

  const deletePromises = public_ids.map((public_id) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(public_id, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  });

  try {
    const results = await Promise.all(deletePromises);

    const formattedResults = results.map((result) => ({
      public_id: result.public_id,
      result: result.result,
    }));
    return formattedResults;
  } catch (err) {
    throw new Error("Error Deleting Files From Cloudinary", err);
  }
};


export {
  connectDB,
  sendToken,
  cookieOptions,
  emitEvent,
  deleteFilesFromCloudinary,
  uploadFilesToCloudinary,
};