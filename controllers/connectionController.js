import User from '../models/User.js';
import Notification from '../models/Notification.js';

// Send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user.id;

    if (senderId === recipientId) {
      return res.status(400).json({ message: 'Cannot send connection request to yourself' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if connection already exists
    const sender = await User.findById(senderId);
    if (sender.connections.includes(recipientId)) {
      return res.status(400).json({ message: 'Already connected with this user' });
    }

    // Create notification for connection request
    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${sender.name} wants to connect with you`,
      data: {
        senderId,
        senderName: sender.name,
        senderProfilePhoto: sender.profilePhoto
      }
    });

    await notification.save();

    res.json({
      success: true,
      message: 'Connection request sent successfully'
    });

  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Accept connection request
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { notificationId } = req.body;
    const userId = req.user.id;

    const notification = await Notification.findById(notificationId);
    if (!notification || notification.recipient.toString() !== userId) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.type !== 'connection_request') {
      return res.status(400).json({ message: 'Invalid notification type' });
    }

    const senderId = notification.sender;

    // Add connection to both users
    await User.findByIdAndUpdate(userId, {
      $addToSet: { connections: senderId }
    });

    await User.findByIdAndUpdate(senderId, {
      $addToSet: { connections: userId }
    });

    // Mark notification as read
    notification.read = true;
    await notification.save();

    // Create notification for sender
    const user = await User.findById(userId);
    const acceptNotification = new Notification({
      recipient: senderId,
      sender: userId,
      type: 'connection_accepted',
      title: 'Connection Request Accepted',
      message: `${user.name} accepted your connection request`,
      data: {
        userId,
        userName: user.name,
        userProfilePhoto: user.profilePhoto
      }
    });

    await acceptNotification.save();

    res.json({
      success: true,
      message: 'Connection request accepted'
    });

  } catch (error) {
    console.error('Error accepting connection request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user connections
export const getUserConnections = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findById(userId)
      .populate({
        path: 'connections',
        select: 'name email profilePhoto trustScore location skills isActive',
        options: {
          limit: parseInt(limit),
          skip: (parseInt(page) - 1) * parseInt(limit)
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalConnections = await User.findById(userId).select('connections');
    const total = totalConnections.connections.length;
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      connections: user.connections,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
