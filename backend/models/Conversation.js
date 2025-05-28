import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match'
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: new Map()
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Compound index to ensure unique conversations between two users
ConversationSchema.index({ participants: 1 }, { unique: true });

const Conversation = mongoose.model('Conversation', ConversationSchema);
export default Conversation; 