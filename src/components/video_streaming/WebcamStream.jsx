import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import './WebcamStream.css';

const WebcamStream = () => {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const canvasRef = useRef(null);
    const [videoInputDevices, setVideoInputDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const requestCameraPermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                setVideoInputDevices(videoDevices);
                if (videoDevices.length > 0 && !selectedDeviceId) {
                    setSelectedDeviceId(videoDevices[0].deviceId);
                }
                stream.getTracks().forEach(track => track.stop());
            } catch (err) {
            }
        };

        requestCameraPermission();
    }, [selectedDeviceId]);

    useEffect(() => {
        if (!selectedDeviceId) return;

        navigator.mediaDevices.getUserMedia({
            video: {deviceId: {exact: selectedDeviceId}}
        })
            .then(stream => {
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
        captureImageAndSend();
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => {
                    track.stop();
                });
            }
        };
    }, [selectedDeviceId]);

    const captureImageAndSend = () => {
        if (!canvasRef.current || !videoRef.current)
            return;

        const context = canvasRef.current.getContext('2d');
        if (!context)
            return;

        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        canvasRef.current.toBlob(sendBlobToServer, 'image/png');
    };

    const sendBlobToServer = async (blob) => {
        try {
            if (!blob) {
                captureImageAndSend();
                return;
            }
            const formData = new FormData();
            formData.append('image', blob);
            const response = await fetch('http://localhost:5000/scan', {
                method: 'POST',
                body: formData
            });
            if (response.status === 204) {
                setTimeout(captureImageAndSend, 500);
                return;
            }
            const data = await response.json();
            if (data && data.barcode) {
                const { mode } = location.state || {};
                if (mode) {
                    navigate(`/product/${mode}`, {state: {barcode: data.barcode}});
                } else {
                    navigate('/verify', {state: {barcode: data.barcode}});
                }
            }
        } catch (error) {
            captureImageAndSend();
        }
    };

    return (
        <div className="streaming-component">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="video-element"
            >
            </video>
            <canvas
                ref={canvasRef}
                style={{display: 'none'}}
                width="640"
                height="480"
            >
            </canvas>
            <select
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                value={selectedDeviceId}
                className="device-dropdown"
            >
                {videoInputDevices.map(device => (
                    <optgroup>
                        <option key={device.deviceId} value={device.deviceId}>
                            {device.label}
                        </option>
                    </optgroup>
                ))}
            </select>
        </div>
    );
};

export default WebcamStream;
