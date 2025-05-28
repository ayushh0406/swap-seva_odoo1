import express from "express";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotifications,
  acceptTradeRequest,
  confirmTradeRequest
} from "../controllers/notificationController.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Notification routes
router.get("/", getUserNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/mark-read", markAsRead);
router.put("/mark-all-read", markAllAsRead);
router.delete("/", deleteNotifications);
router.post("/accept-trade", acceptTradeRequest);
router.post("/confirm-trade", confirmTradeRequest);

// Test endpoint to create a test trade notification
router.post("/test/create", async (req, res) => {
  try {
    // Find another user to create notification with
    const users = await mongoose.model('User').find({
      _id: { $ne: req.user._id }
    }).limit(1);
    
    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No other users found to create test notification"
      });
    }
    
    const otherUser = users[0];
    
    // Create a mock offering for testing
    const mockOffering = {
      _id: new mongoose.Types.ObjectId(),
      title: "Test Item",
      description: "This is a test item for chat",
      condition: "new",
      category: "test"
    };
    
    // Create a notification for barter_accepted (which can be confirmed)
    const notification = new Notification({
      recipient: req.user._id,
      sender: otherUser._id,
      type: 'barter_accepted',
      title: 'Test Trade Accepted',
      message: `${otherUser.name || 'User'} has accepted your trade request.`,
      data: {
        requestedOffering: mockOffering,
        selectedItem: {
          ...mockOffering,
          _id: new mongoose.Types.ObjectId()
        }
      },
      priority: 'high'
    });
    
    await notification.save();
    
    res.status(201).json({
      success: true,
      message: "Test notification created successfully",
      notificationId: notification._id
    });
  } catch (error) {
    console.error("Create test notification error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating test notification",
      error: error.message
    });
  }
});

export default router; 