import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import interestRoutes from "./routes/interestRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

// Middleware imports
import { authenticateUser } from "./middlewares/authMiddleware.js";

dotenv.config();

// Make sure we have a JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.warn("⚠️ No JWT_SECRET in environment, using fallback secret. This is not secure for production!");
  process.env.JWT_SECRET = "mumbai_swap_dev_secret_key_2024";
}

// Define frontend URL - must be specific when using credentials
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
    // Removed credentials for simplicity
  },
});

// Middleware
app.use(cors({
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  // Removed credentials
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Add preflight OPTIONS handling for all routes
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
  res.sendStatus(200);
});

// Make io accessible to routes
app.set('io', io);

// Add detailed debugging
console.log('Starting server...');
console.log('Environment:', process.env.NODE_ENV || 'development');

// Check MongoDB connection status
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://panigrahibalram16:Ping420+@cluster0.ne7hd.mongodb.net/Swap_sewa1?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((error) => console.error("❌ MongoDB connection error:", error));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/interests", interestRoutes);
app.use("/api/chats", chatRoutes);

// Socket.io middleware for authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error("Authentication error"));
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    
    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    next(new Error("Authentication error"));
  }
});

// Handle user connections
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.userId);
  
  // Join user's personal room for direct messages
  socket.join(`user-${socket.userId}`);
  
  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.userId);
  });
  
  // Listen for join conversation
  socket.on("join-conversation", (conversationId) => {
    socket.join(`conversation-${conversationId}`);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
  });
  
  // Listen for leave conversation
  socket.on("leave-conversation", (conversationId) => {
    socket.leave(`conversation-${conversationId}`);
    console.log(`User ${socket.userId} left conversation ${conversationId}`);
  });
  
  // Handle user typing status
  socket.on("typing", ({ conversationId, isTyping }) => {
    socket.to(`conversation-${conversationId}`).emit("user-typing", {
      userId: socket.userId,
      isTyping
    });
  });
  
  // Handle user online status
  socket.on("set-status", (status) => {
    // Broadcast to all connected users
    socket.broadcast.emit("user-status-change", {
      userId: socket.userId,
      status
    });
  });
  
  // Handle video/audio call signaling
  socket.on("call-signal", ({ to, signal, callType }) => {
    console.log(`Call signal from ${socket.userId} to ${to}, type: ${callType}`)
    io.to(`user-${to}`).emit("call-signal", {
      from: socket.userId,
      signal,
      callType
    })
  })
  
  // User initiating a call
  socket.on("initiate-call", async ({ to, callType }) => {
    try {
      // Get caller user info to send to recipient
      const user = await mongoose.model('User').findById(socket.userId).select('name avatar').lean()
      
      console.log(`Call initiated from ${user.name} (${socket.userId}) to ${to}, type: ${callType}`)
      
      io.to(`user-${to}`).emit("incoming-call", {
        from: socket.userId,
        name: user.name,
        avatar: user.avatar,
        callType
      })
    } catch (error) {
      console.error("Error initiating call:", error)
    }
  })
  
  // Call accepted
  socket.on("call-accepted", ({ to, callType }) => {
    console.log(`Call accepted by ${socket.userId}, notifying ${to}`)
    io.to(`user-${to}`).emit("call-accepted", {
      from: socket.userId,
      callType
    })
  })
  
  // Call rejected
  socket.on("call-rejected", ({ to }) => {
    console.log(`Call rejected by ${socket.userId}, notifying ${to}`)
    io.to(`user-${to}`).emit("call-rejected", {
      from: socket.userId
    })
  })
  
  // Call ended
  socket.on("call-ended", ({ to }) => {
    console.log(`Call ended by ${socket.userId}, notifying ${to}`)
    io.to(`user-${to}`).emit("call-ended", {
      from: socket.userId
    })
  })
  
  // User is busy (already in another call)
  socket.on("user-busy", ({ to }) => {
    console.log(`User ${socket.userId} is busy, notifying ${to}`)
    io.to(`user-${to}`).emit("user-busy", {
      from: socket.userId
    })
  })
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
