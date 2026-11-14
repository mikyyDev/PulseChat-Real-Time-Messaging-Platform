import mongoose from "mongoose";
import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import { checkMessageLimit } from "../middleware/arcjet.middleware.js";
import { emitToUser, isUserOnline } from "../lib/socket.js";

// Get all registered contacts (all users except currently logged-in user)
// GET /api/messages/contacts

export const getContacts = async (req, res) => {
  try {
    const loggedInUserId = req.userId;
    const contacts = await User.find({
      _id: { $ne: loggedInUserId },
    })
      .select("-password")
      .sort({ name: 1 });

    // Presence comes from the socket layer, so clients get a real online flag.
    res.status(200).json(
      contacts.map((contact) => ({
        ...contact.toObject(),
        isOnline: isUserOnline(contact._id),
      })),
    );
  } catch (error) {
    console.error("Error in getContacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get active conversations (users you have chatted with + last message)
// GET /api/messages/chats

export const getChats = async (req, res) => {
  try {
    const myId = req.userId;

    // Find all messages involving current user, most recent first
    const messages = await Message.find({
      $or: [{ senderId: myId }, { receiverId: myId }],
    }).sort({ createdAt: -1 });

    // Extract unique chat partner IDs in order of last interaction
    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === myId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString(),
        ),
      ),
    ];

    // Fetch user details for these partners
    const chatPartners = await User.find({
      _id: { $in: chatPartnerIds },
    }).select("-password");

    // Map each partner in recent order and attach last message info
    const orderedChats = chatPartnerIds
      .map((id) => {
        const partner = chatPartners.find((u) => u._id.toString() === id);
        if (!partner) return null;

        const lastMessage = messages.find(
          (m) =>
            (m.senderId.toString() === id &&
              m.receiverId.toString() === myId.toString()) ||
            (m.senderId.toString() === myId.toString() &&
              m.receiverId.toString() === id),
        );

        return {
          ...partner.toObject(),
          isOnline: isUserOnline(partner._id),
          lastMessage: lastMessage
            ? {
                text: lastMessage.text,
                image: lastMessage.image,
                createdAt: lastMessage.createdAt,
                senderId: lastMessage.senderId,
              }
            : null,
        };
      })
      .filter(Boolean);

    res.status(200).json(orderedChats);
  } catch (error) {
    console.error("Error in getChats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get chat message history with a specific user
// GET /api/messages/:id
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(userToChatId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Send a message (text and/or image) to a user
// POST /api/messages/send/:id
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Invalid receiver ID" });
    }

    if (receiverId === senderId) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    if (!text && !image) {
      return res
        .status(400)
        .json({ message: "Message must contain text or an image" });
    }

    // Arcjet rate limiting check (fails open safely)
    const isAllowed = await checkMessageLimit(req, senderId);
    if (!isAllowed) {
      return res
        .status(429)
        .json({ message: "You are sending messages too fast. Slow down!" });
    }

    let imageUrl = "";
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "chat_images",
      });
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: text?.trim() || "",
      image: imageUrl,
    });

    await newMessage.save();

    // Real-time delivery: fan out to every device the recipient has open.
    emitToUser(receiverId, "newMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
