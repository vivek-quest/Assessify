const express = require('express');
const authService = require('../services/auth');
const { apiKeyAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', apiKeyAuth, async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const user = await authService.signup(name, email, password, role);
        res.status(201).json({ message: 'User created', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/login', apiKeyAuth, async (req, res) => {
    const { email, password } = req.body;

    try {
        const { token, user } = await authService.login(email, password);
        res.header('Authorization', token).json({ token, user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    try {
        await authService.verifyEmail(token);
        res.send('Email verified successfully!');
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
