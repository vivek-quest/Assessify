const express = require('express');
const candidateService = require('../services/candidates');
const interviewService = require('../services/interview');

const router = express.Router();

router.get('/interviews', async (req, res) => {
    const { _id: candidateId } = req.user;
    const { sortBy, sortOrder, page, limit } = req.query;

    try {
        const result = await candidateService.getInterviews({
            candidateId,
            sortBy,
            sortOrder: parseInt(sortOrder, 10) || -1,
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
    const { status, sortBy, sortOrder, page, limit } = req.query;

    try {
        const attempts = await candidateService.getInterviewAttempts({
            candidateId,
            interviewId,
            status,
            sortBy,
            sortOrder: parseInt(sortOrder, 10) || -1,
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
        });

        res.status(200).json(attempts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/attempts', async (req, res) => {
    const { _id: candidateId } = req.user;
    const { status, sortBy, sortOrder, page, limit } = req.query;

    try {
        const attempts = await candidateService.getAttempts({
            candidateId,
            status,
            sortBy,
            sortOrder: parseInt(sortOrder, 10) || -1,
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
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

router.post('/interviews/:interviewId/attempts/:attemptId/initiate', async (req, res) => {
    const { _id: candidateId } = req.user;
    const { interviewId, attemptId } = req.params;

    try {
        const attempt = await interviewService.initiateInterview({
            interviewId,
            attemptId,
        });

        res.status(200).json(attempt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/interviews/:interviewId/attempts/:attemptId/continue', async (req, res) => {
    const { _id: candidateId } = req.user;
    const { interviewId, attemptId } = req.params;
    const { content } = req.body;

    try {
        const attempt = await interviewService.continueInterview({
            interviewId,
            attemptId,
            content
        });

        res.status(200).json(attempt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/interviews/:interviewId/attempts/:attemptId/end', async (req, res) => {
    const { _id: candidateId } = req.user;
    const { interviewId, attemptId } = req.params;

    try {
        const attempt = await interviewService.endInterview({
            interviewId,
            attemptId,
        });

        res.status(200).json(attempt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



module.exports = router;