const Interview = require("../models/Interview");

class InterviewService {
    static createPrompt(interview) {
        const stepsToFollow = [
            'Start by introducing yourself and the interview purpose.',
            'Proceed with asking questions one at a time, allowing for thoughtful responses.',
            'Keep the tone professional but encouraging, making candidates feel comfortable sharing their thoughts.',
            'Follow up with additional questions based on their answers to gather deeper insights.',
            'After completing the questions, conclude the interview and provide feedback if appropriate.'
        ]

        if(interview.questions && interview.questions.length) {
            stepsToFollow[2] = 'Proceed with asking each of the following predefined questions one at a time, allowing the candidate to provide thoughtful responses: \n\n';

            interview.questions.forEach((question, index) => {
                stepsToFollow[2] += `Question ${index + 1}: ${question}\n`;
            })

            stepsToFollow[2] += '\n'
        }

        return `Imagine you are an interviewer for an interview session titled '[Title]' created by [Institute Name]. The interview is designed with the following details:

        Title: ${interview.title}
        Description: ${interview.description}
        Goal: ${interview.goal}
        Duration: ${interview.duration} minutes
        
        You will be interviewing candidates about topics related to the description and goal of the interview. Here are the steps to follow:

        ${stepsToFollow.map((step, index) => `${index + 1}. ${step}`).join('\n')}

        Please start the interview session and proceed with the first question.`
    }
}

module.exports = new InterviewService();