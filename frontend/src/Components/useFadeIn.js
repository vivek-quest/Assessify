import { useState, useEffect } from 'react';

const useFadeIn = (text, duration = 300) => {
    const [isVisible, setIsVisible] = useState(false);
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        if (text) {
            setDisplayText(text);
            setIsVisible(false);

            const timeout = setTimeout(() => {
                setIsVisible(true);
            }, 50);

            return () => clearTimeout(timeout);
        }
    }, [text]);

    return { displayText, isVisible };
};

export default useFadeIn;