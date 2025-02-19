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
import { validateUserInput } from "../middlewares/validation";

const router = express.Router();

router.post("/register", validateUserInput, register);
router.post("/login", login);
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: "Welcome to your dashboard", user: req.session.user });
});
router.post("/logout", authMiddleware, logout);
router.put("/change-password", authMiddleware, changePassword);
router.put("/profile", authMiddleware, updateUserProfile);
router.get("/profile", authMiddleware, getUserProfile);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);

export default router;
