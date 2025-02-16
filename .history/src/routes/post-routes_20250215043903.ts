import express from "express";
import { createPost } from "../controllers/posts-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const router = express.Router();

router.post("/create-post", authMiddleware, createPost);

export default router;
