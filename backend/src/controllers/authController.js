import { uploadToCloudinary } from "../lib/cloudinary.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { config } from "../config/index.js";
import { sendWelcomeEmail } from "../email/emailHandlers.js";
import jwt from "jsonwebtoken";

/** Helper to generate JWT using central config */
const generateToken = (id) => {
  return jwt.sign({ sub: String(id) }, config.jwtSecret, {
    algorithm: "HS256",
    expiresIn: config.jwtExpiresIn,
    ...(config.jwtIssuer && { issuer: config.jwtIssuer }),
    ...(config.jwtAudience && { audience: config.jwtAudience }),
  });
};

/** Register a new user */
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide name, email and password" });
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = generateToken(user._id);
    // Send the welcome email without failing registration if email delivery fails.
    try {
      await sendWelcomeEmail(user.email, user.name, config.frontendUrl);
    } catch (emailErr) {
      console.warn("Welcome email failed:", emailErr);
    }
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: config.env === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .status(201)
      .json({
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        token,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user._id);
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: config.env === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        token,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out" });
};

// Update profile picture for authenticated user using Cloudinary
export const updateProfilePic = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    // Upload buffer to Cloudinary
    const cloudResult = await uploadToCloudinary(req.file.buffer);
    const profilePicUrl = cloudResult.secure_url;
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePic: profilePicUrl },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
