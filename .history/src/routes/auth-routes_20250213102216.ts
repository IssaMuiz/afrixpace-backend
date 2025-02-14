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
} from "../controllers/auth-controller";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/changePassword", authMiddleware, changePassword);
router.put("/updateUserProfile", authMiddleware, updateUserProfile);
router.get("/getUserProfile", authMiddleware, getUserProfile);

export default router;
