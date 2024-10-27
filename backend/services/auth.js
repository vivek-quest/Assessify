const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailService = require('./email'); // Import the email service
const { JWT_SECRET } = require('../config/config');

class AuthService {
    async signup(name, email, password, role) {
        const existingUser = await User.findOne({ email });
        if (existingUser) throw new Error('User already exists');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            verificationToken,
        });

        await user.save();

        await emailService.sendVerificationEmail(email, verificationToken);

        return user;
    }

    async verifyEmail(token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });
        if (!user) throw new Error('User not found');

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();
    }

    async login(email, password) {
        const user = await User.findOne({ email });
        if (!user) throw new Error('User not found');
        if (!user.isVerified) throw new Error('Email not verified');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Invalid password');

        const token = jwt.sign({ _id: user._id, role: user.role }, JWT_SECRET);
        return { token, user };
    }
}

module.exports = new AuthService();
