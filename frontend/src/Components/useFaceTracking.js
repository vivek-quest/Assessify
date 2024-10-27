import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

export const useTensorFlowFaceTracking = (
    videoRef,
    { onCheatingDetected, enabled }
) => {
    const modelRef = useRef(null);
    const lastDirectionRef = useRef('center');
    const sideViewCountRef = useRef(0);
    const isTrackingRef = useRef(false);

    const [warningCount, setWarningCount] = useState(0);

    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.ready();
                modelRef.current = await blazeface.load();
                console.log('Model loaded successfully');
            } catch (error) {
                console.error('Error loading TensorFlow model:', error);
            }
        };

        loadModel();

        return () => {
            tf.dispose();
        };
    }, []);

    useEffect(() => {
        if (!enabled || !videoRef.current || !modelRef.current) return;

        let animationFrame;

        const detectFace = async () => {
            if (!videoRef.current || !modelRef.current || !isTrackingRef.current) return;

            try {
                const predictions = await modelRef.current.estimateFaces(
                    videoRef.current,
                    false
                );

                if (predictions.length > 0) {
                    const face = predictions[0];
                    const leftEye = face.landmarks[0];
                    const rightEye = face.landmarks[1];
                    const nose = face.landmarks[2];

                    const eyeDistance = Math.abs(leftEye[0] - rightEye[0]);
                    const noseOffset = Math.abs(nose[0] - (leftEye[0] + rightEye[0]) / 2);
                    const threshold = eyeDistance * 0.3;

                    const currentDirection = noseOffset > threshold ? 'side' : 'center';

                    if (currentDirection === 'side' && lastDirectionRef.current === 'center') {
                        sideViewCountRef.current++;
                        setWarningCount(sideViewCountRef.current); // Update state
                        if (sideViewCountRef.current <= 3) {
                            onCheatingDetected();
                        }
                    }

                    lastDirectionRef.current = currentDirection;
                }
            } catch (error) {
                console.error('Face detection error:', error);
            }

            animationFrame = requestAnimationFrame(detectFace);
        };

        isTrackingRef.current = true;
        detectFace();

        return () => {
            isTrackingRef.current = false;
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [enabled, videoRef, onCheatingDetected]);

    return { warningCount };
};
