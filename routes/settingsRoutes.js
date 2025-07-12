import express from 'express';
import {
  getUserSettings,
  updateProfile,
  uploadProfilePhoto,
  updateNotifications,
  updatePrivacy,
  downloadUserData,
  deleteAccount,
  changePassword
} from '../controllers/settingsController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateUser);

// GET /api/settings - Get user settings
router.get('/', getUserSettings);

// PUT /api/settings/profile - Update profile information
router.put('/profile', updateProfile);

// PUT /api/settings/profile/photo - Upload profile photo
router.put('/profile/photo', uploadProfilePhoto);

// PUT /api/settings/notifications - Update notification preferences
router.put('/notifications', updateNotifications);

// PUT /api/settings/privacy - Update privacy settings
router.put('/privacy', updatePrivacy);

// PUT /api/settings/password - Change password
router.put('/password', changePassword);

// GET /api/settings/download - Download user data
router.get('/download', downloadUserData);

// DELETE /api/settings/account - Delete user account
router.delete('/account', deleteAccount);

export default router;
