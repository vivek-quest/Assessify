const mongoose = require('mongoose');
const { ATTEMP_STATUS } = require('../config/enum');

const attemptSchema = new mongoose.Schema({
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    interview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview',
        required: true,
    },
    result: {
        score: {
            type: Number,
            default: 0,
        },
        comments: {
            type: [String],
            default: [],
        },
    },
    metadata: {
        type: [Object],
        default: [],
    },
    status: {
        type: String,
        enum: Object.values(ATTEMP_STATUS),
        default: ATTEMP_STATUS.NOT_STARTED,
    },
}, { timestamps: true });

module.exports = mongoose.model('Attempt', attemptSchema);
