const { ROLE } = require("../config/enum");
const Interview = require("../models/Interview");
const User = require("../models/User");
const Attempt = require('../models/Attempt');

const mongoose = require("mongoose");

class InstituteService {
    async getCandidates({ instituteId, name, email, sortBy = 'createdAt', sortOrder = -1, page = 1, limit = 10 }) {
        try {
            const filter = { _id: { $ne: instituteId }, isVerified: true, role: ROLE.CANDIDATE };

            if (name) filter.name = { $regex: name, $options: 'i' }; 
            if (email) filter.email = { $regex: email, $options: 'i' };

            const skip = (page - 1) * limit;

            const users = await User.find(filter)
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limit)

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
    async getInterviews({ instituteId, sortBy = 'createdAt', sortOrder = -1, page = 1, limit = 10 }) {
        try {
            const filter = { institute: instituteId };
            const skip = (page - 1) * limit;
            const interviews = await Interview.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).exec();
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
    async getInterviewCandidates({ instituteId, interviewId, sortBy = 'createdAt', sortOrder = -1, page = 1, limit = 10 }) {
        try {
            const skip = (page - 1) * limit;
    
            instituteId = mongoose.Types.ObjectId.createFromHexString(instituteId.toString());
            interviewId = mongoose.Types.ObjectId.createFromHexString(interviewId.toString());
    
            // Get the total count of candidates
            const totalCandidates = await Interview.aggregate([
                { $match: { _id: interviewId, institute: instituteId } },
                { $lookup: { from: 'users', localField: 'candidates', foreignField: '_id', as: 'candidates' } },
                { $unwind: '$candidates' },
                { $count: 'total' }
            ]);
    
            const total = totalCandidates[0]?.total || 0;
    
            // Get the paginated and sorted candidates with min and max score
            const interview = await Interview.aggregate([
                { $match: { _id: interviewId, institute: instituteId } },
                { $lookup: { from: 'users', localField: 'candidates', foreignField: '_id', as: 'candidates' } },
                { $unwind: '$candidates' },
                {
                    $lookup: {
                        from: 'attempts',
                        let: { candidateId: '$candidates._id' },
                        pipeline: [
                            { $match: { $expr: { $and: [{ $eq: ['$interview', interviewId] }, { $eq: ['$candidate', '$$candidateId'] }] } } },
                            {
                                $group: {
                                    _id: '$candidate',
                                    minScore: { $min: '$result.score' },
                                    maxScore: { $max: '$result.score' }
                                }
                            }
                        ],
                        as: 'scoreData'
                    }
                },
                { $unwind: { path: '$scoreData', preserveNullAndEmptyArrays: true } },
                // Sort based on createdAt, minScore, or maxScore
                { $sort: { [sortBy === 'minScore' || sortBy === 'maxScore' ? `scoreData.${sortBy}` : `candidates.${sortBy}`]: sortOrder } },
                { $skip: skip },
                { $limit: limit },
                {
                    $group: {
                        _id: '$_id',
                        candidates: {
                            $push: {
                                _id: '$candidates._id',
                                name: '$candidates.name',
                                email: '$candidates.email',
                                createdAt: '$candidates.createdAt',
                                minScore: '$scoreData.minScore',
                                maxScore: '$scoreData.maxScore'
                            }
                        }
                    }
                },
                { $project: { candidates: 1 } }
            ]);
    
            const candidates = interview[0]?.candidates || [];
    
            return {
                candidates,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            throw new Error('Error retrieving interview candidates: ' + error.message);
        }
    }
    async getInterviewCandidateAttempts({ instituteId, interviewId, candidateId, status, sortBy = 'createdAt', sortOrder = -1, page = 1, limit = 10 }) {
        try {
            const interview =  await Interview.findOne({ _id: interviewId, institute: instituteId });

            if (!interview) throw new Error('Interview not found');

            const filter = { interview: interviewId, candidate: candidateId };

            if (status) filter.status = status;
            const skip = (page - 1) * limit;
            const attempts = await Attempt.find(filter).sort({ [sortBy]: sortOrder }).select('-metadata').skip(skip).limit(limit);
            const total = await Attempt.countDocuments(filter);
            return {
                attempts,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            throw new Error('Error retrieving interview candidate attempts: ' + error.message);
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