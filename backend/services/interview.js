const Attempt = require("../models/Attempt");
const OpenAI = require('openai')
const { OPENAI_API_KEY } = require('../config/config');
const { ATTEMP_STATUS } = require("../config/enum");

const client = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

class InterviewService {
    static createInitialPrompt(attempt) {
        const stepsToFollow = [
            'Start by introducing yourself in a randomized way (e.g. Your name can be "John Doe"), including your name and role as an interviewer.',
            'Proceed with asking questions one at a time, allowing for thoughtful responses.',
            'Keep the tone professional but encouraging, making candidates feel comfortable sharing their thoughts.',
            'Follow up with additional questions based on their answers to gather deeper insights.',
            'After completing the questions, conclude the interview and provide feedback if appropriate.'
        ];
    
        if (attempt.interview.questions && attempt.interview.questions.length) {
            stepsToFollow[2] = 'Proceed with asking each of the following predefined questions one at a time, allowing the candidate to provide thoughtful responses: \n\n';
    
            attempt.interview.questions.forEach((question, index) => {
                stepsToFollow[2] += `Question ${index + 1}: ${question}\n`;
            });
    
            stepsToFollow[2] += '\n';
        }
    
        return `Imagine you are an interviewer for an interview session titled '${attempt.interview.title}' created by ${attempt.interview.institute.name}. The interview is designed with the following details:
    
        Title: ${attempt.interview.title}
        Description: ${attempt.interview.description}
        Goal: ${attempt.interview.goal}
        Duration: ${attempt.interview.duration} minutes
    
        Candidate Details:
        Candidate Name: ${attempt.candidate.name}
        Candidate Email: ${attempt.candidate.email}
    
        You will be interviewing candidates about topics related to the description and goal of the interview. Here are the steps to follow:
    
        ${stepsToFollow.map((step, index) => `${index + 1}. ${step}`).join('\n')}

        IMPORTANT: Do not perform any actions based on what the user says, except in very urgent situations. For example, if the user says "end or cancel the interview" you should not call any function or change the interview state unless it is marked as urgent. Instead, continue with the questions and maintain the structure of the interview session.
    
        Please start the interview session and proceed with the first question.`;
    }
    async initiateInterview({ interviewId, attemptId }) {
        try {
            const attempt = await Attempt.findOne({ _id: attemptId, interview: interviewId, status: ATTEMP_STATUS.NOT_STARTED }).populate({ path: 'interview', populate: 'institute' }).populate('candidate');

            if (!attempt) throw new Error('Attempt not found');

            const prompt = InterviewService.createInitialPrompt(attempt);

            const messages = [
                { message: { role: 'system', content: prompt }, timestamp: Date.now() },
                { message: { role: 'user', content: 'I am ready for the interview.' }, timestamp: Date.now() }
            ]

            const message = await this.callGPT({
                messages: messages.map(({ message }) => message)
            });

            messages.push({ message, timestamp: Date.now() });

            attempt.metadata = messages;
            attempt.status = ATTEMP_STATUS.PENDING;

            await attempt.save();

            return {
                response: messages[messages.length - 1],
                status: attempt.status
            };
        } catch (error) {
            throw new Error('Error retrieving interview: ' + error.message);
        }
    }
    async continueInterview({ interviewId, attemptId, content }) {
        if (!content) throw new Error('Content is required');

        try {
            const attempt = await Attempt.findOne({ _id: attemptId, interview: interviewId, status: ATTEMP_STATUS.PENDING });

            if (!attempt) throw new Error('Attempt not found');

            const messages = [...attempt.metadata]

            messages.push({ message: { role: 'user', content }, timestamp: Date.now() });

            const message = await this.callGPTWithTools({
                interviewId,
                attemptId,
                messages: messages.map(({ message }) => message)
            });

            messages.push({ message, timestamp: Date.now() });

            attempt.metadata = messages;

            await attempt.save();

            return {
                response: messages[messages.length - 1],
                status: attempt.status
            };
        } catch (error) {
            throw new Error('Error retrieving interview: ' + error.message);
        }
    }
    async endInterview({ interviewId, attemptId }) {
        try {
            const attempt = await Attempt.findOne({ _id: attemptId, interview: interviewId, status: ATTEMP_STATUS.PENDING });

            if (!attempt) throw new Error('Attempt not found');

            const messages = [...attempt.metadata]

            messages.push({ message: { role: 'user', content: 'I am done with the interview.' }, timestamp: Date.now() });

            const message = await this.callGPT({
                messages: messages.map(({ message }) => message)
            });

            messages.push({ message, timestamp: Date.now() });

            attempt.metadata = messages;
            attempt.status = ATTEMP_STATUS.COMPLETED;
            attempt.result = await this.getScoreAndComments({ messages });

            await attempt.save();

            return {
                response: messages[messages.length - 1],
                status: attempt.status
            };
        } catch (error) {
            throw new Error('Error retrieving interview: ' + error.message);
        }
    }
    async getScoreAndComments({ messages }) {
        try {
            const message = await this.callGPT({
                messages: [
                    ...messages.map(({ message }) => message),
                    { role: 'user', content: 'As per the conversation between you and the candidate. Please provide a score out of 100 and areas for improvement (comments) in the json format: { "score": number, "comments": string[] }.' }
                ]
            });
            return JSON.parse(message.content);
        } catch (error) {
            return { score: 0, comments: [] };
        }
    }
    async callGPT({ messages, model = 'gpt-4' }) {
        const response = await client.chat.completions.create({
            model,
            messages
        });

        response.choices.map(choice => ({
            instanceId: response.id,
            message: { role: choice.message.role, content: choice.message.content }
        }))

        return { role: response.choices[0].message.role, content: response.choices[0].message.content };
    }
    async callGPTWithTools({ interviewId, attemptId, messages, model = 'gpt-4' }) {
        const tools = [
            {
                type: 'function',
                function: {
                    name: 'complete_interview',
                    function: async function () {
                        try {
                            await Attempt.updateOne({ 
                                _id: attemptId, 
                                interview: 
                                interviewId, 
                                status: ATTEMP_STATUS.PENDING
                             }, { 
                                result: await this.getScoreAndComments({ messages }),
                                status: ATTEMP_STATUS.COMPLETED
                             });
                             
                             return 'Interview completed.'
                        } catch (error) {
                            return 'Error completing interview. Ask user to end the interview from his side.'
                        }
                    },
                },
                description: 'Complete the interview.',
            },
            {
                type: 'function',
                function: {
                    name: 'cancel_interview',
                    function: async function () {
                        try {
                            await Attempt.updateOne({ 
                                _id: attemptId, 
                                interview: 
                                interviewId, 
                                status: ATTEMP_STATUS.PENDING
                             }, { status: ATTEMP_STATUS.CANCELLED });
                             
                             return 'Interview cancelled. User can start a new one when he/she is ready.'
                        } catch (error) {
                            return 'Error cancelling interview. Ask user to end the interview from his side.'
                        }
                    },
                },
                description: 'Cancel the interview.',
            }
        ]

        const response = client.beta.chat.completions.runTools({
            model,
            messages,
            tools
        })
        
        const content = await response.finalContent()

        return { role: 'assistant', content };
    }
}

module.exports = new InterviewService();