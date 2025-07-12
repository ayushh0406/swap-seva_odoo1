import express from "express";
import { authenticateUser, isAdmin } from "../middlewares/authMiddleware.js";
import {
  getDashboardStats,
  getAllUsersAdmin,
  toggleUserBan,
  getAllMatchesAdmin,
  moderateOfferings,
  sendPlatformNotification,
  getPlatformNotificationHistory,
  generateReport,
  getPendingOfferings
} from "../controllers/adminController.js";

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(authenticateUser);
router.use(isAdmin);

// Dashboard
router.get("/dashboard", getDashboardStats);

// User management
router.get("/users", getAllUsersAdmin);
router.patch("/users/:userId/ban", toggleUserBan);

// Match management
router.get("/matches", getAllMatchesAdmin);

// Content moderation
router.get("/offerings/pending", getPendingOfferings);
router.post("/offerings/moderate", moderateOfferings);

// Platform notifications
router.post("/notifications/send", sendPlatformNotification);
router.get("/notifications/history", getPlatformNotificationHistory);

// Reports
router.get("/reports", generateReport);

export default router; 