import React from 'react';
import AssessifyLogo from '../assets/Images/Assessify.png'
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link to={'/'}>
                        <div className="flex items-center gap-2">
                            <img src={AssessifyLogo} alt='Assessify Logo' className='w-12 h-12' />
                            <span className="text-xl font-bold text-gray-900">Assessify</span>
                        </div>
                    </Link>
                    <div className="hidden sm:flex items-center gap-6">
                        <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
                        <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
                        <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>
                        <Link to={'/login'}>
                            <button className="bg-[#e53935e6] text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200">
                                Login
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;