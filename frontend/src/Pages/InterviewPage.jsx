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
    const [isAIResponding, setIsAIResponding] = useState(false);
    const [isInterviewEnded, setIsInterviewEnded] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceTimeout, setVoiceTimeout] = useState(null);

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
            clearVoiceTimeout();
        };
    }, []);

    const clearVoiceTimeout = () => {
        if (voiceTimeout) {
            clearTimeout(voiceTimeout);
            setVoiceTimeout(null);
        }
    };

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
    };

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

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: isMicOn,
            });

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
        }
    };

    const startRecording = () => {
        if (videoRecorder.current) {
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
        a.download = 'interview-recording.mp4';
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
    };

    const speak = (text) => {
        setIsSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
            setIsSpeaking(false);
        };
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        if (isSpeaking === false) {
            toggleMic();
        }
    }, [isSpeaking])

    const handleSend = async () => {
        if (message.trim() && !isAIResponding && !isSpeaking) {
            const userMessage = message.trim();
            setChat(prev => [...prev, { role: 'user', content: userMessage }]);
            setMessage('');
            setIsAIResponding(true);

            try {
                const response = await continueInterview(userMessage);
                if (response?.status === 'pending') {
                    const aiResponse = response?.response?.message?.content;
                    setChat(prev => [...prev, { role: 'ai', content: aiResponse }]);

                    if (isTTSEnabled && aiResponse) {
                        speak(aiResponse);
                    }
                } else {
                    await endInterview();
                    setIsInterviewEnded(true);
                }
            } catch (error) {
                console.error('Error fetching AI response:', error);
                toast.error('Something went wrong while fetching the response');
            } finally {
                setIsAIResponding(false);
            }

            resetTranscript();
        }
    };

    const toggleMic = () => {
        if (!isMicOn && !isAIResponding) {
            SpeechRecognition.startListening({ continuous: true });
            setIsMicOn(true);

            // Set timeout to automatically send message after 2 seconds of silence
            const timeout = setTimeout(() => {
                if (transcript.trim()) {
                    setMessage(transcript);
                    handleSend();
                }
                SpeechRecognition.stopListening();
                setIsMicOn(false);
            }, 4000);

            setVoiceTimeout(timeout);
        } else {
            SpeechRecognition.stopListening();
            setIsMicOn(false);
            clearVoiceTimeout();
        }
    };

    useEffect(() => {
        if (transcript) {
            setMessage(transcript);
            // Reset the voice timeout
            clearVoiceTimeout();
            const timeout = setTimeout(() => {
                if (transcript.trim()) {
                    handleSend();
                }
                SpeechRecognition.stopListening();
                setIsMicOn(false);
            }, 2000);
            setVoiceTimeout(timeout);
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
        if (!isCameraOn){
            return toast.error('Please turn on camera to start interview');
        }
        try {
            setLoader(true);
            let res = await axios.post(
                `${BACKEND_URL}/candidates/interviews/${id}/attempts`,
                {},
                { headers: { 'x-api-key': X_API_KEY, 'Authorization': `Bearer ${auth?.token}` } }
            );
            let data = res?.data;
            if (data?.status) {
                setIsInterviewRunning(true);
                setIsInterviewEnded(false);
                setChat([]);
                startRecording();
                setInitiateId(data?._id);
                await initiateInterview(data?._id);
            }
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong, please try again');
        } finally {
            setLoader(false);
        }
    };

    const initiateInterview = async (iniId) => {
        try {
            setIsAIResponding(true);
            let res = await axios.post(
                `${BACKEND_URL}/candidates/interviews/${id}/attempts/${iniId}/initiate`,
                {},
                { headers: { 'x-api-key': X_API_KEY, 'Authorization': `Bearer ${auth?.token}` } }
            );
            let data = res.data;
            if (data.status === "pending") {
                const aiMessage = data.response?.message?.content;
                setChat(prev => [...prev, { role: 'ai', content: aiMessage }]);
                if (isTTSEnabled) {
                    speak(aiMessage);
                }
            }
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong, please try again');
        } finally {
            setIsAIResponding(false);
        }
    };

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
            return null;
        }
    };

    const endInterview = async () => {
        try {
            let res = await axios.post(
                `${BACKEND_URL}/candidates/interviews/${id}/attempts/${initiateId}/end`,
                {},
                { headers: { 'x-api-key': X_API_KEY, 'Authorization': `Bearer ${auth?.token}` } }
            );
            return res.data;
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong, please try again');
        }
    };

    const stopInterview = async () => {
        try {
            let res = await endInterview();
            if (res?.status === 'completed') {
                const aiMessage = res?.response?.message?.content;
                setChat(prev => [...prev, { role: 'ai', content: aiMessage }]);
            }
        } catch (error) {
            console.log(error);
        }
        setIsInterviewRunning(false);
        setIsInterviewEnded(true);
        stopRecording();
        saveRecording();
        // setChat([]);
        setMessage('');
    };

    const progressPercentage = (elapsedTime / interviewDetails?.duration) * 100;

    useEffect(() => {
        if (progressPercentage === 100) {
            stopInterview();
        }
    }, [progressPercentage]);

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
                                        {isInterviewEnded ? 'Start Fresh Interview' : 'Start Interview'}
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
                                        <p className="text-sm text-gray-600">
                                            {isAIResponding ? 'AI is responding...' : isSpeaking ? 'AI is speaking...' : 'Respond via text or voice'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsTTSEnabled(!isTTSEnabled)}
                                        className={`p-3 rounded-full ${isTTSEnabled ? 'bg-[#e53935e6] text-white' : 'bg-gray-100 text-gray-600'} 
                                            hover:bg-red-700 hover:text-white transition-colors duration-200`}
                                        disabled={isAIResponding || isSpeaking}
                                    >
                                        {isTTSEnabled ? <Volume2 size={20} /> : <VolumeOff size={20} />}
                                    </button>
                                </div>

                                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 hideScrollbar">
                                    {chat.map((msg, index) => (
                                        <ChatMessage
                                            key={index}
                                            role={msg.role}
                                            content={msg.content}
                                            isLatest={index === chat.length - 1 && msg.role === 'ai'}
                                        />
                                    ))}
                                    {isAIResponding && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                                                <div className="animate-pulse flex space-x-2">
                                                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                                                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                                                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border-t bg-white">
                                    <div className="flex items-center gap-2">
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSend();
                                                }
                                            }}
                                            placeholder={isInterviewEnded ? 'Interview ended' : 'Type your response or click the mic to speak...'}
                                            className="flex-1 resize-none rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500 min-h-[80px] focus:outline-0"
                                            disabled={!isInterviewRunning || isInterviewEnded || isAIResponding || isSpeaking}
                                        />
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={toggleMic}
                                                className={`p-3 rounded-full ${listening ? 'bg-green-600 text-white' :
                                                    isMicOn ? 'bg-[#e53935e6] text-white' :
                                                        'bg-gray-100 text-gray-600'
                                                    } hover:bg-red-700 hover:text-white transition-colors duration-200`}
                                                disabled={!isInterviewRunning || isInterviewEnded || isAIResponding || isSpeaking}
                                            >
                                                {(listening || isMicOn) ? <Mic size={20} /> : <MicOff size={20} />}
                                            </button>
                                            <button
                                                onClick={handleSend}
                                                className="p-3 rounded-full bg-[#e53935e6] text-white hover:bg-red-700 transition-colors duration-200"
                                                disabled={!message.trim() || !isInterviewRunning || isInterviewEnded || isAIResponding || isSpeaking}
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