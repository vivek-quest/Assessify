import React, { useEffect, useState } from 'react';
import { Camera, CameraOff, Mic, MicOff, MonitorUp } from 'lucide-react';
import ControlButton from './ControlButton';

const VideoPreview = ({
    videoRef,
    canvasRef,
    isCameraOn,
    isMicOn,
    isRecording,
    isScreenSharing,
    onToggleCamera,
    onToggleMic,
    onToggleRecording,
    onStartScreenShare,
}) => {
    const [isControlsVisible, setIsControlsVisible] = useState(true);
    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsControlsVisible(false);
        }, 3000);

        return () => clearTimeout(timeout);
    }, []);

    const handleMouseEnter = () => {
        setIsControlsVisible(true);
    };

    const handleMouseLeave = () => {
        const timeout = setTimeout(() => {
            setIsControlsVisible(false);
        }, 3000);

        return () => clearTimeout(timeout);
    };

    return (
        <div className="space-y-4" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <div className="relative bg-black rounded-2xl overflow-hidden aspect-video shadow-lg">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ transform: 'scaleX(-1)' }}
                    className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
                />
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                />
                {!isCameraOn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <p className="text-white text-lg">Camera is off</p>
                    </div>
                )}
                <div
                    className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/50 px-6 py-3 rounded-full 
                        transition-all duration-500 ease-in-out delay-75 ${isControlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                >
                    <ControlButton
                        icon={isCameraOn ? <Camera size={20} /> : <CameraOff size={20} />}
                        active={isCameraOn}
                        onClick={onToggleCamera}
                    />
                    <ControlButton
                        icon={<MonitorUp size={20} />}
                        active={isScreenSharing}
                        onClick={onStartScreenShare}
                    />
                    <button
                        onClick={onToggleRecording}
                        className={`px-6 py-2 rounded-full ${isRecording ? 'bg-[#e53935e6] text-white' : 'bg-gray-600 text-gray-200'
                            }`}
                    >
                        {isRecording ? 'Stop' : 'Record'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoPreview;