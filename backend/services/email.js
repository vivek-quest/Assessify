const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { EMAIL_USER, EMAIL_PASS } = require('../config/config');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            },
        });
    }

    async sendVerificationEmail(to, token) {
        const url = `http://localhost:5000/api/auth/verify-email?token=${token}`;
        const message = {
            from: EMAIL_USER,
            to,
            subject: 'Email Verification',
            text: `Click the link to verify your email: ${url}`,
        };

        try {
            await this.transporter.sendMail(message);
            console.log(`Verification email sent to ${to}`);
        } catch (error) {
            console.error(`Error sending email: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new EmailService();
