import React, { useEffect, useState } from 'react'
import AssessifyLoader from '../Components/AssessifyLoader';
import { DashBoard } from '../Components/Dashboard';
import { AuthAtom, UserAtom } from '../Atoms/AtomStores';
import { useAtom } from 'jotai';
import AllSvgs from '../Components/AllSvgs';
import PopupOverlay from '../Components/PopupOverlay';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL, X_API_KEY } from '../assets/config';
import toast from 'react-hot-toast';

function SingleInterview() {
    const [loader, setLoader] = useState(false);
    const userDetails = useAtom(UserAtom);
    const [auth] = useAtom(AuthAtom);
    const [interviewDetails, setInterviewDetails] = useState({});
    const [editInterviewDetails, setEditInterviewDetails] = useState({});
    const [isEditPopup, setIsEditPopup] = useState(false);

    const { id } = useParams();
    const navigate = useNavigate();

    const fetchInterviewdetails = async () => {
        try {
            setLoader(true);
            let res = await axios.get(`${BACKEND_URL}/institutes/interviews/${id}`, { headers: { 'x-api-key': X_API_KEY, 'Authorization': `Bearer ${auth?.token}` } });
            setInterviewDetails(res.data);
            setEditInterviewDetails(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoader(false);
        }
    }

    useEffect(() => {
        fetchInterviewdetails();
    }, [])

    const handleUpdateInterview = async (e) => {
        e.preventDefault();
        setLoader(true);
        try {
            const res = await axios.put(`${BACKEND_URL}/institutes/interviews/${id}`, editInterviewDetails, { headers: { 'x-api-key': X_API_KEY, 'Authorization': `Bearer ${auth?.token}` } });
            if (res.data) {
                setIsEditPopup(false);
                fetchInterviewdetails();
                toast.success('Interview updated successfully!');
            }
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong, please try again');
        }
    }

    const handleDeleteInterview = async () => {
        try {
            let res = await axios.delete(`${BACKEND_URL}/institutes/interviews/${id}`, { headers: { 'x-api-key': X_API_KEY, 'Authorization': `Bearer ${auth?.token}` } });
            if (res.data) {
                toast.success('Interview deleted successfully!');
                navigate('/dashboard');
            }
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong, please try again');
        }
    }

    const toggleEditPopup = () => {
        setIsEditPopup(prev => !prev);
        setEditInterviewDetails(interviewDetails);
    }

    return (
        <>
            {loader && <AssessifyLoader />}
            <DashBoard>
                <div className='w-full h-full max-h-[100vh] overflow-scroll hideScrollbar'>
                    <div className="w-full h-auto p-6 text-xl font-bold text-gray-800 flex justify-between border-b border-b-[#e53935e6] items-center">
                        <p>Dashboard</p>
                        <h2 className='text-3xl font-bold text-right text-gray-900'>Welcome, <span className='text-[#e53935e6]'>{userDetails[0]?.name || userDetails[0]?.institureName || 'User'}</span></h2>
                    </div>
                    <div className='p-6 flex gap-3 h-[calc(100%-85px)] flex-col'>
                        <div className="flex flex-col gap-3">
                            <div className='flex justify-between items-center'>
                                <p className='text-xl font-semibold text-gray-900'>{interviewDetails.title}</p>
                                <div className='flex gap-2 items-center'>
                                    <div onClick={() => setIsEditPopup(true)}>
                                        <AllSvgs type={'edit'} className='cursor-pointer hover-icon-fill' />
                                    </div>
                                    <div onClick={handleDeleteInterview}>
                                        <AllSvgs type={'delete'} className='cursor-pointer hover-icon-stroke' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashBoard>
            {isEditPopup && <PopupOverlay closePopup={() => toggleEditPopup()} addEscapeHandler={true} >
                <div className='bg-white p-5 rounded-2xl flex flex-col gap-4 w-[500px] max-h-[650px] overflow-scroll hideScrollbar'>
                    <div className='flex justify-between items-center'>
                        <p className='text-xl font-semibold text-gray-900'>Edit Interview</p>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none"><path d="M4.50513 11.9957L8.00046 8.50034L11.4958 11.9957M11.4958 5.005L7.99979 8.50034L4.50513 5.005" stroke="var(--icon-color,#808080)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className='cursor-pointer' onClick={() => toggleEditPopup()}></path></svg>
                    </div>
                    <form className='flex flex-col gap-2' onSubmit={handleUpdateInterview}>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Interview Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                placeholder="Enter interview title"
                                required
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-0"
                                value={editInterviewDetails.title}
                                onChange={(e) => setEditInterviewDetails({ ...editInterviewDetails, title: e.target.value })}
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
                                value={editInterviewDetails.description}
                                onChange={(e) => setEditInterviewDetails({ ...editInterviewDetails, description: e.target.value })}
                            ></textarea>
                        </div>

                        <div>
                            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
                            <input
                                type="text"
                                id="goal"
                                name="goal"
                                placeholder="Enter goal"
                                required
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-0"
                                value={editInterviewDetails.goal}
                                onChange={(e) => setEditInterviewDetails({ ...editInterviewDetails, goal: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="questions" className="block text-sm font-medium text-gray-700 mb-1">Questions (Optional)</label>
                            <textarea
                                id="questions"
                                name="questions"
                                placeholder="Enter questions (optional)"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-0 resize-none"
                                value={editInterviewDetails.questions?.join('\n')}
                                onChange={(e) => setEditInterviewDetails({ ...editInterviewDetails, questions: e.target.value.split('\n').map(q => q.trim()) })}
                            ></textarea>
                        </div>

                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Duration (in minutes)</label>
                            <input
                                type="number"
                                id="duration"
                                name="duration"
                                placeholder="Enter duration"
                                required
                                min={0}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-0"
                                value={editInterviewDetails.duration}
                                onChange={(e) => setEditInterviewDetails({ ...editInterviewDetails, duration: e.target.value })}
                            />
                        </div>

                        <div>
                            <button type="submit" className="w-full bg-red-600 text-white p-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2">Update Interview</button>
                        </div>
                    </form>
                </div>
            </PopupOverlay>}
        </>
    )
}

export default SingleInterview