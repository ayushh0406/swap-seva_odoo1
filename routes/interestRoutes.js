import express from "express";
import { authenticateUser, isAdmin } from "../middlewares/authMiddleware.js";
import {
  getAllInterests,
  getInterestById,
  createInterest,
  updateInterest,
  deleteInterest,
  getInterestCategories
} from "../controllers/interestController.js";

const router = express.Router();

// Public routes
router.get("/", getAllInterests);
router.get("/categories", getInterestCategories);
router.get("/:id", getInterestById);

// Admin routes
router.post("/", authenticateUser, isAdmin, createInterest);
router.put("/:id", authenticateUser, isAdmin, updateInterest);
router.delete("/:id", authenticateUser, isAdmin, deleteInterest);

export default router; 