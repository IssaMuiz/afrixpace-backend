import cloudinary from "../config/cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: any, file: Express.Multer.File) => {
    return {
      folder: "Afrixpace_posts",
      resource_type: "auto",
      publicId: `${file.originalname.split(".")[0]}-${Date.now()}`,
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

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  }, //10mb
});

export default upload;
