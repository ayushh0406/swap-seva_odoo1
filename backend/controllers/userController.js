import User from '../models/User.js';
import mongoose from 'mongoose';

// Get all users (with optional filters)
export const getAllUsers = async (req, res) => {
  try {
    const { hasSkillOfferings, hasGoodOfferings, search, limit = 50 } = req.query;
    
    const query = {};
    
    // Filter by users who have skill offerings
    if (hasSkillOfferings === 'true') {
      query['offerings'] = { 
        $elemMatch: { 
          type: 'skill' 
        } 
      };
    }
    
    // Filter by users who have good offerings
    if (hasGoodOfferings === 'true') {
      query['offerings'] = { 
        $elemMatch: { 
          type: 'good' 
        } 
      };
    }
    
    // Search by name, skill title, or good title
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { 'offerings.title': searchRegex },
        { 'offerings.description': searchRegex }
      ];
    }
    
    // Exclude the current user from results if authenticated
    if (req.user) {
      query._id = { $ne: req.user._id };
    }
    
    const users = await User.find(query)
      .select('_id name avatar location trustScore offerings')
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('interests', 'name category image')
      .populate('skills', 'name category image');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { 
      name, 
      bio, 
      profession, 
      languages, 
      avatar,
      location
    } = req.body;

    // Find the user
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update fields
    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (profession) user.profession = profession;
    if (languages) user.languages = languages;
    if (avatar) user.avatar = avatar;
    if (location) user.location = location;

    // Save the user
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        name: user.name,
        bio: user.bio,
        profession: user.profession,
        languages: user.languages,
        avatar: user.avatar,
        location: user.location
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Add or update user interests
export const updateInterests = async (req, res) => {
  try {
    const { interests } = req.body;
    
    if (!interests || !Array.isArray(interests)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Interests must be provided as an array' 
      });
    }

    // Validate that each interest is a valid ObjectId
    const validInterests = interests.filter(id => mongoose.Types.ObjectId.isValid(id));

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { interests: validInterests },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Interests updated successfully',
      interests: user.interests
    });
  } catch (error) {
    console.error('Update interests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Add or update user skills
export const updateSkills = async (req, res) => {
  try {
    const { skills } = req.body;
    
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Skills must be provided as an array' 
      });
    }

    // Validate that each skill is a valid ObjectId
    const validSkills = skills.filter(id => mongoose.Types.ObjectId.isValid(id));

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { skills: validSkills },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Skills updated successfully',
      skills: user.skills
    });
  } catch (error) {
    console.error('Update skills error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Add new offering (skill or good)
export const addOffering = async (req, res) => {
  try {
    const offering = req.body;
    
    if (!offering || !offering.title || !offering.type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Offering must include title and type' 
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    user.offerings.push(offering);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Offering added successfully',
      offering: user.offerings[user.offerings.length - 1]
    });
  } catch (error) {
    console.error('Add offering error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Update an offering
export const updateOffering = async (req, res) => {
  try {
    const { offeringId } = req.params;
    const updates = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(offeringId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid offering ID' 
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Find the offering index
    const offeringIndex = user.offerings.findIndex(
      offering => offering._id.toString() === offeringId
    );

    if (offeringIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Offering not found' 
      });
    }

    // Update offering fields
    Object.keys(updates).forEach(key => {
      if (key !== '_id') {
        user.offerings[offeringIndex][key] = updates[key];
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Offering updated successfully',
      offering: user.offerings[offeringIndex]
    });
  } catch (error) {
    console.error('Update offering error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Delete an offering
export const deleteOffering = async (req, res) => {
  try {
    const { offeringId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(offeringId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid offering ID' 
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Filter out the offering
    user.offerings = user.offerings.filter(
      offering => offering._id.toString() !== offeringId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Offering deleted successfully'
    });
  } catch (error) {
    console.error('Delete offering error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Add new need (skill or good)
export const addNeed = async (req, res) => {
  try {
    const need = req.body;
    
    if (!need || !need.title || !need.type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Need must include title and type' 
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    user.needs.push(need);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Need added successfully',
      need: user.needs[user.needs.length - 1]
    });
  } catch (error) {
    console.error('Add need error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Update a need
export const updateNeed = async (req, res) => {
  try {
    const { needId } = req.params;
    const updates = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(needId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid need ID' 
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Find the need index
    const needIndex = user.needs.findIndex(
      need => need._id.toString() === needId
    );

    if (needIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Need not found' 
      });
    }

    // Update need fields
    Object.keys(updates).forEach(key => {
      if (key !== '_id') {
        user.needs[needIndex][key] = updates[key];
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Need updated successfully',
      need: user.needs[needIndex]
    });
  } catch (error) {
    console.error('Update need error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Delete a need
export const deleteNeed = async (req, res) => {
  try {
    const { needId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(needId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid need ID' 
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Filter out the need
    user.needs = user.needs.filter(
      need => need._id.toString() !== needId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Need deleted successfully'
    });
  } catch (error) {
    console.error('Delete need error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Update notification settings
export const updateNotificationSettings = async (req, res) => {
  try {
    const settings = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update settings
    if (settings) {
      user.notificationSettings = {
        ...user.notificationSettings,
        ...settings
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully',
      notificationSettings: user.notificationSettings
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Update user preferences
export const updatePreferences = async (req, res) => {
  try {
    const preferences = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update preferences
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Send connection request with user skills or goods
export const sendConnectionRequest = async (req, res) => {
  try {
    console.log("Send connection request received:", req.body);
    const { recipientId, skillId } = req.body;
    
    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid recipient ID is required' 
      });
    }
    
    // Get current user with their offerings
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Get recipient user
    const recipientUser = await User.findById(recipientId);
    if (!recipientUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipient user not found' 
      });
    }
    
    // Find the requested offering from recipient
    const requestedOffering = recipientUser.offerings.find(
      offering => offering._id.toString() === skillId
    );
    
    if (!requestedOffering) {
      return res.status(404).json({ 
        success: false, 
        message: 'Requested offering not found' 
      });
    }
    
    // Get all offerings of the same type from current user
    const offeringType = requestedOffering.type;
    const userOfferings = currentUser.offerings.filter(offering => offering.type === offeringType);
    
    // Check if user has any offerings of the same type
    if (userOfferings.length === 0) {
      return res.status(400).json({
        success: false,
        message: `You don't have any ${offeringType}s to offer in exchange`
      });
    }
    
    console.log("Offering type:", offeringType);
    console.log("User offerings count:", userOfferings.length);
    console.log("First user offering:", userOfferings[0]);
    
    // Create a notification for the recipient
    const Notification = mongoose.model('Notification');
    const notification = new Notification({
      recipient: recipientId,
      sender: req.user._id,
      type: 'barter_request',
      title: `New ${offeringType.charAt(0).toUpperCase() + offeringType.slice(1)} Trade Request`,
      message: `${currentUser.name} wants to trade for your ${requestedOffering.title} ${offeringType}`,
      data: {
        requestedOffering: requestedOffering,
        offeredItems: userOfferings,
        requestId: new mongoose.Types.ObjectId()
      },
      priority: 'medium'
    });
    
    console.log("Notification data:", notification.data);
    
    await notification.save();
    
    res.status(201).json({
      success: true,
      message: 'Connection request sent successfully',
      notification
    });
  } catch (error) {
    console.error('Send connection request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}; 