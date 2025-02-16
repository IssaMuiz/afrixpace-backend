import express from "express";
import { createPost } from "../controllers/posts-controller";
import { authMiddleware } from "../middlewares/auth-middleware";
import upload from "../middlewares/upload";

const router = express.Router();

router.post("/create-post", authMiddleware, upload.single("media"), createPost);

export default router;
