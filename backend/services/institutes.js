const { ROLE } = require("../config/enum");
const Interview = require("../models/Interview");
const User = require("../models/User");

class InstituteService {
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
    async createInterview({ instituteId, title, description, goal, duration, questions }) {
        try {
            if(duration < 5) throw new Error('Interview duration must be at least 5 minutes');

            const interview = new Interview({ 
                title, 
                description, 
                goal, 
                duration, 
                questions, 
                institute: instituteId 
            });
            await interview.save();
            return interview;
        } catch (error) {
            throw new Error('Error creating interview: ' + error.message);
        }
    }
    async updateInterview({ instituteId, interviewId, title, description, goal, duration, questions }) {
        try {
            const filter = { _id: interviewId, institute: instituteId };
            const update = { 
                title, 
                description, 
                goal, 
                duration, 
                questions 
            };
            const options = { new: true };
            const interview = await Interview.findOneAndUpdate(filter, update, options).exec();
            return interview;
        } catch (error) {
            throw new Error('Error updating interview: ' + error.message);
        }
    }
    async getInterviews({ instituteId, page = 1, limit = 10 }) {
        try {
            const filter = { institute: instituteId };
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
    async getInterview({ instituteId, interviewId }) {
        try {
            const interview = await Interview.findOne({ _id: interviewId, institute: instituteId }).exec();
            return interview;
        } catch (error) {
            throw new Error('Error retrieving interview: ' + error.message);
        }
    }
    async deleteInterview({ instituteId, interviewId }) {
        try {
            await Interview.deleteOne({ _id: interviewId, institute: instituteId }).exec();
        } catch (error) {
            throw new Error('Error deleting interview: ' + error.message);
        }
    }
}

module.exports = new InstituteService();