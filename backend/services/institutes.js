const { ROLE } = require("../config/enum");
const User = require("../models/User");
const interviewService = require("./interview");

class InstituteService {
    createInterview = interviewService.createInterview.bind(interviewService);
    updateInterview = interviewService.updateInterview.bind(interviewService);
    getInterview = interviewService.getInterview.bind(interviewService);
    getInterviews = interviewService.getInterviews.bind(interviewService);
    deleteInterview = interviewService.deleteInterview.bind(interviewService);

    async getCandidates({ instituteId, name, email, page = 1, limit = 10 }) {
        try {
            const filter = { _id: { $ne: instituteId }, isVerified: true, role: ROLE.CANDIDATE };

            if (name) filter.name = { $regex: name, $options: 'i' }; 
            if (email) filter.email = { $regex: email, $options: 'i' };

            const skip = (page - 1) * limit;

            const users = await User.find(filter)
                .skip(skip)
                .limit(limit)
                .exec();

            const total = await User.countDocuments(filter);

            return {
                users,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            throw new Error('Error retrieving candidates: ' + error.message);
        }
    }
    async getCandidate({ instituteId, candidateId }) {
        try {
            const candidate = await User.findOne({ _id: candidateId, institute: instituteId });
            return candidate;
        } catch (error) {
            throw new Error('Error retrieving candidate: ' + error.message);
        }
    }

}

module.exports = new InstituteService();