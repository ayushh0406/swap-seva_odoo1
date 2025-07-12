import express from "express";
import { authenticateUser, isAdmin } from "../middlewares/authMiddleware.js";
import {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  getSkillCategories
} from "../controllers/skillController.js";

const router = express.Router();

// Public routes
router.get("/", getAllSkills);
router.get("/categories", getSkillCategories);
router.get("/:id", getSkillById);

// Admin routes
router.post("/", authenticateUser, isAdmin, createSkill);
router.put("/:id", authenticateUser, isAdmin, updateSkill);
router.delete("/:id", authenticateUser, isAdmin, deleteSkill);

export default router; 