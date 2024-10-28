import { useState, useRef, useCallback } from 'react';

export const useMediaRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const videoRecorderRef = useRef(null);
    const screenRecorderRef = useRef(null);
    const videoChunksRef = useRef([]);
    const screenChunksRef = useRef([]);

    const startRecording = useCallback(async (videoStream, screenStream) => {
        videoChunksRef.current = [];
        screenChunksRef.current = [];

        videoRecorderRef.current = new MediaRecorder(videoStream);
        screenRecorderRef.current = new MediaRecorder(screenStream);

        videoRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) {
                videoChunksRef.current.push(e.data);
            }
        };

        screenRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) {
                screenChunksRef.current.push(e.data);
            }
        };

        videoRecorderRef.current.start();
        screenRecorderRef.current.start();
        setIsRecording(true);
    }, []);

    const stopRecording = useCallback(() => {
        return new Promise((resolve) => {
            if (!videoRecorderRef.current || !screenRecorderRef.current) return;

            let completedRecordings = 0;
            const checkCompletion = () => {
                completedRecordings++;
                if (completedRecordings === 2) {
                    const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
                    const screenBlob = new Blob(screenChunksRef.current, { type: 'video/webm' });
                    setIsRecording(false);
                    resolve({ video: videoBlob, screen: screenBlob });
                }
            };

            videoRecorderRef.current.onstop = checkCompletion;
            screenRecorderRef.current.onstop = checkCompletion;

            videoRecorderRef.current.stop();
            screenRecorderRef.current.stop();
        });
    }, []);

    return { isRecording, startRecording, stopRecording };
};