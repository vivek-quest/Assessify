import { useState, useEffect, useCallback } from 'react';

const useTypeWriter = (text, speed = 30) => {
    const [displayText, setDisplayText] = useState('');

    const typeText = useCallback(() => {
        const textArray = text.split('');
        let currentIndex = 0;

        setDisplayText('');

        const interval = setInterval(() => {
            if (currentIndex < textArray.length) {
                setDisplayText(prev => prev + textArray[currentIndex]);
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    useEffect(() => {
        const cleanup = typeText();
        return () => {
            if (cleanup) cleanup();
        };
    }, [typeText]);

    return displayText;
};

export default useTypeWriter;