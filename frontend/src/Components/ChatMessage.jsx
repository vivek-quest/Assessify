import React from 'react';
import useFadeIn from './useFadeIn';

const ChatMessage = ({ role, content, isLatest }) => {
    const { displayText, isVisible } = useFadeIn(content);

    return (
        <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`rounded-2xl p-4 max-w-[80%] transition-opacity duration-300 ${role === 'user'
                        ? 'bg-[#e53935e6] text-white'
                        : 'bg-gray-100 text-gray-800'
                    } ${isLatest && !isVisible ? 'opacity-0' : 'opacity-100'}`}
            >
                <p className="whitespace-pre-wrap break-words">{isLatest ? displayText : content}</p>
            </div>
        </div>
    );
};

export default ChatMessage;