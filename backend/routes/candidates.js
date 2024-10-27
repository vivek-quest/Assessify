const express = require('express');
const candidateService = require('../services/candidates');

const router = express.Router();

router.get('/interviews', async (req, res) => {
    const { _id: candidateId } = req.user;
    const { page, limit } = req.query;

    try {
        const result = await candidateService.getInterviews({
            candidateId,
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/interviews/:interviewId', async (req, res) => {
    const { interviewId } = req.params;

    try {
        const interview = await candidateService.getInterview({
            interviewId,
        });

        res.status(200).json(interview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/interviews/:interviewId/attempts', async (req, res) => {
    const { _id: candidateId } = req.user;
    const { interviewId } = req.params;

    try {
        const attempt = await candidateService.attemptInterview({
            candidateId,
            interviewId,
        });

        res.status(200).json(attempt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/interviews/:interviewId/attempts', async (req, res) => {
    const { _id: candidateId } = req.user;
    const { interviewId } = req.params;

    try {
        const attempts = await candidateService.getInterviewAttempts({
            candidateId,
            interviewId,
        });

        res.status(200).json(attempts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/interviews/:interviewId/attempts/:attemptId', async (req, res) => {
    const { _id: candidateId } = req.user;
    const { attemptId } = req.params;

    try {
        const attempt = await candidateService.getAttempt({
            candidateId,
            attemptId,
        });

        res.status(200).json(attempt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



module.exports = router;