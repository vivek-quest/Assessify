const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    questions: {
        type: Array,
        default: null,
    },
    goal: {
        type: String,
        required: false,
    },
    duration: {
        type: Number,
        required: true,
    },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    candidates: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
    }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
