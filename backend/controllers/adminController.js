import User from '../models/User.js';
import Match from '../models/Match.js';
import Chat from '../models/Chat.js';
import Skill from '../models/Skill.js';
import Interest from '../models/Interest.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

// Get admin dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    // Change: count all users except admin
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    
    // Change: count trades from chats collection instead of matches
    const totalTrades = await Chat.countDocuments({ 'tradeInfo': { $exists: true } });
    const pendingTrades = await Chat.countDocuments({ 
      'tradeInfo.status': { $in: ['pending', 'confirmed'] } 
    });
    const completedTrades = await Chat.countDocuments({ 'tradeInfo.status': 'completed' });
    const confirmedTrades = await Chat.countDocuments({ 'tradeInfo.status': 'confirmed' });
    
    // Keep matches count for backward compatibility
    const totalMatches = await Match.countDocuments();
    const pendingMatches = await Match.countDocuments({ status: 'pending' });
    const completedMatches = await Match.countDocuments({ status: 'completed' });
    
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const totalSkills = await Skill.countDocuments();
    const totalInterests = await Interest.countDocuments();

    // Change: show recent users except admin
    const recentUsers = await User.find({ role: { $ne: 'admin' } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    // Change: show recent trades from chats
    const recentTrades = await Chat.find({ 'tradeInfo': { $exists: true } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('participants', 'name email');

    // Keep recent matches for backward compatibility
    const recentMatches = await Match.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('users', 'name email');

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalTrades, // New: total trades from chats
        totalMatches, // Keep for backward compatibility
        pendingTrades, // New: pending trades from chats
        pendingMatches, // Keep for backward compatibility
        completedTrades, // New: completed trades from chats
        completedMatches, // Keep for backward compatibility
        confirmedTrades, // New: confirmed trades from chats
        bannedUsers,
        totalSkills,
        totalInterests
      },
      recentActivity: {
        users: recentUsers,
        trades: recentTrades, // New: recent trades from chats
        matches: recentMatches // Keep for backward compatibility
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all users with admin filters
export const getAllUsersAdmin = async (req, res) => {
  try {
    const { 
      search, 
      role, 
      isBanned, 
      hasOfferings, 
      page = 1, 
      limit = 20 
    } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (isBanned !== undefined) {
      query.isBanned = isBanned === 'true';
    }
    
    if (hasOfferings === 'true') {
      query.offerings = { $exists: true, $ne: [] };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('bannedBy', 'name email');
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalUsers: total
      }
    });
  } catch (error) {
    console.error('Get all users admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Ban/Unban user
export const toggleUserBan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBanned, banReason } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot ban admin users'
      });
    }
    
    user.isBanned = isBanned;
    user.banReason = isBanned ? banReason : undefined;
    user.bannedAt = isBanned ? new Date() : undefined;
    user.bannedBy = isBanned ? req.user._id : undefined;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBanned: user.isBanned,
        banReason: user.banReason
      }
    });
  } catch (error) {
    console.error('Toggle user ban error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all matches with admin filters
export const getAllMatchesAdmin = async (req, res) => {
  try {
    const { 
      status, 
      barterType, 
      search, 
      page = 1, 
      limit = 20 
    } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (barterType) {
      query.barterType = barterType;
    }
    
    if (search) {
      query.$or = [
        { 'offerings.title': { $regex: search, $options: 'i' } },
        { 'offerings.description': { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const matches = await Match.find(query)
      .populate('users', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Match.countDocuments(query);
    
    res.status(200).json({
      success: true,
      matches,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalMatches: total
      }
    });
  } catch (error) {
    console.error('Get all matches admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Moderate user offerings
export const moderateOfferings = async (req, res) => {
  try {
    const { userId, offeringIndex, action, reason } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.offerings[offeringIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Offering not found'
      });
    }
    
    const offering = user.offerings[offeringIndex];
    
    if (action === 'approve') {
      offering.isApproved = true;
      offering.isRejected = false;
      offering.rejectionReason = undefined;
    } else if (action === 'reject') {
      offering.isApproved = false;
      offering.isRejected = true;
      offering.rejectionReason = reason;
    }
    
    offering.moderatedBy = req.user._id;
    offering.moderatedAt = new Date();
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `Offering ${action}d successfully`,
      offering
    });
  } catch (error) {
    console.error('Moderate offerings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send platform-wide notification to all users
export const sendPlatformNotification = async (req, res) => {
  try {
    const { title, message, priority = 'medium', expiresAt } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    // Get all users except admin
    const users = await User.find({ role: { $ne: 'admin' } }).select('_id');
    
    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No users found to send notification to'
      });
    }

    // Create notifications for all users
    const notifications = users.map(user => ({
      recipient: user._id,
      sender: req.user._id, // Admin sending the notification
      type: 'system',
      title,
      message,
      priority,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      data: {
        isPlatformMessage: true,
        sentBy: req.user.name
      }
    }));

    // Insert all notifications
    await Notification.insertMany(notifications);

    // Emit socket event to all connected users if available
    if (req.app.get('io')) {
      const io = req.app.get('io');
      
      // Emit to all connected users
      io.emit('platform-notification', {
        title,
        message,
        priority,
        sentBy: req.user.name,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: `Platform notification sent to ${users.length} users`,
      sentTo: users.length,
      notification: {
        title,
        message,
        priority,
        expiresAt
      }
    });
  } catch (error) {
    console.error('Send platform notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get platform notification history
export const getPlatformNotificationHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get system notifications sent by admins
    const notifications = await Notification.find({
      type: 'system',
      'data.isPlatformMessage': true
    })
    .populate('sender', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
    const total = await Notification.countDocuments({
      type: 'system',
      'data.isPlatformMessage': true
    });
    
    res.status(200).json({
      success: true,
      notifications,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalNotifications: total
      }
    });
  } catch (error) {
    console.error('Get platform notification history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Generate and download reports
export const generateReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate, format = 'csv' } = req.query;
    
    // Set default date range if not provided (last 30 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    let reportData = {};
    let fileName = '';
    
    switch (reportType) {
      case 'user_activity':
        // Comprehensive user report with all fields
        const allUsers = await User.find({ role: { $ne: 'admin' } })
          .select('_id name email phone createdAt isBanned avatar bio profession languages offerings needs')
          .sort({ createdAt: -1 });

        // Get user engagement data from chats
        const userEngagement = await Chat.aggregate([
          {
            $match: {
              'tradeInfo': { $exists: true }
            }
          },
          {
            $unwind: '$participants'
          },
          {
            $group: {
              _id: '$participants',
              totalSwaps: { $sum: 1 },
              completedSwaps: {
                $sum: {
                  $cond: [{ $eq: ['$tradeInfo.status', 'completed'] }, 1, 0]
                }
              },
              pendingSwaps: {
                $sum: {
                  $cond: [{ $in: ['$tradeInfo.status', ['pending', 'confirmed']] }, 1, 0]
                }
              }
            }
          }
        ]);

        // Create a map for quick lookup
        const engagementMap = new Map();
        userEngagement.forEach(engagement => {
          engagementMap.set(engagement._id.toString(), engagement);
        });

        // Combine user data with engagement data
        const comprehensiveUserData = allUsers.map(user => {
          const engagement = engagementMap.get(user._id.toString()) || {
            totalSwaps: 0,
            completedSwaps: 0,
            pendingSwaps: 0
          };

          return {
            userId: user._id,
            fullName: user.name || 'N/A',
            email: user.email || 'N/A',
            phoneNumber: user.phone || 'N/A',
            registrationDate: user.createdAt,
            lastLogin: user.lastLogin || user.createdAt, // Fallback to registration date
            totalSwapsMade: engagement.completedSwaps,
            swapsPending: engagement.pendingSwaps,
            skillsListed: user.offerings ? user.offerings.filter(o => o.type === 'skill').length : 0,
            goodsListed: user.offerings ? user.offerings.filter(o => o.type === 'good').length : 0,
            profileStatus: user.isBanned ? 'Banned' : 'Active',
            bio: user.bio || 'N/A',
            profession: user.profession || 'N/A',
            languages: user.languages ? user.languages.join(', ') : 'N/A',
            trustScore: user.trustScore || 50,
            isVerified: user.isVerified ? 'Yes' : 'No'
          };
        });

        reportData = { 
          users: comprehensiveUserData,
          summary: {
            totalUsers: comprehensiveUserData.length,
            activeUsers: comprehensiveUserData.filter(u => u.profileStatus === 'Active').length,
            bannedUsers: comprehensiveUserData.filter(u => u.profileStatus === 'Banned').length,
            totalSwaps: comprehensiveUserData.reduce((sum, user) => sum + user.totalSwapsMade, 0),
            pendingSwaps: comprehensiveUserData.reduce((sum, user) => sum + user.swapsPending, 0),
            dateRange: { start: start.toISOString(), end: end.toISOString() }
          }
        };
        fileName = `user-activity-comprehensive-${start.toISOString().split('T')[0]}-to-${end.toISOString().split('T')[0]}`;
        break;
        
      case 'feedback_logs':
        // Comprehensive feedback report
        const feedbackData = await Chat.aggregate([
          {
            $match: {
              'tradeInfo': { $exists: true },
              'messages': { $exists: true, $ne: [] }
            }
          },
          {
            $unwind: '$messages'
          },
          {
            $lookup: {
              from: 'users',
              localField: 'messages.sender',
              foreignField: '_id',
              as: 'sender'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'participants',
              foreignField: '_id',
              as: 'participants'
            }
          },
          {
            $project: {
              feedbackId: '$_id',
              fromUserId: '$messages.sender',
              fromUserName: { $arrayElemAt: ['$sender.name', 0] },
              fromUserEmail: { $arrayElemAt: ['$sender.email', 0] },
              toUserId: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$participants',
                      cond: { $ne: ['$$this._id', '$messages.sender'] }
                    }
                  },
                  0
                ]
              },
              toUserName: {
                $arrayElemAt: [
                  {
                    $map: {
                      input: {
                        $filter: {
                          input: '$participants',
                          cond: { $ne: ['$$this._id', '$messages.sender'] }
                        }
                      },
                      as: 'participant',
                      in: '$$participant.name'
                    }
                  },
                  0
                ]
              },
              swapId: '$_id',
              message: '$messages.content',
              dateSubmitted: '$messages.timestamp',
              tradeStatus: '$tradeInfo.status'
            }
          },
          { $sort: { dateSubmitted: -1 } }
        ]);

        reportData = { 
          feedback: feedbackData,
          summary: {
            totalFeedback: feedbackData.length,
            uniqueUsers: new Set(feedbackData.map(f => f.fromUserId.toString())).size,
            dateRange: { start: start.toISOString(), end: end.toISOString() }
          }
        };
        fileName = `feedback-logs-comprehensive-${start.toISOString().split('T')[0]}-to-${end.toISOString().split('T')[0]}`;
        break;
        
      case 'swap_stats':
        // Comprehensive swap statistics
        const swapStats = await Chat.aggregate([
          {
            $match: {
              'tradeInfo': { $exists: true },
              createdAt: { $gte: start, $lte: end }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'participants',
              foreignField: '_id',
              as: 'participants'
            }
          },
          {
            $project: {
              swapId: '$_id',
              participants: {
                $map: {
                  input: '$participants',
                  as: 'participant',
                  in: {
                    userId: '$$participant._id',
                    userName: '$$participant.name',
                    userEmail: '$$participant.email'
                  }
                }
              },
              status: '$tradeInfo.status',
              createdAt: '$createdAt',
              completedAt: '$tradeInfo.completedAt',
              initiatorOffering: '$tradeInfo.initiatorOffering',
              responderOffering: '$tradeInfo.responderOffering',
              messageCount: { $size: '$messages' }
            }
          },
          { $sort: { createdAt: -1 } }
        ]);

        // Daily statistics
        const dailyStats = await Chat.aggregate([
          {
            $match: {
              'tradeInfo': { $exists: true },
              createdAt: { $gte: start, $lte: end }
            }
          },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                status: '$tradeInfo.status'
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.date': 1 } }
        ]);

        reportData = { 
          swaps: swapStats,
          dailyStats,
          summary: {
            totalSwaps: swapStats.length,
            completedSwaps: swapStats.filter(s => s.status === 'completed').length,
            pendingSwaps: swapStats.filter(s => s.status === 'pending').length,
            confirmedSwaps: swapStats.filter(s => s.status === 'confirmed').length,
            dateRange: { start: start.toISOString(), end: end.toISOString() }
          }
        };
        fileName = `swap-stats-comprehensive-${start.toISOString().split('T')[0]}-to-${end.toISOString().split('T')[0]}`;
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type. Available types: user_activity, swap_stats, feedback_logs'
        });
    }

    // Set response headers for file download
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.csv"`);
      
      // Convert to CSV format
      const csvData = convertToCSV(reportData, reportType);
      return res.send(csvData);
    } else if (format === 'pdf') {
      // For PDF, we'll return JSON for now (PDF generation would require additional libraries)
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.json"`);
      
      return res.status(200).json({
        success: true,
        reportType,
        generatedAt: new Date().toISOString(),
        data: reportData,
        note: "PDF format not yet implemented. Please use CSV format for now."
      });
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.json"`);
      
      return res.status(200).json({
        success: true,
        reportType,
        generatedAt: new Date().toISOString(),
        data: reportData
      });
    }
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper function to convert data to CSV format
const convertToCSV = (data, reportType) => {
  let csv = '';
  
  switch (reportType) {
    case 'user_activity':
      csv += 'User ID,Full Name,Email,Phone Number,Registration Date,Last Login,Total Swaps Made,Swaps Pending,Skills Listed,Goods Listed,Profile Status,Bio,Profession,Languages,Trust Score,Is Verified\n';
      data.users.forEach(user => {
        csv += `"${user.userId}","${user.fullName}","${user.email}","${user.phoneNumber}","${user.registrationDate}","${user.lastLogin}","${user.totalSwapsMade}","${user.swapsPending}","${user.skillsListed}","${user.goodsListed}","${user.profileStatus}","${user.bio}","${user.profession}","${user.languages}","${user.trustScore}","${user.isVerified}"\n`;
      });
      break;
      
    case 'feedback_logs':
      csv += 'Feedback ID,From User ID,From User Name,From User Email,To User ID,To User Name,Swap ID,Message,Date Submitted,Trade Status\n';
      data.feedback.forEach(feedback => {
        csv += `"${feedback.feedbackId}","${feedback.fromUserId}","${feedback.fromUserName}","${feedback.fromUserEmail}","${feedback.toUserId}","${feedback.toUserName}","${feedback.swapId}","${feedback.message}","${feedback.dateSubmitted}","${feedback.tradeStatus}"\n`;
      });
      break;
      
    case 'swap_stats':
      csv += 'Swap ID,Participant 1 ID,Participant 1 Name,Participant 1 Email,Participant 2 ID,Participant 2 Name,Participant 2 Email,Status,Created At,Completed At,Message Count,Initiator Offering,Responder Offering\n';
      data.swaps.forEach(swap => {
        const participant1 = swap.participants[0] || {};
        const participant2 = swap.participants[1] || {};
        const initiatorOffering = swap.initiatorOffering ? JSON.stringify(swap.initiatorOffering) : '';
        const responderOffering = swap.responderOffering ? JSON.stringify(swap.responderOffering) : '';
        
        csv += `"${swap.swapId}","${participant1.userId || ''}","${participant1.userName || ''}","${participant1.userEmail || ''}","${participant2.userId || ''}","${participant2.userName || ''}","${participant2.userEmail || ''}","${swap.status}","${swap.createdAt}","${swap.completedAt || ''}","${swap.messageCount}","${initiatorOffering}","${responderOffering}"\n`;
      });
      break;
  }
  
  return csv;
};

// Get pending offerings for moderation
export const getPendingOfferings = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find({
      'offerings.isRejected': true
    })
    .select('name email offerings')
    .skip(skip)
    .limit(parseInt(limit));
    
    const pendingOfferings = [];
    users.forEach(user => {
      user.offerings.forEach((offering, index) => {
        if (offering.isRejected) {
          pendingOfferings.push({
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            offeringIndex: index,
            offering
          });
        }
      });
    });
    
    res.status(200).json({
      success: true,
      pendingOfferings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(pendingOfferings.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get pending offerings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 