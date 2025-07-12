import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Offering from '../models/Offering.js';

// Verify Chat model is imported
console.log("Chat model imported:", !!Chat);

// Get user's notifications
export const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    // Build query
    const query = { 
      recipient: req.user._id 
    };
    
    if (unreadOnly === 'true') {
      query.read = false;
    }

    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('sender', 'name avatar');

    // Get total count for pagination
    const totalCount = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark notifications as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Notification IDs array is required'
      });
    }

    // Validate notification IDs
    const validIds = notificationIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid notification IDs provided'
      });
    }

    // Update notifications
    const result = await Notification.updateMany(
      { 
        _id: { $in: validIds }, 
        recipient: req.user._id,
        read: false
      },
      { 
        read: true,
        readAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: 'Notifications marked as read',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    // Update all user's unread notifications
    const result = await Notification.updateMany(
      { 
        recipient: req.user._id,
        read: false
      },
      { 
        read: true,
        readAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete notifications
export const deleteNotifications = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Notification IDs array is required'
      });
    }

    // Validate notification IDs
    const validIds = notificationIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid notification IDs provided'
      });
    }

    // Delete notifications
    const result = await Notification.deleteMany({
      _id: { $in: validIds },
      recipient: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Notifications deleted',
      count: result.deletedCount
    });
  } catch (error) {
    console.error('Delete notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Accept trade request
export const acceptTradeRequest = async (req, res) => {
  try {
    console.log("Accept trade request received:", req.body);
    const { notificationId, selectedItemId } = req.body;
    
    if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
      console.log("Invalid notification ID:", notificationId);
      return res.status(400).json({
        success: false,
        message: 'Valid notification ID is required'
      });
    }
    
    // Find the notification
    const notification = await Notification.findById(notificationId)
      .populate('sender', 'name email')
      .populate('recipient', 'name email');
      
    console.log("Found notification:", notification ? "Yes" : "No");
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if this is the recipient
    const isRecipient = notification.recipient._id.toString() === req.user._id.toString();
    console.log("Is recipient:", isRecipient);
    
    if (!isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to accept this request'
      });
    }
    
    // Check if this is a barter request
    const isBarterRequest = notification.type === 'barter_request';
    console.log("Is barter request:", isBarterRequest);
    
    if (!isBarterRequest) {
      return res.status(400).json({
        success: false,
        message: 'This notification is not a trade request'
      });
    }
    
    // Find the selected item from the sender's offered items
    console.log("Selected item ID:", selectedItemId);
    console.log("Notification data:", notification.data);
    
    const offeredItems = notification.data.offeredItems || [];
    console.log("Offered items count:", offeredItems.length);
    
    // Find the selected item in the offered items
    let selectedItem = null;
    
    // Try different ways to find the item
    for (const item of offeredItems) {
      // If item is a string, compare directly
      if (typeof item === 'string' && item === selectedItemId) {
        // Get the item from the sender's offerings
        const sender = await User.findById(notification.sender._id);
        if (sender) {
          selectedItem = sender.offerings.find(o => o._id.toString() === selectedItemId);
        }
        break;
      }
      
      // If item is an object with _id
      if (item && item._id) {
        const itemId = typeof item._id === 'string' ? item._id : item._id.toString();
        if (itemId === selectedItemId) {
          selectedItem = item;
          break;
        }
      }
    }
    
    console.log("Selected item found:", selectedItem ? "Yes" : "No");
    
    if (!selectedItem) {
      return res.status(404).json({
        success: false,
        message: 'Selected item not found in the offered items'
      });
    }
    
    // Find the requested offering from recipient's offerings
    const currentUser = await User.findById(req.user._id);
    console.log("Current user:", currentUser ? "Found" : "Not found");
    
    const requestedOffering = notification.data.requestedOffering;
    console.log("Requested offering:", requestedOffering ? "Found" : "Not found");
    
    // Mark the notification as read
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();
    
    // Create a notification for the sender
    const responseNotification = new Notification({
      recipient: notification.sender._id,
      sender: req.user._id,
      type: 'barter_accepted',
      title: 'Trade Request Accepted',
      message: `${currentUser.name} has accepted your trade request and wants your ${selectedItem.title} in exchange for their ${requestedOffering.title}`,
      data: {
        originalRequestId: notification.data.requestId,
        requestedOffering: requestedOffering,
        selectedItem: selectedItem
      },
      priority: 'high'
    });
    
    await responseNotification.save();
    console.log("Response notification created:", responseNotification._id);
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Trade request accepted successfully',
      notification: responseNotification
    });
  } catch (error) {
    console.error('Accept trade request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Confirm trade request
export const confirmTradeRequest = async (req, res) => {
  try {
    console.log("Confirm trade request received:", req.body);
    const { notificationId } = req.body;
    
    if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
      console.log("Invalid notification ID:", notificationId);
      return res.status(400).json({
        success: false,
        message: 'Valid notification ID is required'
      });
    }
    
    // Find the notification
    const notification = await Notification.findById(notificationId)
      .populate('sender', 'name email')
      .populate('recipient', 'name email');
      
    console.log("Found notification:", notification ? "Yes" : "No");
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if this is the recipient
    const isRecipient = notification.recipient._id.toString() === req.user._id.toString();
    console.log("Is recipient:", isRecipient);
    
    if (!isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to confirm this request'
      });
    }
    
    // Check if this is a barter accepted notification
    const isBarterAccepted = notification.type === 'barter_accepted';
    console.log("Is barter accepted:", isBarterAccepted);
    
    if (!isBarterAccepted) {
      return res.status(400).json({
        success: false,
        message: 'This notification is not a trade acceptance'
      });
    }
    
    // Mark the notification as read
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();
    
    // Get both users
    const initiator = await User.findById(notification.sender._id);
    const responder = await User.findById(notification.recipient._id);
    
    console.log("Initiator found:", initiator ? initiator.name : "No");
    console.log("Responder found:", responder ? responder.name : "No");
    
    if (!initiator || !responder) {
      return res.status(404).json({
        success: false,
        message: 'One or both users not found'
      });
    }
    
    if (initiator._id.toString() === responder._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot create a chat with yourself."
      });
    }

    // Create a chat between the two users
    const chat = new Chat({
      participants: [initiator._id, responder._id],
      messages: [],
      tradeInfo: {
        initiatorOffering: notification.data.selectedItem,
        responderOffering: notification.data.requestedOffering,
        status: 'confirmed',
        confirmedAt: new Date()
      }
    });
    
    console.log("Creating chat with participants:", [initiator._id.toString(), responder._id.toString()]);
    console.log("Trade info:", JSON.stringify({
      initiatorOffering: notification.data.selectedItem,
      responderOffering: notification.data.requestedOffering
    }, null, 2));
    
    try {
      await chat.save();
      console.log("Chat created successfully:", chat._id);
      
      // Verify the chat was saved correctly
      const savedChat = await Chat.findById(chat._id);
      console.log("Chat verification - found in DB:", savedChat ? "Yes" : "No");
      if (savedChat) {
        console.log("Chat participants:", savedChat.participants.map(p => p.toString()));
        console.log("Chat trade info status:", savedChat.tradeInfo?.status);
      }
    } catch (saveError) {
      console.error("Error saving chat:", saveError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create chat'
      });
    }
    
    // Create notifications for both users
    const tradeConfirmedNotification1 = new Notification({
      recipient: initiator._id,
      sender: responder._id,
      type: 'trade_confirmed',
      title: 'Trade Confirmed',
      message: `${responder.name} has confirmed the trade. You can now chat to arrange the exchange.`,
      data: {
        chatId: chat._id,
        tradeInfo: chat.tradeInfo
      },
      priority: 'high'
    });
    
    const tradeConfirmedNotification2 = new Notification({
      recipient: responder._id,
      sender: initiator._id,
      type: 'trade_confirmed',
      title: 'Trade Confirmed',
      message: `You have confirmed the trade with ${initiator.name}. You can now chat to arrange the exchange.`,
      data: {
        chatId: chat._id,
        tradeInfo: chat.tradeInfo
      },
      priority: 'high'
    });
    
    await tradeConfirmedNotification1.save();
    await tradeConfirmedNotification2.save();
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Trade confirmed successfully',
      chatId: chat._id
    });
  } catch (error) {
    console.error('Confirm trade request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 