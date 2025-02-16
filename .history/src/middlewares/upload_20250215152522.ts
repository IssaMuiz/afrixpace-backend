import cloudinary from "../config/cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: any, file: Express.Multer.File) => {
    return {
      folder: "Afrixpace_posts",
      resource_type: "auto",
      public_id: file.originalname.split(".")[0],
    };
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
