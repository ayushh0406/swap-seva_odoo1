import User from '../models/User.js';
import Match from '../models/Match.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's current trust score
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get active exchanges (matches that are accepted but not completed)
    const activeExchanges = await Match.countDocuments({
      $or: [
        { requester: userId },
        { recipient: userId }
      ],
      status: 'accepted'
    });

    // Get pending confirmations (matches waiting for response)
    const pendingConfirmations = await Match.countDocuments({
      recipient: userId,
      status: 'pending'
    });

    // Get completed exchanges
    const completedExchanges = await Match.countDocuments({
      $or: [
        { requester: userId },
        { recipient: userId }
      ],
      status: 'completed'
    });

    // Get monthly completions (this month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyCompletions = await Match.countDocuments({
      $or: [
        { requester: userId },
        { recipient: userId }
      ],
      status: 'completed',
      updatedAt: { $gte: currentMonth }
    });

    // Get unread messages count
    const conversations = await Conversation.find({
      participants: userId
    });

    let unreadMessages = 0;
    let messageSenders = new Set();

    for (const conversation of conversations) {
      const unreadCount = await Message.countDocuments({
        conversation: conversation._id,
        sender: { $ne: userId },
        read: false
      });
      
      if (unreadCount > 0) {
        unreadMessages += unreadCount;
        const lastUnreadMessage = await Message.findOne({
          conversation: conversation._id,
          sender: { $ne: userId },
          read: false
        }).sort({ createdAt: -1 });
        
        if (lastUnreadMessage) {
          messageSenders.add(lastUnreadMessage.sender.toString());
        }
      }
    }

    // Calculate trust score change (mock calculation for now)
    const trustScoreChange = Math.floor(Math.random() * 20) - 5; // -5 to +15

    const dashboardData = {
      trustScore: user.trustScore || 85,
      trustScoreChange,
      activeExchanges,
      pendingConfirmations,
      completedExchanges,
      monthlyCompletions,
      unreadMessages,
      messageSenders: messageSenders.size
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recent activities
export const getRecentActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 4;

    const activities = [];

    // Get recent completed trades
    const recentTrades = await Match.find({
      $or: [
        { requester: userId },
        { recipient: userId }
      ],
      status: 'completed'
    })
    .populate('requester', 'name')
    .populate('recipient', 'name')
    .sort({ updatedAt: -1 })
    .limit(2);

    recentTrades.forEach(trade => {
      const otherUser = trade.requester._id.toString() === userId ? trade.recipient : trade.requester;
      activities.push({
        _id: trade._id,
        type: 'trade_completed',
        title: `Skills Exchange Completed with ${otherUser.name}`,
        description: `You successfully exchanged skills`,
        timestamp: trade.updatedAt,
        relatedUser: otherUser.name
      });
    });

    // Get recent messages
    const recentMessages = await Message.find({
      sender: { $ne: userId }
    })
    .populate('conversation')
    .populate('sender', 'name')
    .sort({ createdAt: -1 })
    .limit(2);

    recentMessages.forEach(message => {
      // Check if this conversation involves the current user
      if (message.conversation.participants.includes(userId)) {
        activities.push({
          _id: message._id,
          type: 'message_received',
          title: `New message from ${message.sender.name}`,
          description: `Regarding your skills exchange`,
          timestamp: message.createdAt,
          relatedUser: message.sender.name
        });
      }
    });

    // Get recent trade requests
    const recentRequests = await Match.find({
      recipient: userId,
      status: 'pending'
    })
    .populate('requester', 'name')
    .sort({ createdAt: -1 })
    .limit(2);

    recentRequests.forEach(request => {
      activities.push({
        _id: request._id,
        type: 'trade_request',
        title: `New Skills Exchange Request from ${request.requester.name}`,
        description: `Wants to exchange skills with you`,
        timestamp: request.createdAt,
        relatedUser: request.requester.name
      });
    });

    // Add trust score activity (mock)
    if (activities.length < limit) {
      activities.push({
        _id: 'trust_score_' + Date.now(),
        type: 'trust_increased',
        title: 'Trust Score Increased',
        description: 'You gained points after completing a skills exchange',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      });
    }

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, limit);

    res.json({
      success: true,
      data: limitedActivities
    });

  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
