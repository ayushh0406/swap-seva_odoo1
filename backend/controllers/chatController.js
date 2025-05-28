import Chat from '../models/Chat.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

// Get user's chats
export const getUserChats = async (req, res) => {
  try {
    console.log('Fetching chats for user:', req.user._id);
    
    // Find all chats where the user is a participant
    const chats = await Chat.find({ participants: req.user._id })
      .sort({ updatedAt: -1 })
      .populate('participants', 'name avatar')
      .select('-messages');
    
    console.log('Found chats count:', chats.length);
    
    if (chats.length === 0) {
      console.log('No chats found for user');
    } else {
      console.log('Chat IDs:', chats.map(chat => chat._id));
      
      // Log chat details for debugging
      chats.forEach(chat => {
        console.log(`Chat ${chat._id} details:`, {
          participants: chat.participants.map(p => ({
            id: p._id,
            name: p.name
          })),
          tradeInfo: chat.tradeInfo ? {
            status: chat.tradeInfo.status,
            initiatorOffering: chat.tradeInfo.initiatorOffering ? 
              (chat.tradeInfo.initiatorOffering.title || 'Unknown offering') : 'Missing offering',
            responderOffering: chat.tradeInfo.responderOffering ?
              (chat.tradeInfo.responderOffering.title || 'Unknown offering') : 'Missing offering'
          } : 'No trade info',
          lastMessageTime: chat.lastMessage?.timestamp || chat.updatedAt
        });
      });
    }
    
    // Format the response
    const formattedChats = chats.map(chat => {
      // Find the other participant
      const otherParticipant = chat.participants.find(
        p => p._id.toString() !== req.user._id.toString()
      );
      
      if (!otherParticipant) {
        console.log('Warning: Other participant not found in chat:', chat._id);
      }
      
      return {
        _id: chat._id,
        otherUser: otherParticipant,
        lastMessage: chat.lastMessage,
        unreadCount: chat.unreadCount.get(req.user._id.toString()) || 0,
        tradeInfo: chat.tradeInfo,
        updatedAt: chat.updatedAt
      };
    });
    
    res.status(200).json({
      success: true,
      chats: formattedChats
    });
  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get chat by ID
export const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat ID'
      });
    }
    
    // Find the chat and populate participant details
    const chat = await Chat.findById(chatId)
      .populate('participants', 'name avatar')
      .populate('messages.sender', 'name avatar');
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    // Check if user is a participant
    if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this chat'
      });
    }
    
    // Reset unread count for this user
    if (chat.unreadCount.has(req.user._id.toString())) {
      chat.unreadCount.set(req.user._id.toString(), 0);
      await chat.save();
    }
    
    res.status(200).json({
      success: true,
      chat
    });
  } catch (error) {
    console.error('Get chat by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    
    if (!chatId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID and message content are required'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat ID'
      });
    }
    
    // Find the chat
    const chat = await Chat.findById(chatId)
      .populate('participants', 'name avatar');
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    // Check if user is a participant
    if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to send messages to this chat'
      });
    }
    
    // Create the message
    const message = {
      sender: req.user._id,
      content,
      timestamp: new Date(),
      read: false
    };
    
    // Add message to chat
    chat.messages.push(message);
    
    // Update unread count for other participants
    chat.participants.forEach(participant => {
      if (participant._id.toString() !== req.user._id.toString()) {
        const currentCount = chat.unreadCount.get(participant._id.toString()) || 0;
        chat.unreadCount.set(participant._id.toString(), currentCount + 1);
        
        // Create a notification for the other participant
        const notification = new Notification({
          recipient: participant._id,
          sender: req.user._id,
          type: 'message',
          title: 'New Message',
          message: `${req.user.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
          data: {
            chatId: chat._id,
            messageId: message._id
          },
          priority: 'medium'
        });
        
        notification.save().catch(err => console.error('Error creating message notification:', err));
      }
    });
    
    await chat.save();
    
    // Get the saved message with populated sender
    const savedMessage = chat.messages[chat.messages.length - 1];
    const populatedMessage = await User.populate(savedMessage, {
      path: 'sender',
      select: 'name avatar'
    });
    
    // Emit socket event if available
    if (req.app.get('io')) {
      const io = req.app.get('io');
      
      // Emit to all participants except sender
      chat.participants.forEach(participant => {
        if (participant._id.toString() !== req.user._id.toString()) {
          io.to(`user-${participant._id}`).emit('new-message', {
            chatId: chat._id,
            message: populatedMessage
          });
        }
      });
    }
    
    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat ID'
      });
    }
    
    // Find the chat
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    // Check if user is a participant
    if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this chat'
      });
    }
    
    // Mark all messages as read
    chat.messages.forEach(message => {
      if (message.sender.toString() !== req.user._id.toString()) {
        message.read = true;
      }
    });
    
    // Reset unread count for this user
    chat.unreadCount.set(req.user._id.toString(), 0);
    
    await chat.save();
    
    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Complete trade
export const completeTrade = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat ID'
      });
    }
    
    // Find the chat
    const chat = await Chat.findById(chatId)
      .populate('participants', 'name avatar');
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
    
    // Check if user is a participant
    if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to complete this trade'
      });
    }
    
    // Check if trade is already completed
    if (chat.tradeInfo.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This trade is already completed'
      });
    }
    
    // Update trade status
    chat.tradeInfo.status = 'completed';
    chat.tradeInfo.completedAt = new Date();
    
    await chat.save();
    
    // Create notifications for both participants
    const otherParticipant = chat.participants.find(
      p => p._id.toString() !== req.user._id.toString()
    );
    
    const notification = new Notification({
      recipient: otherParticipant._id,
      sender: req.user._id,
      type: 'barter_completed',
      title: 'Trade Completed',
      message: `${req.user.name} has marked the trade as completed.`,
      data: {
        chatId: chat._id,
        tradeInfo: chat.tradeInfo
      },
      priority: 'high'
    });
    
    await notification.save();
    
    // Emit socket event if available
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(`user-${otherParticipant._id}`).emit('trade-completed', {
        chatId: chat._id,
        completedBy: req.user._id
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Trade marked as completed',
      chat
    });
  } catch (error) {
    console.error('Complete trade error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 