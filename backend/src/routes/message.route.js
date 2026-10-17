import express from "express";
const router = express.Router();

router.post("/login", (req, res) => {
  res.send("send message endpoint");
});

export default router;
