import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String, sparse: true, default: undefined },
  password: { type: String, required: true },
  avatar: { type: String, default: "/placeholder.svg" },
  trustScore: { type: Number, default: 50 },
  isVerified: { type: Boolean, default: false },
  walletAddress: String,
  createdAt: { type: Date, default: Date.now },
  
  // Role field for admin functionality
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  
  // Account status for admin management
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  bannedAt: { type: Date },
  bannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Profile fields
  bio: { type: String, default: "" },
  interests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interest' }],
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  profession: { type: String, default: "" },
  languages: [{ type: String }],
  
  // Modified location schema to be more flexible
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // Default to [0,0] to avoid geo errors
    address: { type: String }
  },

  // Barter offerings
  offerings: [{
    type: { type: String, enum: ['skill', 'good'], required: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    images: [{ type: String }],
    skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
    availableHours: [{ day: String, startTime: String, endTime: String }],
    // Admin moderation fields
    isApproved: { type: Boolean, default: true },
    isRejected: { type: Boolean, default: false },
    rejectionReason: { type: String },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: { type: Date }
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

// Create index for location-based queries, but only if coordinates are valid
UserSchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true });

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
