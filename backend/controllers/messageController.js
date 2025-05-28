import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

// Get all conversations for a user
export const getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true
    })
    .populate('participants', 'name avatar')
    .populate('lastMessage')
    .populate('match', 'status offerings')
    .sort({ updatedAt: -1 });

    // Get unread counts for each conversation
    const conversationsWithCounts = conversations.map(conv => {
      const convoObj = conv.toObject();
      convoObj.unreadCount = conv.unreadCount.get(req.user._id.toString()) || 0;
      return convoObj;
    });

    res.status(200).json({
      success: true,
      conversations: conversationsWithCounts
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get messages for a specific conversation
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation ID'
      });
    }

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Get messages with pagination
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    // Mark messages as read
    await Message.updateMany(
      { 
        conversation: conversationId, 
        receiver: req.user._id,
        read: false
      },
      { 
        read: true,
        readAt: new Date()
      }
    );

    // Reset unread count for this user
    conversation.unreadCount.set(req.user._id.toString(), 0);
    await conversation.save();

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: messages.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, type = 'text', attachments } = req.body;
    
    if (!conversationId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID and content are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation ID'
      });
    }

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Get the receiver (the other participant)
    const receiverId = conversation.participants.find(
      p => p.toString() !== req.user._id.toString()
    );

    // Create the message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      receiver: receiverId,
      type,
      content,
      attachments: attachments || []
    });

    // Populate sender and receiver info
    await message.populate('sender', 'name avatar');
    await message.populate('receiver', 'name avatar');

    // Update the conversation's last message and increment unread count
    conversation.lastMessage = message._id;
    const unreadCount = conversation.unreadCount.get(receiverId.toString()) || 0;
    conversation.unreadCount.set(receiverId.toString(), unreadCount + 1);
    await conversation.save();

    // Create a notification for the receiver
    await Notification.create({
      recipient: receiverId,
      sender: req.user._id,
      type: 'message',
      title: 'New Message',
      message: `${req.user.name}: ${content.substring(0, 30)}${content.length > 30 ? '...' : ''}`,
      data: {
        conversationId,
        messageId: message._id
      }
    });

    // Emit the message via Socket.io (handled in server.js)
    req.app.get('io').to(`user-${receiverId}`).emit('new-message', {
      message,
      conversation: conversationId
    });

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Start a new conversation
export const startConversation = async (req, res) => {
  try {
    const { userId, initialMessage } = req.body;
    
    if (!userId || !initialMessage) {
      return res.status(400).json({
        success: false,
        message: 'User ID and initial message are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot start a conversation with yourself'
      });
    }

    // Check if other user exists
    const otherUser = await User.findById(userId);
    
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId] }
    });

    if (conversation) {
      // If conversation exists but was inactive, reactivate it
      if (!conversation.isActive) {
        conversation.isActive = true;
        await conversation.save();
      }
    } else {
      // Create a new conversation
      conversation = await Conversation.create({
        participants: [req.user._id, userId]
      });
    }

    // Create the initial message
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      receiver: userId,
      content: initialMessage
    });

    // Update the conversation
    conversation.lastMessage = message._id;
    conversation.unreadCount.set(userId, 1);
    await conversation.save();

    // Populate the message and conversation
    await message.populate('sender', 'name avatar');
    await message.populate('receiver', 'name avatar');
    await conversation.populate('participants', 'name avatar');

    // Create notification
    await Notification.create({
      recipient: userId,
      sender: req.user._id,
      type: 'message',
      title: 'New Message',
      message: `${req.user.name}: ${initialMessage.substring(0, 30)}${initialMessage.length > 30 ? '...' : ''}`,
      data: {
        conversationId: conversation._id,
        messageId: message._id
      }
    });

    // Emit the new conversation and message
    req.app.get('io').to(`user-${userId}`).emit('new-conversation', {
      conversation,
      message
    });

    res.status(201).json({
      success: true,
      conversation,
      message
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Initiate a call
export const initiateCall = async (req, res) => {
  try {
    const { conversationId, callType } = req.body;
    
    if (!conversationId || !callType) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID and call type are required'
      });
    }

    if (!['audio', 'video'].includes(callType)) {
      return res.status(400).json({
        success: false,
        message: 'Call type must be audio or video'
      });
    }

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    }).populate('participants', 'name avatar');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Get the receiver
    const receiver = conversation.participants.find(
      p => p._id.toString() !== req.user._id.toString()
    );

    // Create a call request message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      receiver: receiver._id,
      type: 'call_request',
      content: `${req.user.name} is calling you (${callType})`,
      callDetails: {
        type: callType,
        status: 'pending'
      }
    });

    // Emit call request to the receiver
    req.app.get('io').to(`user-${receiver._id}`).emit('call-request', {
      callId: message._id,
      caller: {
        id: req.user._id,
        name: req.user.name,
        avatar: req.user.avatar
      },
      callType,
      conversationId
    });

    res.status(200).json({
      success: true,
      callId: message._id,
      receiver
    });
  } catch (error) {
    console.error('Initiate call error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Respond to a call
export const respondToCall = async (req, res) => {
  try {
    const { callId, response } = req.body;
    
    if (!callId || !response) {
      return res.status(400).json({
        success: false,
        message: 'Call ID and response are required'
      });
    }

    if (!['accepted', 'declined', 'missed'].includes(response)) {
      return res.status(400).json({
        success: false,
        message: 'Response must be accepted, declined, or missed'
      });
    }

    // Find the call message
    const callMessage = await Message.findById(callId)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    if (!callMessage || callMessage.type !== 'call_request') {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    if (callMessage.receiver._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cannot respond to a call that is not for you'
      });
    }

    // Update call status
    callMessage.callDetails.status = response;
    await callMessage.save();

    // Create response message
    const responseMessage = await Message.create({
      conversation: callMessage.conversation,
      sender: req.user._id,
      receiver: callMessage.sender._id,
      type: 'call_response',
      content: `${req.user.name} ${response} the call`,
      callDetails: {
        type: callMessage.callDetails.type,
        status: response
      }
    });

    // Emit call response to the caller
    req.app.get('io').to(`user-${callMessage.sender._id}`).emit('call-response', {
      callId: callMessage._id,
      responder: {
        id: req.user._id,
        name: req.user.name,
        avatar: req.user.avatar
      },
      response,
      callType: callMessage.callDetails.type
    });

    res.status(200).json({
      success: true,
      callId: callMessage._id,
      response
    });
  } catch (error) {
    console.error('Respond to call error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// End a call and record duration
export const endCall = async (req, res) => {
  try {
    const { callId, duration } = req.body;
    
    if (!callId) {
      return res.status(400).json({
        success: false,
        message: 'Call ID is required'
      });
    }

    // Find the original call request
    const callMessage = await Message.findById(callId);

    if (!callMessage || callMessage.type !== 'call_request') {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    if (callMessage.sender.toString() !== req.user._id.toString() && 
        callMessage.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cannot end a call you are not part of'
      });
    }

    // Update call details with duration
    callMessage.callDetails.duration = duration || 0;
    callMessage.callDetails.status = 'completed';
    await callMessage.save();

    // Notify the other user that the call has ended
    const otherUserId = callMessage.sender.toString() === req.user._id.toString() 
      ? callMessage.receiver
      : callMessage.sender;

    req.app.get('io').to(`user-${otherUserId}`).emit('call-ended', {
      callId: callMessage._id,
      duration: duration || 0
    });

    res.status(200).json({
      success: true,
      callId: callMessage._id,
      duration: duration || 0
    });
  } catch (error) {
    console.error('End call error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 