import { useState, useEffect } from 'react';

const useTypeWriter = (text, speed = 30) => {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        let i = 0;
        setDisplayText('');

        const timer = setInterval(() => {
            setDisplayText(prev => prev + text.charAt(i));
            i++;

            if (i >= text.length) {
                clearInterval(timer);
            }
        }, speed);

        if (text.length > 0) {
            setDisplayText(text.charAt(0));
            i = 1;
        }

        return () => clearInterval(timer);
    }, [text, speed]);

    return displayText;
};

export default useTypeWriter;