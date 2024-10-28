import React, { ReactNode } from 'react';

const FeatureCard = ({ icon, title, description }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
};

export default FeatureCard;