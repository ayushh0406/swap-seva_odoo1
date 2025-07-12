import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

export const authenticateUser = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const token = 
      req.cookies?.token || 
      req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required. Please login." 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found or session expired" 
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired. Please login again." 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: "Invalid authentication token" 
    });
  }
};

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: "Access denied. Admin privileges required." 
    });
  }
};

// Optional auth middleware - doesn't require auth but attaches user if present
export const optionalAuth = async (req, res, next) => {
  try {
    const token = 
      req.cookies?.token || 
      req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Proceed without authentication
    next();
  }
};
