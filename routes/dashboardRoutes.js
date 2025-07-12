import express from 'express';
const router = express.Router();
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { getDashboardStats, getRecentActivities } from '../controllers/dashboardController.js';

// Get dashboard statistics
router.get('/stats', authenticateUser, getDashboardStats);

// Get recent activities
router.get('/activities', authenticateUser, getRecentActivities);

export default router;
