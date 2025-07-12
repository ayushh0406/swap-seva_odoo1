import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String, sparse: true, default: undefined },
  password: { type: String, required: true },
  avatar: { type: String, default: "/placeholder.svg" },
  profilePhoto: { type: String, default: "" },
  trustScore: { type: Number, default: 50 },
  isVerified: { type: Boolean, default: false },
  walletAddress: String,
  createdAt: { type: Date, default: Date.now },

  // Profile fields
  bio: { type: String, default: "" },
  interests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interest' }],
  skills: [{ type: String }], // Changed to simple string array for easier management
  profession: { type: String, default: "" },
  languages: [{ type: String }],
  
  // Simplified location as string
  location: { type: String, default: "" },

  // User connections and activity tracking
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  completedTrades: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },

  // Barter offerings
  offerings: [{
    type: { type: String, enum: ['skill', 'good'], required: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    images: [{ type: String }],
    skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
    availableHours: [{ day: String, startTime: String, endTime: String }]
  }],

  // Barter needs
  needs: [{
    type: { type: String, enum: ['skill', 'good'], required: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    preferredLocation: { type: String },
    urgency: { type: String, enum: ['low', 'medium', 'high'] }
  }],

  // Notification settings
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
    newMatches: { type: Boolean, default: true },
    messages: { type: Boolean, default: true },
    skillRequests: { type: Boolean, default: true }
  },

  // Privacy settings
  privacy: {
    profileVisibility: { type: Boolean, default: true },
    showLocation: { type: Boolean, default: true },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false }
  },

  // Legacy notification settings (keeping for backward compatibility)
  notificationSettings: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    matches: { type: Boolean, default: true },
    messages: { type: Boolean, default: true },
    systemUpdates: { type: Boolean, default: true }
  },

  // Preferences
  preferences: {
    maxDistance: { type: Number, default: 50 }, // km
    useBlockchain: { type: Boolean, default: false }
  }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", UserSchema);
export default User;
