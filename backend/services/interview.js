const Interview = require("../models/Interview");

class InterviewService {
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
    async addCandidate({ instituteId, interviewId, candidateId }) {
        try {
            const interview = await Interview.findOne({
                _id: interviewId,
                institute: instituteId,
                candidates: { $in: [candidateId] }
            });
    
            if (interview) {
                throw new Error('Candidate already exists in this interview');
            }
    
            const updatedInterview = await Interview.findByIdAndUpdate(
                interviewId,
                { $push: { candidates: candidateId } },
                { new: true }
            );
    
            return { message: 'Candidate added to interview successfully', interview: updatedInterview };
        } catch (error) {
            throw new Error(`Error adding candidate to interview: ${error.message}`);
        }
    }
    async getCandidates({ instituteId, interviewId }) {
        try {
            const interview = await Interview.findOne({ _id: interviewId, instituteId }).populate('candidates');
            return interview.candidates;
        } catch (error) {
            throw new Error('Error retrieving candidates: ' + error.message);
        }
    }

}

module.exports = new InterviewService();