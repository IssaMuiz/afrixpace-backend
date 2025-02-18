import express from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import {
  followUser,
  getFollowers,
  getFollowing,
} from "../controllers/follow-controller";
import { unFollowUser } from "../controllers/follow-controller";

const router = express.Router();

router.post("/follow", authMiddleware, followUser);
router.post("/unfollow", authMiddleware, unFollowUser);
router.get("/:userId/followers", authMiddleware, getFollowers);
router.get("/:userId/following", authMiddleware, getFollowing);

export default router;
