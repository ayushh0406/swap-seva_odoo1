import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    },
    barterType: {
        type: String,
        enum: ['skill-for-skill', 'good-for-good', 'skill-for-good', 'good-for-skill'],
        required: true
    },
    offerings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        type: {
            type: String,
            enum: ['skill', 'good'],
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: String
    }],
    matchedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number], // [longitude, latitude]
        address: String
    },
    meetingTime: {
        date: Date,
        startTime: String,
        endTime: String
    },
    // For blockchain tracking
    useBlockchain: {
        type: Boolean,
        default: false
    },
    transactionHash: String,
    blockchainStatus: {
        type: String,
        enum: ['none', 'pending', 'confirmed'],
        default: 'none'
    },
    ratings: [{
        fromUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        toUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String
    }]
}, { timestamps: true });

// Add index for location-based queries
MatchSchema.index({ location: '2dsphere' });

const Match = mongoose.model('Match', MatchSchema);
export default Match; 