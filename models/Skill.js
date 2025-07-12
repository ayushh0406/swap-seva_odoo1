import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['tech', 'arts', 'music', 'language', 'sports', 'crafts', 'cooking', 'academics', 'professional', 'other']
    },
    image: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: "active"
    }
}, { timestamps: true });

const Skill = mongoose.model('Skill', SkillSchema);
export default Skill; 