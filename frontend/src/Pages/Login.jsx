import React, { useEffect, useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { BACKEND_URL } from '../assets/config';
import axios from 'axios';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formDetails, setFormDetails] = useState({
        name: '',
        email: '',
        password: '',
        role: 'CANDIDATE'
    });
    const [isRemember, setIsRemember] = useState(false);

    useEffect(() => {
        let userDetails = localStorage.getItem('userDetails');
        if (userDetails) {
            setIsLogin(true);
            setFormDetails(JSON.parse(userDetails));
        }
    }, []);

    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
    const validatePassword = (password) => password.length >= 6;

    const handleLogin = async () => {
        try {
            if (!formDetails.email || !formDetails.password) {
                toast.error('Please fill out email and password');
                return;
            } else if (!validateEmail(formDetails.email)) {
                toast.error('Please enter a valid email');
                return;
            } else if (!validatePassword(formDetails.password)) {
                toast.error('Password must be at least 6 characters');
                return;
            }

            if (isRemember) {
                localStorage.setItem('userDetails', JSON.stringify(formDetails));
            }

            let res = await axios.post(`${BACKEND_URL}/auth/signup`, formDetails);
            // if (res.successful) {
            //     toast.success('Login successful');
            //     window.location.href = '/dashboard';
            // } else {
            //     toast.error(res.message);
            // }
        } catch (error) {
            console.error('Login error', error);
            toast.error('Something went wrong, please try again');
        }
    };

    const handleRegister = async () => {
        try {
            if (formDetails.role === 'CANDIDATE' && (!formDetails.name || !formDetails.email || !formDetails.password)) {
                toast.error('Please fill out full name, email, and password');
                return;
            }
            if (formDetails.role === 'INSTITUTE' && (!formDetails.name || !formDetails.email || !formDetails.password)) {
                toast.error('Please fill out institute name, email, and password');
                return;
            }
        } catch (error) {
            console.error('Registration error', error);
            toast.error('Something went wrong, please try again');
        }
    };

    const isButtonDisabled = () => {
        if (isLogin) {
            return !formDetails.email || !formDetails.password;
        }
        if (formDetails.role === 'CANDIDATE') {
            return !formDetails.name || !formDetails.email || !formDetails.password;
        }
        if (formDetails.role === 'INSTITUTE') {
            return !formDetails.name || !formDetails.email || !formDetails.password;
        }
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLogin) {
            await handleLogin();
        } else {
            await handleRegister();
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
            <div className="w-full max-w-6xl grid md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="hidden md:block relative bg-[#e53935e6] p-12 text-white">
                    <div className="absolute inset-0 bg-black opacity-10"></div>
                    <div className="relative z-10 select-none">
                        <h2 className="text-3xl font-bold mb-4">Welcome to Assessify</h2>
                        <p className="text-red-100 mb-8">
                            Transform your hiring process with AI-powered interviews and comprehensive assessments.
                        </p>
                        <div className="space-y-4">
                            {['Smart AI-driven interviews', 'Comprehensive candidate tracking', 'Real-time analytics', 'Secure and compliant']
                                .map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <ArrowRight className="w-5 h-5" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                <div className="p-8 md:p-12">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h3>
                        <p className="text-gray-600">
                            {isLogin
                                ? 'Enter your credentials to access your account'
                                : 'Join us to start transforming your hiring process'}
                        </p>
                    </div>

                    <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sign up as:</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                value="CANDIDATE"
                                                checked={formDetails.role === 'CANDIDATE'}
                                                onChange={() => setFormDetails({ ...formDetails, role: 'CANDIDATE' })}
                                                className="text-red-600 focus:ring-red-500"
                                            />
                                            <span className="ml-2 text-gray-700">Candidate</span>
                                        </label>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                value="INSTITUTE"
                                                checked={formDetails.role === 'INSTITUTE'}
                                                onChange={() => setFormDetails({ ...formDetails, role: 'INSTITUTE' })}
                                                className="text-red-600 focus:ring-red-500"
                                            />
                                            <span className="ml-2 text-gray-700">Institute</span>
                                        </label>
                                    </div>
                                </div>

                                {formDetails.role === 'INSTITUTE' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Institute Name</label>
                                        <div className="relative">
                                            <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-0"
                                                placeholder="Institute Name"
                                                value={formDetails.name}
                                                onChange={(e) =>
                                                    setFormDetails({
                                                        ...formDetails,
                                                        name: e.target.value
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                {formDetails.role === 'CANDIDATE' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <div className="relative">
                                            <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-0"
                                                placeholder="John Doe"
                                                value={formDetails.name}
                                                onChange={(e) =>
                                                    setFormDetails({
                                                        ...formDetails,
                                                        name: e.target.value
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-0"
                                    placeholder="you@example.com"
                                    onChange={(e) =>
                                        setFormDetails({
                                            ...formDetails,
                                            email: e.target.value
                                        })
                                    }
                                    value={formDetails.email}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="password"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-0"
                                    placeholder="••••••••"
                                    onChange={(e) => setFormDetails({ ...formDetails, password: e.target.value })}
                                    value={formDetails.password}
                                />
                            </div>
                        </div>

                        {isLogin && (
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" checked={isRemember} onChange={() => setIsRemember(!isRemember)} />
                                    <span className="ml-2 text-gray-600">Remember me</span>
                                </label>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full disabled:cursor-no-drop bg-[#e53935e6] text-white py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2"
                            disabled={isButtonDisabled()}
                        >
                            {isLogin ? 'Sign In' : 'Create Account'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>

                    <p className="mt-6 text-center text-gray-600">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-red-600 hover:text-red-700 font-medium"
                        >
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
