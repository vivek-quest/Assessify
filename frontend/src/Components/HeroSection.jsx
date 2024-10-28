import React from 'react';
import { ArrowRight } from 'lucide-react';
import HeroImg from '../assets/Images/manWithLaptop.png'
import { Link } from 'react-router-dom';

const HeroSection = () => {
    return (
        <div className="relative overflow-hidden bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl md:text-5xl">
                            <span className="block">Transform Interviews with</span>
                            <span className="block text-red-600">AI-Powered Intelligence</span>
                        </h1>
                        <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl mx-auto lg:mx-0 md:mt-5 md:text-xl">
                            Streamline your hiring process with our advanced AI interview platform. Create, conduct, and evaluate interviews efficiently while ensuring fair and comprehensive assessments.
                        </p>
                        <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                            <Link to={'/login'}>
                                <button className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#e53935e6] hover:bg-red-600 md:py-4 md:text-lg md:px-10">
                                    Get Started <ArrowRight className="ml-2 w-5 h-5 dancing-arrow" />
                                </button>
                            </Link>
                            <button className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200 md:py-4 md:text-lg md:px-10">
                                Learn More
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-center lg:justify-end">
                        <img
                            src={HeroImg}
                            alt="AI Interview Process Illustration"
                            className="w-full max-w-lg h-auto object-contain"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;