import express from "express";
import { 
    signup, 
    login, 
    logout, 
    getCurrentUser, 
    updatePassword, 
    forgotPassword, 
    resetPassword 
} from "../controllers/authController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Test route
router.get("/status", (req, res) => {
  res.json({ status: "Auth API is working" });
});

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/me", authenticateUser, getCurrentUser);
router.put("/update-password", authenticateUser, updatePassword);

export default router;
