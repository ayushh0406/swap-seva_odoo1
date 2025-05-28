import express from "express";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  startConversation,
  initiateCall,
  respondToCall,
  endCall
} from "../controllers/messageController.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Conversation routes
router.get("/conversations", getUserConversations);
router.get("/conversations/:conversationId/messages", getConversationMessages);
router.post("/conversations/start", startConversation);
router.post("/messages", sendMessage);

// Call routes
router.post("/calls/initiate", initiateCall);
router.post("/calls/respond", respondToCall);
router.post("/calls/end", endCall);

export default router; 