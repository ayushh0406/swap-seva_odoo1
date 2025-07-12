import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: [
            'match', 
            'message', 
            'barter_request', 
            'barter_accepted', 
            'barter_rejected',
            'barter_completed',
            'rating_received',
            'system',
            'trade_confirmed'
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    data: {
        type: mongoose.Schema.Types.Mixed
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    expiresAt: {
        type: Date
    }
}, { timestamps: true });

// Index for faster queries on recipient and read status
NotificationSchema.index({ recipient: 1, read: 1 });

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification; 