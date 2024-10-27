const Interview = require("../models/Interview");
const Attempt = require("../models/Attempt");

class CandidateService {
    async getInterviews({ instituteId, page = 1, limit = 10 }) {
        try {
            const filter = { };
            if (instituteId) filter.institute = instituteId;
            const skip = (page - 1) * limit;
            const interviews = await Interview.find(filter).skip(skip).limit(limit).exec();
            const total = await Interview.countDocuments(filter);
            return {
                interviews,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            throw new Error('Error retrieving interviews: ' + error.message);
        }
    }
    async getInterview({ interviewId }) {
        try {
            const interview = await Interview.findOne({ _id: interviewId }).populate('candidates');
            return interview;
        } catch (error) {
            throw new Error('Error retrieving interview: ' + error.message);
        }
    }
    async attemptInterview({ candidateId, interviewId }) {
        try {
            const interview = await Interview.findOne({
                _id: interviewId
            })

            if (!interview) throw new Error('Interview not found');

            if(!interview.candidates.includes(candidateId)){
                interview.candidates.push(candidateId);
                await interview.save();
            }

            const attempt = new Attempt({
                candidate: candidateId,
                interview: interviewId
            });

            await attempt.save();

            return attempt;
        } catch (error) {
            throw new Error(`Error attempt interview: ${error.message}`);
        }
    }
    async getInterviewAttempts({ interviewId, candidateId, page = 1, limit = 10 }) {
        try {
            const filter = { interview: interviewId, candidate: candidateId };
            const skip = (page - 1) * limit;
            const attempts = await Attempt.find(filter).skip(skip).limit(limit);
            const total = await Attempt.countDocuments(filter);
            return {
                attempts,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            throw new Error('Error retrieving attempts: ' + error.message);
        }
    }
    async getAttempt({ attemptId, candidateId }) {
        try {
            const attempt = await Attempt.findOne({ _id: attemptId, candidate: candidateId });
            return attempt;
        } catch (error) {
            throw new Error('Error retrieving attempt: ' + error.message);
        }
    }
}

module.exports = new CandidateService();