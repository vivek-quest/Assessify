import React from 'react';

const ControlButton = ({ icon, active, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`p-3 rounded-full ${active ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-200'
                } hover:bg-red-700 transition-colors duration-200`}
        >
            {icon}
        </button>
    );
};

export default ControlButton;