const mongoose = require('mongoose');
const { ROLE } = require('../config/enum');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: Object.keys(ROLE),
        default: ROLE.INSTITUTE,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
    },
}, { timestamps: true });

userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.verificationToken;
        delete ret.isVerified;
        return ret;
    },
});

module.exports = mongoose.model('User', userSchema);
