// src/components/VideoCall.js

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import LoadingSpinner from './LoadingSpinner';
import Toast from './Toast';
import ConnectionStatus from './ConnectionStatus';
import '../styles/App.css';

const VideoCall = ({ onError }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isEstablishingCall, setIsEstablishingCall] = useState(false);
    const [isAccessingMedia, setIsAccessingMedia] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const [socket, setSocket] = useState(null);
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [callStatus, setCallStatus] = useState('idle');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [connectionQuality, setConnectionQuality] = useState(100);
    const [toast, setToast] = useState(null);
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        const username = localStorage.getItem('username');
        if (!username) {
            navigate('/login');
            return;
        }
        setCurrentUser(username);

        const newSocket = io('http://localhost:3001');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setIsLoading(false);
            setConnectionStatus('connected');
            newSocket.emit('join', { username });
        });

        newSocket.on('connect_error', (error) => {
            setIsLoading(false);
            setConnectionStatus('disconnected');
            setToast({
                type: 'error',
                message: 'Failed to connect to server. Please try again.'
            });
        });

        newSocket.on('disconnect', () => {
            setConnectionStatus('disconnected');
            setToast({
                type: 'warning',
                message: 'Disconnected from server. Attempting to reconnect...'
            });
        });

        newSocket.on('reconnect', () => {
            setConnectionStatus('connected');
            setToast({
                type: 'success',
                message: 'Reconnected to server!'
            });
        });

        newSocket.on('userList', (users) => {
            setConnectedUsers(users);
        });

        // Simulate connection quality changes
        const qualityInterval = setInterval(() => {
            setConnectionQuality(Math.max(20, Math.min(100, connectionQuality + (Math.random() * 20 - 10))));
        }, 5000);

        return () => {
            clearInterval(qualityInterval);
            if (newSocket) {
                newSocket.disconnect();
            }
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [navigate]);

    useEffect(() => {
        if (socket) {
            socket.on('callReceived', async (data) => {
                setIsEstablishingCall(true);
                try {
                    await handleCallReceived(data);
                    setToast({
                        type: 'info',
                        message: `Incoming call from ${data.from}`
                    });
                } catch (error) {
                    setToast({
                        type: 'error',
                        message: 'Failed to establish call'
                    });
                } finally {
                    setIsEstablishingCall(false);
                }
            });

            socket.on('callEnded', handleCallEnded);
        }
    }, [socket, peerConnection, localStream]);

    const handleCallReceived = async (data) => {
        const pc = new RTCPeerConnection();
        setPeerConnection(pc);

        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('iceCandidate', {
                    candidate: event.candidate,
                    to: data.from
                });
            }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('answerCall', {
            answer,
            to: data.from
        });
    };

    const startCall = async (targetUser) => {
        setIsEstablishingCall(true);
        try {
            setIsAccessingMedia(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            localVideoRef.current.srcObject = stream;
            setIsAccessingMedia(false);

            const pc = new RTCPeerConnection();
            setPeerConnection(pc);

            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });

            pc.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('iceCandidate', {
                        candidate: event.candidate,
                        to: targetUser
                    });
                }
            };

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit('callUser', {
                offer,
                to: targetUser
            });

            setIsCallActive(true);
            setCallStatus('calling');
            setToast({
                type: 'info',
                message: `Calling ${targetUser}...`
            });
        } catch (error) {
            setToast({
                type: 'error',
                message: 'Failed to start call. Please check your camera and microphone permissions.'
            });
        } finally {
            setIsEstablishingCall(false);
        }
    };

    const endCall = () => {
        if (peerConnection) {
            peerConnection.close();
            setPeerConnection(null);
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        setRemoteStream(null);
        setIsCallActive(false);
        setCallStatus('idle');
        socket.emit('endCall');
    };

    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setIsMuted(!audioTrack.enabled);
            setToast({
                type: 'info',
                message: audioTrack.enabled ? 'Microphone unmuted' : 'Microphone muted'
            });
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOff(!videoTrack.enabled);
            setToast({
                type: 'info',
                message: videoTrack.enabled ? 'Video enabled' : 'Video disabled'
            });
        }
    };

    const handleCallEnded = () => {
        if (peerConnection) {
            peerConnection.close();
            setPeerConnection(null);
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        setLocalStream(null);
        setRemoteStream(null);
        setIsCallActive(false);
        setCallStatus('idle');
        setToast({ show: true, message: 'Call ended', type: 'info' });
    };

    if (isLoading) {
        return <LoadingSpinner message="Connecting to server..." />;
    }

    if (isAccessingMedia) {
        return <LoadingSpinner message="Accessing camera and microphone..." />;
    }

    if (isEstablishingCall) {
        return <LoadingSpinner message="Establishing call..." />;
    }

    return (
        <div className="video-call-container">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            
            <div className="video-call-header">
                <h2>Video Call</h2>
                <ConnectionStatus
                    status={connectionStatus}
                    quality={connectionQuality}
                />
            </div>

            <div className="video-grid">
                <div className="video-container">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className={isVideoOff ? 'video-off' : ''}
                    />
                    <div className="video-overlay">
                        <span>{currentUser}</span>
                        {isMuted && <span className="muted-indicator">🔇</span>}
                    </div>
                </div>
                {remoteStream && (
                    <div className="video-container">
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            srcObject={remoteStream}
                        />
                        <div className="video-overlay">
                            <span>Remote User</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="call-controls">
                <button
                    onClick={toggleMute}
                    className={`control-button ${isMuted ? 'active' : ''}`}
                >
                    {isMuted ? '🔇' : '🎤'}
                </button>
                <button
                    onClick={toggleVideo}
                    className={`control-button ${isVideoOff ? 'active' : ''}`}
                >
                    {isVideoOff ? '📷' : '📹'}
                </button>
                <button
                    onClick={endCall}
                    className="control-button end-call"
                >
                    📞
                </button>
            </div>

            {!isCallActive && (
                <div className="user-list">
                    <h3>Available Users</h3>
                    <ul>
                        {connectedUsers
                            .filter(user => user !== currentUser)
                            .map(user => (
                                <li key={user}>
                                    <button
                                        onClick={() => startCall(user)}
                                        className="call-button"
                                    >
                                        Call {user}
                                    </button>
                                </li>
                            ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default VideoCall;