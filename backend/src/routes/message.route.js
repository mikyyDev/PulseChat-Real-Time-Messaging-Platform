import express from "express";
import protect from "../utils/utils.js";
const router = express.Router();

router.post("/send", protect, (req, res) => {
  res.send("Message sent");
});

export default router;
