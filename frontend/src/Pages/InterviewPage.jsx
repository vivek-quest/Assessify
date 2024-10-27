import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeOff } from 'lucide-react';
import VideoPreview from '../Components/VideoPreview';
import ChatMessage from '../Components/ChatMessage';
import { DashBoard } from '../Components/Dashboard';
import toast from 'react-hot-toast';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useParams } from 'react-router-dom';
import { BACKEND_URL, X_API_KEY } from '../assets/config';
import { useAtom } from 'jotai';
import { AuthAtom } from '../Atoms/AtomStores';
import AssessifyLoader from '../Components/AssessifyLoader';
import axios from 'axios';

const InterviewPage = () => {
    const [loader, setLoader] = useState(false);
    const [isInterviewRunning, setIsInterviewRunning] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isMicOn, setIsMicOn] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const [isTTSEnabled, setIsTTSEnabled] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const chatContainerRef = useRef(null);
    const screenShareRef = useRef(null);

    const videoRecorder = useRef(null);
    const recordedChunks = useRef([]);

    const [auth] = useAtom(AuthAtom);

    const { id } = useParams();
    const [interviewDetails, setInterviewDetails] = useState({});
    const [elapsedTime, setElapsedTime] = useState(0);

    const [initiateId, setInitiateId] = useState('');

    const fetchInterviewDetails = async () => {
        setLoader(true);
        try {
            const res = await axios.get(
                `${BACKEND_URL}/candidates/interviews/${id}`,
                { headers: { 'x-api-key': X_API_KEY, 'Authorization': `Bearer ${auth?.token}` } }
            );
            setInterviewDetails(res.data);
        } catch (error) {
            console.log('Get interview error', error);
            toast.error('Something went wrong, please try again');
        } finally {
            setLoader(false);
        }
    }

    const {
        transcript,
        resetTranscript,
        listening,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();

    useEffect(() => {
        fetchInterviewDetails();
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    useEffect(() => {
        let interval;
        if (isInterviewRunning) {
            interval = setInterval(() => {
                setElapsedTime((prev) => {
                    if (prev + 1 >= interviewDetails?.duration) {
                        stopInterview();
                    }
                    return Math.min(prev + 1, interviewDetails?.duration);
                });
            }, 60000);
        }

        return () => clearInterval(interval);
    }, [isInterviewRunning, interviewDetails?.duration]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chat]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: isMicOn,
            });

            if (stream.getTracks().length === 0) {
                throw new Error('No media tracks available in the stream');
            }

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            const recorder = new MediaRecorder(stream);
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.current.push(event.data);
                }
            };
            videoRecorder.current = recorder;
        } catch (err) {
            console.error('Error accessing camera:', err);
            toast.error('Error accessing camera');
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();

            tracks.forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        } else {
            console.warn('No camera stream to stop');
            toast.error('No camera stream to stop');
        }
    };

    const startRecording = () => {
        if (videoRecorder.current) {
            videoRecorder.current.onerror = (event) => {
                console.error('MediaRecorder error:', event.error);
                toast.error(`MediaRecorder error: ${event.error}`);
            };
            videoRecorder.current.start();
        }
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (videoRecorder.current) {
            videoRecorder.current.stop();
            videoRecorder.current.stream.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
    };

    const saveRecording = () => {
        const blob = new Blob(recordedChunks.current, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'recording.mp4';
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSend = async () => {
        if (message.trim()) {
            setChat(prev => [...prev, { role: 'user', content: message }]);

            try {
                const response = await continueInterview(message);
                if (response.status === 'pending') {
                    const aiResponse = response?.response?.message?.content;
                    setChat(prev => [...prev, { role: 'ai', content: aiResponse }]);

                    if (isTTSEnabled && aiResponse) {
                        speak(aiResponse);
                    }
                } else {
                    endInterview();
                }
                setMessage('');
            } catch (error) {
                console.error('Error fetching AI response:', error);
                toast.error('Something went wrong while fetching the response');
            }

            resetTranscript();
            setMessage('');
        }
    };

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleMic = () => {
        if (!isMicOn) {
            SpeechRecognition.startListening({ continuous: false });
            setIsMicOn(true);
        } else {
            SpeechRecognition.stopListening();
            setIsMicOn(false);
        }
    };

    useEffect(() => {
        if (transcript) {
            setMessage(transcript);
        }
    }, [transcript]);

    const toggleCamera = () => {
        setIsCameraOn((prev) => !prev);
        if (isCameraOn) {
            stopCamera();
        } else {
            startCamera();
        }
    };

    const startScreenShare = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            screenShareRef.current.srcObject = stream;
            setIsScreenSharing(true);
        } catch (err) {
            console.error('Error accessing screen:', err);
            toast.error('Error accessing screen');
        }
    };

    const startInterview = async () => {
        try {
            let res = await axios.post(
                `${BACKEND_URL}/candidates/interviews/${id}/attempts`,
                {},
                { headers: { 'x-api-key': X_API_KEY, 'Authorization': `Bearer ${auth?.token}` } }
            );
            let data = res?.data;
            if (data?.status) {
                setIsInterviewRunning(true);
                startRecording();
                initiateInterview(data?._id);
                setInitiateId(data?._id);
            }
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong, please try again');
        }
    };

    const initiateInterview = async (iniId) => {
        try {
            let res = await axios.post(
                `${BACKEND_URL}/candidates/interviews/${id}/attempts/${iniId || initiateId}/initiate`,
                {},
                { headers: { 'x-api-key': X_API_KEY, 'Authorization': `Bearer ${auth?.token}` } }
            );
            let data = res.data;
            if (data.status === "pending") {
                setChat(prev => [...prev, { role: 'ai', content: data.response?.message?.content }]);
                if (isTTSEnabled) {
                    speak(data.response?.message?.content);
                }
            }
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong, please try again');
        }
    }

    const continueInterview = async (content) => {
        try {
            let res = await axios.post(
                `${BACKEND_URL}/candidates/interviews/${id}/attempts/${initiateId}/continue`,
                { content },
                { headers: { 'x-api-key': X_API_KEY, 'Authorization': `Bearer ${auth?.token}` } }
            );
            return res.data;
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong, please try again');
        }
    }

    const endInterview = async () => {
        try {
            let res = await axios.post(
                `${BACKEND_URL}/candidates/interviews/${id}/attempts/${initiateId}/end`,
                {},
                { headers: { 'x-api-key': X_API_KEY, 'Authorization': `Bearer ${auth?.token}` } }
            );
            console.log(res);
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong, please try again');
        }
    }

    const stopInterview = async () => {
        try {
            let res = await endInterview();
        } catch (error) {

        }
        setIsInterviewRunning(false);
        stopRecording();
        saveRecording();
        stopCamera();
    };

    const progressPercentage = (elapsedTime / interviewDetails?.duration) * 100;

    useEffect(() => {
        if (progressPercentage === 100) {
            stopInterview();
        }
    }, [progressPercentage])

    return (
        <>
            {loader && <AssessifyLoader />}
            <DashBoard>
                <div className="min-h-screen bg-gray-50 hideScrollbar">
                    <div className="">
                        <div className="w-full h-auto p-6 text-xl font-bold text-gray-800 flex justify-between border-b border-b-[#e53935e6] items-center">
                            <p>Interview</p>
                        </div>
                        <div className='w-full h-auto p-6 text-lg font-bold text-gray-800 flex justify-between items-center'>
                            <p>{interviewDetails?.title}</p>
                            <div>
                                {isInterviewRunning ? (
                                    <button
                                        onClick={stopInterview}
                                        className="p-3 rounded-lg bg-[#e53935e6] text-white hover:bg-red-700 hover:text-white transition-colors duration-200"
                                    >
                                        Stop Interview
                                    </button>
                                ) : (
                                    <button
                                        onClick={startInterview}
                                        className="p-3 rounded-lg bg-[#15ff20e6] text-black hover:bg-green-800 hover:text-white transition-colors duration-200"
                                    >
                                        Start Interview
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4">
                            <div className="space-y-4">
                                <VideoPreview
                                    videoRef={videoRef}
                                    canvasRef={canvasRef}
                                    isCameraOn={isCameraOn}
                                    isMicOn={isMicOn}
                                    isRecording={isRecording}
                                    isScreenSharing={isScreenSharing}
                                    onToggleCamera={toggleCamera}
                                    onToggleMic={toggleMic}
                                    onToggleRecording={() => {
                                        if (isRecording) {
                                            stopRecording();
                                            saveRecording();
                                        } else {
                                            startRecording();
                                        }
                                    }}
                                    onStartScreenShare={startScreenShare}
                                />
                                <div className="bg-white p-6 rounded-xl shadow-sm">
                                    <h2 className="text-lg font-semibold mb-2">Interview Progress</h2>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#e53935e6] rounded-full"
                                                style={{ width: `${progressPercentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600">{elapsedTime}/{interviewDetails?.duration} mins</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-[600px]">
                                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">AI Interviewer</h2>
                                        <p className="text-sm text-gray-600">Respond via text or voice</p>
                                    </div>
                                    <button
                                        onClick={() => setIsTTSEnabled(!isTTSEnabled)}
                                        className={`p-3 rounded-full ${isTTSEnabled ? 'bg-[#e53935e6] text-white' : 'bg-gray-100 text-gray-600'
                                            } hover:bg-red-700 hover:text-white transition-colors duration-200`}
                                    >
                                        {isTTSEnabled ? <Volume2 size={20} /> : <VolumeOff size={20} />}
                                    </button>
                                </div>

                                <div
                                    ref={chatContainerRef}
                                    className="flex-1 overflow-y-auto p-4 space-y-4"
                                >
                                    {chat.map((msg, index) => (
                                        <ChatMessage key={index} role={msg.role} content={msg.content} />
                                    ))}
                                </div>

                                <div className="p-4 border-t bg-white">
                                    <div className="flex items-center gap-2">
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyDown={handleKeyPress}
                                            placeholder="Type your response or click the mic to speak..."
                                            className="flex-1 resize-none rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500 min-h-[80px] focus:outline-0"
                                        />
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={toggleMic}
                                                className={`p-3 rounded-full ${listening ? 'bg-green-600 text-white' : isMicOn ? 'bg-[#e53935e6] text-white' : 'bg-gray-100 text-gray-600'
                                                    } hover:bg-red-700 hover:text-white transition-colors duration-200`}
                                            >
                                                {(listening || isMicOn) ? <Mic size={20} /> : <MicOff size={20} />}
                                            </button>
                                            <button
                                                onClick={handleSend}
                                                className="p-3 rounded-full bg-[#e53935e6] text-white hover:bg-red-700 transition-colors duration-200"
                                            >
                                                <Send size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashBoard>
        </>
    );
};

export default InterviewPage;
