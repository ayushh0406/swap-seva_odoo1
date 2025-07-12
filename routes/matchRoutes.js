import express from "express";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import {
  findMatches,
  createMatch,
  getUserMatches,
  getMatchDetails,
  updateMatchStatus,
  addRating,
  completeWithBlockchain
} from "../controllers/matchController.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Match discovery
router.get("/find", findMatches);

// Match operations
router.post("/create", createMatch);
router.get("/", getUserMatches);
router.get("/:matchId", getMatchDetails);
router.put("/:matchId/status", updateMatchStatus);
router.post("/:matchId/rating", addRating);
router.post("/:matchId/blockchain", completeWithBlockchain);

export default router; 