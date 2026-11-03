import express from "express";
import protect from "../utils/utils.js";
import { protectArcjet } from "../middleware/arcjet.middleware.js";
import {
  getContacts,
  getChats,
  getMessages,
  sendMessage,
} from "../controllers/messageController.js";

const router = express.Router();

// 1. Contacts: all users available to start a conversation with
router.get("/contacts", protectArcjet, protect, getContacts);

// 2. Chats: active conversations (users you have chatted with)
router.get("/chats", protectArcjet, protect, getChats);

// 3. Chat messages with a specific user
router.get("/:id", protectArcjet, protect, getMessages);

// 4. Send a message to a specific user
router.post("/send/:id", protectArcjet, protect, sendMessage);

export default router;
