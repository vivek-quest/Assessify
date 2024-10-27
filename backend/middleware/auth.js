const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailService = require('../services/email');
const { JWT_SECRET, API_KEY } = require('../config/config');

const auth = (roles) => {
    return async (req, res, next) => {
        const token = req.header('Authorization')?.slice(7);
        if (!token) return res.status(401).json({ error: 'Access Denied' });

        try {
            const verified = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(verified._id);
            if (!user) return res.status(404).json({ error: 'User not found' });

            if (!user.isVerified) {
                const verificationToken = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
                user.verificationToken = verificationToken;

                await user.save();
                emailService.sendVerificationEmail(user.email, verificationToken);

                return res.status(403).json({ message: 'Verification email sent' });
            }

            if (roles && !roles.includes(user.role)) {
                return res.status(403).json({ error: 'Access forbidden: insufficient permissions' });
            }

            req.user = user;
            next();
        } catch (err) {
            res.status(400).json({ error: 'Invalid Token' });
        }
    };
};

const apiKeyAuth = (req, res, next) => {
    const apiKey = req.header('x-api-key'); 
    const expectedApiKey = API_KEY;

    if (!apiKey) {
        return res.status(401).json({ error: 'Access Denied: API Key required' });
    }

    if (apiKey !== expectedApiKey) {
        return res.status(403).json({ error: 'Access forbidden: Invalid API Key' });
    }

    next();
};

module.exports = { auth, apiKeyAuth };
