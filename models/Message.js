import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'image', 'audio', 'video', 'call_request', 'call_response'],
        default: 'text'
    },
    content: {
        type: String,
        required: true
    },
    attachments: [{
        type: String, // URL to the attachment
        contentType: String // MIME type
    }],
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    callDetails: {
        duration: Number, // in seconds
        type: String, // 'audio' or 'video'
        status: String // 'missed', 'completed', 'declined'
    }
}, { timestamps: true });

const Message = mongoose.model('Message', MessageSchema);
export default Message; 