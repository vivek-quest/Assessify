import React from 'react';
import useTypeWriter from './useTypeWriter';

const ChatMessage = ({ role, content }) => {
    const typeWriterText = useTypeWriter(content);
    const displayText = role === 'ai' ? typeWriterText : content;

    return (
        <div className={`flex ${role === 'ai' ? 'justify-start' : 'justify-end'}`}>
            <div
                className={`max-w-[80%] p-4 rounded-2xl ${role === 'ai'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-red-600 text-white'
                    }`}
            >
                <p className="text-sm">{displayText}</p>
            </div>
        </div>
    );
};

export default ChatMessage;
