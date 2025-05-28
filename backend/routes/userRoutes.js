import express from "express";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import {
  getUserProfile,
  updateUserProfile,
  updateInterests,
  updateSkills,
  addOffering,
  updateOffering,
  deleteOffering,
  addNeed,
  updateNeed,
  deleteNeed,
  updateNotificationSettings,
  updatePreferences,
  getAllUsers,
  sendConnectionRequest
} from "../controllers/userController.js";

const router = express.Router();

// Public routes
router.get("/", authenticateUser, getAllUsers); // Get all users with optional filters

// Profile routes
router.get("/profile", authenticateUser, getUserProfile);
router.put("/profile", authenticateUser, updateUserProfile);
router.put("/interests", authenticateUser, updateInterests);
router.put("/skills", authenticateUser, updateSkills);

// Offerings routes
router.post("/offerings", authenticateUser, addOffering);
router.put("/offerings/:offeringId", authenticateUser, updateOffering);
router.delete("/offerings/:offeringId", authenticateUser, deleteOffering);

// Connection request route
router.post("/connect", authenticateUser, sendConnectionRequest);

// Needs routes
router.post("/needs", authenticateUser, addNeed);
router.put("/needs/:needId", authenticateUser, updateNeed);
router.delete("/needs/:needId", authenticateUser, deleteNeed);

// Settings routes
router.put("/notification-settings", authenticateUser, updateNotificationSettings);
router.put("/preferences", authenticateUser, updatePreferences);

// Add a test endpoint
router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Test endpoint is working"
  });
});

export default router;
