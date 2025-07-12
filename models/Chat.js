import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const TradeInfoSchema = new mongoose.Schema({
  initiatorOffering: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  responderOffering: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  confirmedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
});

const ChatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messages: [MessageSchema],
  lastMessage: {
    content: String,
    timestamp: Date,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  tradeInfo: TradeInfoSchema,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
ChatSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Set unreadCount if it's not set
  if (!this.unreadCount || this.unreadCount.size === 0) {
    if (this.participants && this.participants.length > 0) {
      this.participants.forEach(participantId => {
        if (participantId) {
          this.unreadCount.set(participantId.toString(), 0);
        }
      });
    }
  }
  
  // Update lastMessage if there are messages
  if (this.messages && this.messages.length > 0) {
    const lastMsg = this.messages[this.messages.length - 1];
    this.lastMessage = {
      content: lastMsg.content,
      timestamp: lastMsg.timestamp,
      sender: lastMsg.sender
    };
  }
  
  // Add validation logging
  if (!this.participants || this.participants.length === 0) {
    console.warn('Chat is being saved without participants');
  }
  
  if (!this.tradeInfo || !this.tradeInfo.initiatorOffering || !this.tradeInfo.responderOffering) {
    console.warn('Chat is being saved with incomplete trade info:', this.tradeInfo);
  }
  
  // Add a pre-save hook to validate the chat
  console.log('Saving chat:', this._id);
  
  // Check if participants exist
  if (!this.participants || this.participants.length < 2) {
    console.error('Chat validation error: Insufficient participants');
    return next(new Error('Chat must have at least 2 participants'));
  }
  
  // Validate trade info
  if (this.tradeInfo) {
    if (!this.tradeInfo.initiatorOffering) {
      console.error('Chat validation error: Missing initiatorOffering');
      return next(new Error('Trade info must include initiatorOffering'));
    }
    
    if (!this.tradeInfo.responderOffering) {
      console.error('Chat validation error: Missing responderOffering');
      return next(new Error('Trade info must include responderOffering'));
    }
    
    console.log('Chat trade info validated');
  }
  
  console.log('Chat validation passed');
  next();
});

// Add indexes for faster queries
ChatSchema.index({ participants: 1 });
ChatSchema.index({ updatedAt: -1 });

const Chat = mongoose.model('Chat', ChatSchema);
export default Chat; 