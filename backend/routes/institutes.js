const express = require('express');
const instituteService = require('../services/institutes');

const router = express.Router();

router.get('/candidates', async (req, res) => {
    const { _id: instituteId } = req.user
    const { name, email, page, limit } = req.query;

    try {
        const result = await instituteService.getCandidates({
            instituteId,
            name,
            email,
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/candidates/:candidateId', async (req, res) => {
    const { _id: instituteId } = req.user;
    const { candidateId } = req.params;

    try {
        const candidate = await instituteService.getCandidate({ candidateId });

        res.status(200).json(candidate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post('/interviews', async (req, res) => {
    const { _id: instituteId } = req.user;
    const { title, description, goal, duration, questions } = req.body;

    try {
        const interview = await instituteService.createInterview({
            instituteId,
            title,
            description,
            goal,
            duration,
            questions,
        });

        res.status(201).json(interview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/interviews/:interviewId', async (req, res) => {
    const { _id: instituteId } = req.user;
    const { interviewId } = req.params;
    const { title, description, goal, duration, questions } = req.body;

    try {
        const interview = await instituteService.updateInterview({
            instituteId,
            interviewId,
            title,
            description,
            goal,
            duration,
            questions,
        });

        res.status(200).json(interview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})
router.get('/interviews', async (req, res) => {
    const { _id: instituteId } = req.user;
    const { page, limit } = req.query;

    try {
        const result = await instituteService.getInterviews({
            instituteId,
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 10,
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/interviews/:interviewId', async (req, res) => {
    const { _id: instituteId } = req.user;
    const { interviewId } = req.params;

    try {
        const interview = await instituteService.getInterview({
            instituteId,
            interviewId,
        });

        res.status(200).json(interview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/interviews/:interviewId', async (req, res) => {
    const { _id: instituteId } = req.user;
    const { interviewId } = req.params;

    try {
        await instituteService.deleteInterview({
            instituteId,
            interviewId,
        });

        res.status(200).json({ message: 'Interview deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/interviews/:interviewId/candidates', async (req, res) => {
    const { _id: instituteId } = req.user;
    const { interviewId } = req.params;

    try {
        const candidates = await instituteService.getCandidates({
            instituteId,
            interviewId,
        });

        res.status(200).json(candidates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
