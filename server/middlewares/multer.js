import multer from "multer";
const multeUpload = multer({
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});
export const singleAvatar = multeUpload.single("avatar");
export const attachmentMulter = multeUpload.array("files", 5);
