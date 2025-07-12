import User from '../models/User.js';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';

// Get user settings
export const getUserSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'name email phone bio location skills profilePhoto notifications privacy'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        profile: {
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          bio: user.bio || '',
          location: user.location || '',
          skills: user.skills || [],
          profilePhoto: user.profilePhoto || ''
        },
        notifications: user.notifications || {
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false,
          newMatches: true,
          messages: true,
          skillRequests: true
        },
        privacy: user.privacy || {
          profileVisibility: true,
          showLocation: true,
          showEmail: false,
          showPhone: false
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching settings'
    });
  }
};

// Update profile information
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, bio, location, skills } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(),
      _id: { $ne: req.user._id }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already taken by another user'
      });
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || '',
        bio: bio?.trim() || '',
        location: location?.trim() || '',
        skills: Array.isArray(skills) ? skills.map(skill => skill.trim()).filter(Boolean) : [],
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('name email phone bio location skills profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// Upload profile photo (Base64)
export const uploadProfilePhoto = async (req, res) => {
  try {
    const { profilePhoto } = req.body;

    if (!profilePhoto) {
      return res.status(400).json({
        success: false,
        message: 'No photo data provided'
      });
    }

    // Validate base64 format
    if (!profilePhoto.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format'
      });
    }

    // Update user with new profile photo
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        profilePhoto: profilePhoto,
        updatedAt: new Date()
      },
      { new: true }
    ).select('profilePhoto');

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        profilePhoto: updatedUser.profilePhoto
      }
    });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading photo'
    });
  }
};

// Update notification preferences
export const updateNotifications = async (req, res) => {
  try {
    const {
      emailNotifications,
      pushNotifications,
      marketingEmails,
      newMatches,
      messages,
      skillRequests
    } = req.body;

    const notifications = {
      emailNotifications: Boolean(emailNotifications),
      pushNotifications: Boolean(pushNotifications),
      marketingEmails: Boolean(marketingEmails),
      newMatches: Boolean(newMatches),
      messages: Boolean(messages),
      skillRequests: Boolean(skillRequests)
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        notifications,
        updatedAt: new Date()
      },
      { new: true }
    ).select('notifications');

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: updatedUser.notifications
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating notifications'
    });
  }
};

// Update privacy settings
export const updatePrivacy = async (req, res) => {
  try {
    const {
      profileVisibility,
      showLocation,
      showEmail,
      showPhone
    } = req.body;

    const privacy = {
      profileVisibility: Boolean(profileVisibility),
      showLocation: Boolean(showLocation),
      showEmail: Boolean(showEmail),
      showPhone: Boolean(showPhone)
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        privacy,
        updatedAt: new Date()
      },
      { new: true }
    ).select('privacy');

    res.status(200).json({
      success: true,
      message: 'Privacy settings updated successfully',
      data: updatedUser.privacy
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating privacy settings'
    });
  }
};

// Get user data for download
export const downloadUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('offerings')
      .select('-password -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare data for download
    const userData = {
      exportDate: new Date().toISOString(),
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        location: user.location,
        skills: user.skills,
        profilePhoto: user.profilePhoto,
        trustScore: user.trustScore,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      settings: {
        notifications: user.notifications,
        privacy: user.privacy
      },
      offerings: user.offerings,
      statistics: {
        totalOfferings: user.offerings?.length || 0,
        accountAge: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
      }
    };

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error downloading user data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while preparing user data'
    });
  }
};

// Delete user account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user data before deletion for cleanup
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // TODO: Add cleanup for related data
    // - Delete user's messages
    // - Delete user's matches
    // - Delete user's notifications
    // - Remove user from other users' matches
    
    // Delete the user account
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting account'
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user._id);
    
    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
};
