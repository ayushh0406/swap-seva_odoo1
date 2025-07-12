import express from "express";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import {
  getUserChats,
  getChatById,
  sendMessage,
  markMessagesAsRead,
  completeTrade
} from "../controllers/chatController.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Chat routes
router.get("/", getUserChats);
router.get("/:chatId", getChatById);
router.post("/message", sendMessage);
router.put("/:chatId/read", markMessagesAsRead);
router.put("/:chatId/complete", completeTrade);

// Debug routes
router.get("/debug/connection", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting"
    };
    
    res.status(200).json({
      success: true,
      connection: {
        status: statusMap[dbStatus] || "unknown",
        readyState: dbStatus
      },
      user: {
        id: req.user._id,
        name: req.user.name
      }
    });
  } catch (error) {
    console.error("Connection check error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check connection status",
      error: error.message
    });
  }
});

// Create a test chat route
router.post("/debug/create-test-chat", async (req, res) => {
  try {
    // Find another user to chat with
    const otherUser = await User.findOne({ _id: { $ne: req.user._id } });
    
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "No other user found to create test chat"
      });
    }

    if (req.user._id.toString() === otherUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot create a chat with yourself."
      });
    }
    
    // Create test chat
    const chat = new Chat({
      participants: [req.user._id, otherUser._id],
      tradeInfo: {
        initiatorOffering: {
          title: "Test Offering from Initiator",
          description: "This is a test offering",
          value: 100
        },
        responderOffering: {
          title: "Test Offering from Responder",
          description: "This is a test offering in response",
          value: 100
        },
        status: "confirmed",
        confirmedAt: new Date()
      }
    });
    
    await chat.save();
    
    res.status(201).json({
      success: true,
      message: "Test chat created successfully",
      chatId: chat._id,
      participants: [
        { id: req.user._id, name: req.user.name },
        { id: otherUser._id, name: otherUser.name }
      ]
    });
  } catch (error) {
    console.error("Create test chat error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create test chat",
      error: error.message
    });
  }
});

export default router; 