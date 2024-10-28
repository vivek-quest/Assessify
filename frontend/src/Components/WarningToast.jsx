import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

const WarningToast = ({
    message,
    duration = 3000,
    onClose
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{message}</span>
            </div>
        </div>
    );
};

export default WarningToast;