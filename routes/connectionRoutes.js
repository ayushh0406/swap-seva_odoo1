import express from 'express';
const router = express.Router();
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { 
  sendConnectionRequest, 
  acceptConnectionRequest, 
  getUserConnections 
} from '../controllers/connectionController.js';

// Send connection request
router.post('/send-request', authenticateUser, sendConnectionRequest);

// Accept connection request
router.post('/accept-request', authenticateUser, acceptConnectionRequest);

// Get user connections
router.get('/my-connections', authenticateUser, getUserConnections);

export default router;
