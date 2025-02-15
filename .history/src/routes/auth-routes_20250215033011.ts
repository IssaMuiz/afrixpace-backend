import express from "express";
import { authMiddleware } from "../middlewares/auth-middleware";
import {
  register,
  login,
  logout,
  changePassword,
  refreshToken,
  updateUserProfile,
  getUserProfile,
  forgotPassword,
} from "../controllers/auth-controller";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.put("/change-password", authMiddleware, changePassword);
router.put("/profile", authMiddleware, updateUserProfile);
router.get("/profile", authMiddleware, getUserProfile);
router.post("/refresh-token", authMiddleware, refreshToken);
router.post("/forgot-password", forgotPassword);

export default router;
