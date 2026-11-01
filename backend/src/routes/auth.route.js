import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  updateProfilePic,
} from "../controllers/authController.js";
import {
  validateLogin,
  validateRegister,
} from "../middleware/validation.js";
import { protectArcjet } from "../middleware/arcjet.middleware.js";
import { uploadProfilePic } from "../middleware/upload.js";
import protect from "../utils/utils.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/login", protectArcjet, validateLogin, loginUser);
router.post("/register", protectArcjet, validateRegister, registerUser);
router.post("/logout", protectArcjet, logoutUser);

router.get("/check", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile-pic", protect, uploadProfilePic, updateProfilePic);

export default router;
