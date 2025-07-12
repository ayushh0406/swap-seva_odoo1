import mongoose from 'mongoose';

const InterestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 30,
    },
    description: {
        type: String,
        required: true,
        min: 3,
        max: 100,
    },
    image: {
        type: String,
        default: "",
    },
    category: {
        type: String,
        required: true,
        enum: ['art', 'music', 'sports', 'cooking', 'technology', 'education', 'lifestyle', 'other']
    },
    status: {
        type: String,
        default: "active",
    },
}, { timestamps: true });

const Interest = mongoose.model('Interest', InterestSchema);
export default Interest;