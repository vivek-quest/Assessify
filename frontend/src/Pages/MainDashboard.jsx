import React, { useEffect, useState } from 'react';
import { DashBoard } from '../Components/Dashboard';
import AssessifyLoader from '../Components/AssessifyLoader';
import { useAtom } from 'jotai';
import { AuthAtom, UserAtom } from '../Atoms/AtomStores';
import { HoverEffectList } from '../Components/CardHoverEffectList';
import PopupOverlay from '../Components/PopupOverlay';
import { HoverEffect } from '../Components/CardHoverEffect';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { BACKEND_URL, X_API_KEY } from '../assets/config';

function MainDashboard() {
    const [loader, setLoader] = useState(true);
    const [userDetails] = useAtom(UserAtom);
    const [auth] = useAtom(AuthAtom);
    const [isAddPopup, setIsAddPopup] = useState(false);
    const [isInstitute, setIsInstitute] = useState(false);
    const [activeTab, setActiveTab] = useState('PENDING');
    const [newInterviewDetails, setNewInterviewDetails] = useState({
        title: '',
        description: '',
        goal: '',
        duration: '',
        questions: []
    });
    const [interviews, setInterviews] = useState([]);

    const checkUserRole = () => {
        setIsInstitute(userDetails?.role === 'institute');
    };

    const fetchInterviews = async () => {
        setLoader(true);
        try {
            const res = await axios.get(
                `${BACKEND_URL}/${userDetails.role === 'institute' ? 'institutes' : 'candidates'}/interviews`,
                { headers: { 'x-api-key': X_API_KEY, 'Authorization': `Bearer ${auth?.token}` } }
            );
            setInterviews(res.data.interviews);
        } catch (error) {
            console.log('Get interviews error', error);
            toast.error('Something went wrong, please try again');
        } finally {
            setLoader(false);
        }
    };

    useEffect(() => {
        checkUserRole();
        fetchInterviews();
    }, [userDetails]);

    const handleAddInterview = async (e) => {
        e.preventDefault();
        try {
            const { title, description, goal, duration } = newInterviewDetails;
            if (!title || !description || !goal || !duration) {
                toast.error('Please fill out all the fields');
                return;
            }
            if (duration < 5) {
                toast.error('Interview duration must be at least 5 minutes');
                return;
            }
            const res = await axios.post(
                `${BACKEND_URL}/institutes/interviews`,
                newInterviewDetails,
                { headers: { 'x-api-key': X_API_KEY, 'Authorization': `Bearer ${auth?.token}`, 'Content-Type': 'application/json' } }
            );
            console.log(res.data);
            toast.success('Interview added successfully!');
            setNewInterviewDetails({ title: '', description: '', goal: '', duration: '', questions: [] });
            setIsAddPopup(false);
            fetchInterviews();
        } catch (error) {
            console.log('Add interview error', error);
            toast.error('Something went wrong, please try again');
        }
    };

    return (
        <>
            {loader && <AssessifyLoader />}
            <DashBoard>
                <div className='w-full h-full max-h-[100vh] overflow-scroll hideScrollbar'>
                    <div className="w-full h-auto p-6 text-xl font-bold text-gray-800 flex justify-between border-b border-b-[#e53935e6] items-center">
                        <p>Dashboard</p>
                        <h2 className='text-3xl font-bold text-right text-gray-900'>
                            Welcome, <span className='text-[#e53935e6]'>{userDetails?.name || userDetails?.institureName || 'User'}</span>
                        </h2>
                    </div>
                    <div className='p-6 flex gap-3 h-[calc(100%-85px)] flex-col'>
                        <div className="flex flex-col gap-3">
                            {!isInstitute && (
                                <div className='p-2 flex items-center bg-white w-fit rounded-lg'>
                                    <p className={`${activeTab === 'PENDING' ? 'text-white bg-[#e53935e6]' : 'text-gray-900 bg-transparent'} p-2 cursor-pointer rounded-lg`} onClick={() => setActiveTab('PENDING')}>Pending</p>
                                    <p className={`${activeTab === 'COMPLETED' ? 'text-white bg-[#e53935e6]' : 'text-gray-900 bg-transparent'} p-2 cursor-pointer rounded-lg`} onClick={() => setActiveTab('COMPLETED')}>Completed</p>
                                </div>
                            )}
                            <div className='flex justify-between items-center'>
                                <p className='text-xl font-semibold text-gray-900'>Your Interviews</p>
                                {isInstitute && (
                                    <button className="w-fit bg-[#e53935e6] text-white p-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2" onClick={() => setIsAddPopup(true)}>Create new Interview</button>
                                )}
                            </div>
                            {isInstitute ? <HoverEffectList items={interviews} /> : <HoverEffect items={interviews} />}
                        </div>
                    </div>
                </div>
            </DashBoard>
            {isAddPopup && (
                <PopupOverlay closePopup={() => setIsAddPopup(false)} addEscapeHandler={true}>
                    <div className='bg-white p-5 rounded-2xl flex flex-col gap-4 w-[500px] max-h-[650px] overflow-scroll hideScrollbar'>
                        <div className='flex justify-between items-center'>
                            <p className='text-xl font-semibold text-gray-900'>Create Interview</p>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                                <path d="M4.50513 11.9957L8.00046 8.50034L11.4958 11.9957M11.4958 5.005L7.99979 8.50034L4.50513 5.005" stroke="var(--icon-color,#808080)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className='cursor-pointer' onClick={() => setIsAddPopup(false)}></path>
                            </svg>
                        </div>
                        <form className='flex flex-col gap-2' onSubmit={handleAddInterview}>
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Interview Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    placeholder="Enter interview title"
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-0"
                                    value={newInterviewDetails.title}
                                    onChange={(e) => setNewInterviewDetails({ ...newInterviewDetails, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Enter description"
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-0 resize-none"
                                    value={newInterviewDetails.description}
                                    onChange={(e) => setNewInterviewDetails({ ...newInterviewDetails, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div>
                                <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
                                <input
                                    type="text"
                                    id="goal"
                                    name="goal"
                                    placeholder="Enter goal of the interview"
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-0"
                                    value={newInterviewDetails.goal}
                                    onChange={(e) => setNewInterviewDetails({ ...newInterviewDetails, goal: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Duration (in minutes)</label>
                                <input
                                    type="number"
                                    id="duration"
                                    name="duration"
                                    placeholder="Enter duration"
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-0"
                                    value={newInterviewDetails.duration}
                                    onChange={(e) => setNewInterviewDetails({ ...newInterviewDetails, duration: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="questions" className="block text-sm font-medium text-gray-700 mb-1">Questions (comma separated)</label>
                                <input
                                    type="text"
                                    id="questions"
                                    name="questions"
                                    placeholder="Enter questions"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-0"
                                    value={newInterviewDetails.questions.join(', ')}
                                    onChange={(e) => setNewInterviewDetails({ ...newInterviewDetails, questions: e.target.value.split(',').map(q => q.trim()) })}
                                />
                            </div>

                            <button type="submit" className="bg-[#e53935e6] text-white p-2 rounded-lg hover:bg-red-600 transition-colors duration-200">Add Interview</button>
                        </form>
                    </div>
                </PopupOverlay>
            )}
        </>
    );
}

export default MainDashboard;
