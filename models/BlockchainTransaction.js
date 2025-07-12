import mongoose from 'mongoose';

const BlockchainTransactionSchema = new mongoose.Schema({
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    transactionHash: {
        type: String,
        required: true
    },
    network: {
        type: String,
        required: true
    },
    contractAddress: {
        type: String
    },
    value: {
        type: String,
        default: "0"
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'failed'],
        default: 'pending'
    },
    confirmedAt: {
        type: Date
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, { timestamps: true });

BlockchainTransactionSchema.index({ transactionHash: 1 }, { unique: true });
BlockchainTransactionSchema.index({ match: 1 });

const BlockchainTransaction = mongoose.model('BlockchainTransaction', BlockchainTransactionSchema);
export default BlockchainTransaction; 