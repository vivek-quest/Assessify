import { useEffect, useRef, MutableRefObject } from 'react';
import * as faceapi from 'face-api.js';

const useFaceDetection = (
    videoRef,
    canvasRef
) => {
    const isModelLoaded = useRef(false);

    useEffect(() => {
        const loadModels = async () => {
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                    faceapi.nets.faceExpressionNet.loadFromUri('/models')
                ]);
                isModelLoaded.current = true;
            } catch (err) {
                console.error('Error loading face detection models:', err);
            }
        };

        loadModels();
    }, []);

    useEffect(() => {
        if (!videoRef.current || !canvasRef.current || !isModelLoaded.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        const detectFace = async () => {
            if (!video || !canvas) return;

            const detections = await faceapi
                .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceExpressions();

            const dims = faceapi.matchDimensions(canvas, video, true);
            const resizedDetections = faceapi.resizeResults(detections, dims);

            canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        };

        const interval = setInterval(detectFace, 100);
        return () => clearInterval(interval);
    }, [videoRef, canvasRef]);
};

export default useFaceDetection;