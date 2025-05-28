import Match from '../models/Match.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Conversation from '../models/Conversation.js';
import mongoose from 'mongoose';

// Find potential matches
export const findMatches = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's needs and offerings
    const userNeeds = user.needs || [];
    const userOfferings = user.offerings || [];

    if (userNeeds.length === 0 || userOfferings.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'You must have at least one need and one offering to find matches'
      });
    }

    // Extract categories and types from user's needs and offerings
    const needTypes = userNeeds.map(need => need.type);
    const needCategories = userNeeds.map(need => need.category).filter(Boolean);
    const offeringTypes = userOfferings.map(offering => offering.type);
    const offeringCategories = userOfferings.map(offering => offering.category).filter(Boolean);

    // Find users that have offerings matching our needs
    // and have needs matching our offerings
    const potentialMatches = await User.find({
      _id: { $ne: req.user._id }, // Exclude current user
      $and: [
        // They have offerings that match our needs
        {
          offerings: {
            $elemMatch: {
              $or: [
                { type: { $in: needTypes } },
                { category: { $in: needCategories } }
              ]
            }
          }
        },
        // They have needs that match our offerings
        {
          needs: {
            $elemMatch: {
              $or: [
                { type: { $in: offeringTypes } },
                { category: { $in: offeringCategories } }
              ]
            }
          }
        }
      ]
    })
    .select('_id name avatar bio profession location offerings needs')
    .limit(20);

    // If location is available, sort by distance
    if (user.location && user.location.coordinates && user.location.coordinates.length === 2) {
      // This assumes we've set up a 2dsphere index on the location field
      const usersWithLocation = await User.find({
        _id: { $in: potentialMatches.map(m => m._id) },
        'location.coordinates': { $exists: true }
      })
      .select('_id location')
      .where('location')
      .near({
        center: {
          type: 'Point',
          coordinates: user.location.coordinates
        },
        maxDistance: user.preferences?.maxDistance * 1000 || 50000, // Convert km to meters
        spherical: true
      });

      // Create a map of user IDs to distances
      const distanceMap = {};
      usersWithLocation.forEach(u => {
        distanceMap[u._id.toString()] = u.distance;
      });

      // Sort potentialMatches by distance
      potentialMatches.sort((a, b) => {
        const distA = distanceMap[a._id.toString()] || Infinity;
        const distB = distanceMap[b._id.toString()] || Infinity;
        return distA - distB;
      });
    }

    // Calculate match score (basic implementation)
    const matchesWithScores = potentialMatches.map(match => {
      let score = 0;
      const matchOfferings = match.offerings || [];
      const matchNeeds = match.needs || [];

      // Score based on need/offering match
      for (const need of userNeeds) {
        for (const offering of matchOfferings) {
          if (need.type === offering.type) score += 1;
          if (need.category && offering.category && need.category === offering.category) score += 2;
          if (need.title && offering.title && offering.title.toLowerCase().includes(need.title.toLowerCase())) score += 3;
        }
      }

      for (const offering of userOfferings) {
        for (const need of matchNeeds) {
          if (offering.type === need.type) score += 1;
          if (offering.category && need.category && offering.category === need.category) score += 2;
          if (offering.title && need.title && need.title.toLowerCase().includes(offering.title.toLowerCase())) score += 3;
        }
      }

      return {
        ...match.toObject(),
        matchScore: score
      };
    });

    // Sort by match score (descending)
    matchesWithScores.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      matches: matchesWithScores
    });
  } catch (error) {
    console.error('Find matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create a match request
export const createMatch = async (req, res) => {
  try {
    const { userId, offeringId, needId, message } = req.body;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required'
      });
    }

    // Check if users exist
    const [currentUser, matchUser] = await Promise.all([
      User.findById(req.user._id),
      User.findById(userId)
    ]);

    if (!currentUser || !matchUser) {
      return res.status(404).json({
        success: false,
        message: 'One or both users not found'
      });
    }

    // Find the offerings and needs
    const userOffering = currentUser.offerings.id(offeringId);
    const userNeed = currentUser.needs.id(needId);
    
    if (!userOffering || !userNeed) {
      return res.status(404).json({
        success: false,
        message: 'Offering or need not found'
      });
    }

    // Check if match already exists
    const existingMatch = await Match.findOne({
      users: { $all: [req.user._id, userId] },
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingMatch) {
      return res.status(400).json({
        success: false,
        message: 'A match request already exists between these users'
      });
    }

    // Create the match
    const match = await Match.create({
      users: [req.user._id, userId],
      status: 'pending',
      barterType: `${userOffering.type}-for-${userNeed.type}`,
      offerings: [
        {
          user: req.user._id,
          type: userOffering.type,
          title: userOffering.title,
          description: userOffering.description
        }
      ],
      // Location defaults to the current user's location
      location: currentUser.location
    });

    // Create a notification for the other user
    await Notification.create({
      recipient: userId,
      sender: req.user._id,
      type: 'barter_request',
      title: 'New Barter Request',
      message: message || `${currentUser.name} wants to barter with you!`,
      data: {
        matchId: match._id
      }
    });

    // Create a conversation
    const conversation = await Conversation.create({
      participants: [req.user._id, userId],
      match: match._id
    });

    res.status(201).json({
      success: true,
      message: 'Match request sent successfully',
      match
    });
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's matches
export const getUserMatches = async (req, res) => {
  try {
    const matches = await Match.find({
      users: req.user._id
    })
    .populate('users', 'name avatar')
    .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      matches
    });
  } catch (error) {
    console.error('Get user matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get match details
export const getMatchDetails = async (req, res) => {
  try {
    const { matchId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid match ID'
      });
    }

    const match = await Match.findOne({
      _id: matchId,
      users: req.user._id
    })
    .populate('users', 'name avatar bio profession')
    .populate('ratings.fromUser', 'name avatar')
    .populate('ratings.toUser', 'name avatar');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    res.status(200).json({
      success: true,
      match
    });
  } catch (error) {
    console.error('Get match details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update match status
export const updateMatchStatus = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { status, meetingTime, location } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid match ID'
      });
    }

    if (!['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const match = await Match.findOne({
      _id: matchId,
      users: req.user._id
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Update match
    match.status = status;
    
    if (meetingTime) {
      match.meetingTime = meetingTime;
    }
    
    if (location) {
      match.location = location;
    }

    if (status === 'completed') {
      match.completedAt = new Date();
    }

    await match.save();

    // Get the other user
    const otherUserId = match.users.find(id => id.toString() !== req.user._id.toString());

    // Create notification
    await Notification.create({
      recipient: otherUserId,
      sender: req.user._id,
      type: `barter_${status}`,
      title: `Barter ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: getStatusMessage(status, req.user.name),
      data: {
        matchId: match._id
      }
    });

    res.status(200).json({
      success: true,
      message: `Match ${status} successfully`,
      match
    });
  } catch (error) {
    console.error('Update match status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add a rating to a match
export const addRating = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { toUserId, rating, comment } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(matchId) || !mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid match or user ID'
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Verify match exists and is completed
    const match = await Match.findOne({
      _id: matchId,
      users: { $all: [req.user._id, toUserId] },
      status: 'completed'
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found or not completed'
      });
    }

    // Check if user already rated
    const existingRating = match.ratings.find(
      r => r.fromUser.toString() === req.user._id.toString() && 
           r.toUser.toString() === toUserId
    );

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this user for this match'
      });
    }

    // Add rating
    match.ratings.push({
      fromUser: req.user._id,
      toUser: toUserId,
      rating,
      comment: comment || ''
    });

    await match.save();

    // Update user's trust score
    const toUser = await User.findById(toUserId);
    
    if (toUser) {
      // Calculate new trust score (average of all ratings)
      const allUserRatings = await Match.aggregate([
        { 
          $match: { 
            'ratings.toUser': toUserId 
          } 
        },
        { 
          $unwind: '$ratings' 
        },
        { 
          $match: { 
            'ratings.toUser': toUserId 
          } 
        },
        { 
          $group: { 
            _id: null, 
            averageRating: { $avg: '$ratings.rating' },
            count: { $sum: 1 }
          } 
        }
      ]);

      if (allUserRatings.length > 0) {
        // Convert to 0-100 scale
        const newTrustScore = Math.round(allUserRatings[0].averageRating * 20);
        toUser.trustScore = newTrustScore;
        await toUser.save();
      }

      // Create notification
      await Notification.create({
        recipient: toUserId,
        sender: req.user._id,
        type: 'rating_received',
        title: 'New Rating Received',
        message: `${req.user.name} rated your barter experience`,
        data: {
          matchId: match._id,
          rating
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rating added successfully',
      rating: match.ratings[match.ratings.length - 1]
    });
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Blockchain integration for match completion
export const completeWithBlockchain = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { transactionHash, network } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid match ID'
      });
    }

    if (!transactionHash) {
      return res.status(400).json({
        success: false,
        message: 'Transaction hash is required'
      });
    }

    const match = await Match.findOne({
      _id: matchId,
      users: req.user._id
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Update match with blockchain info
    match.useBlockchain = true;
    match.transactionHash = transactionHash;
    match.blockchainStatus = 'confirmed';
    match.status = 'completed';
    match.completedAt = new Date();

    await match.save();

    // Create blockchain transaction record
    const transaction = await BlockchainTransaction.create({
      match: match._id,
      users: match.users,
      transactionHash,
      network: network || 'ethereum',
      status: 'confirmed',
      confirmedAt: new Date()
    });

    // Notify other user
    const otherUserId = match.users.find(id => id.toString() !== req.user._id.toString());
    
    await Notification.create({
      recipient: otherUserId,
      sender: req.user._id,
      type: 'barter_completed',
      title: 'Barter Completed on Blockchain',
      message: `${req.user.name} has completed the barter with blockchain verification`,
      data: {
        matchId: match._id,
        transactionHash
      }
    });

    res.status(200).json({
      success: true,
      message: 'Match completed with blockchain verification',
      match,
      transaction
    });
  } catch (error) {
    console.error('Complete with blockchain error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper function for status messages
const getStatusMessage = (status, userName) => {
  switch (status) {
    case 'accepted':
      return `${userName} accepted your barter request`;
    case 'rejected':
      return `${userName} declined your barter request`;
    case 'completed':
      return `${userName} marked the barter as completed`;
    case 'cancelled':
      return `${userName} cancelled the barter`;
    default:
      return `${userName} updated the barter status`;
  }
}; 