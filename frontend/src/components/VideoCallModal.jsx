import React, { useState, useEffect, useRef } from 'react';
import { 
    Mic, 
    MicOff, 
    Video, 
    VideoOff, 
    PhoneOff, 
    ScreenShare, 
    Maximize2, 
    Minimize2, 
    MessageSquare, 
    Copy, 
    Check, 
    Users, 
    Send, 
    Sparkles,
    Shield
} from 'lucide-react';
import API from '../api/axios';
import './VideoCallModal.css';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

const VideoCallModal = ({ 
    isOpen, 
    onClose, 
    partner, 
    roomId: initialRoomId, 
    currentUserId 
}) => {
    if (!isOpen) return null;

    const roomId = initialRoomId || 'mentorship-room-' + (partner?.id || 'live');
    const partnerName = partner?.name || 'Mentor / Student';
    const partnerRole = partner?.role || 'Alumni Mentor';

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [callStatus, setCallStatus] = useState('connecting'); // connecting, connected
    const [callSeconds, setCallSeconds] = useState(0);
    const [copied, setCopied] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [toastMessage, setToastMessage] = useState('Initializing secure video room...');

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const screenStreamRef = useRef(null);
    const signalingPollRef = useRef(null);

    // Live timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCallSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (secs) => {
        const mins = Math.floor(secs / 60);
        const remSecs = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
    };

    // Initialize media and WebRTC
    useEffect(() => {
        let isMounted = true;

        const startCall = async () => {
            try {
                // 1. Get user media (Webcam & Mic)
                let stream;
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
                        audio: true
                    });
                } catch (mediaErr) {
                    console.warn('Could not access real camera/mic, falling back to simulated stream:', mediaErr);
                    // Create dummy canvas stream if camera unavailable
                    const canvas = document.createElement('canvas');
                    canvas.width = 640;
                    canvas.height = 480;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#1e293b';
                    ctx.fillRect(0, 0, 640, 480);
                    ctx.fillStyle = '#60a5fa';
                    ctx.font = '24px sans-serif';
                    ctx.fillText('Camera Feed (Virtual Preview)', 140, 240);
                    stream = canvas.captureStream(15);
                    setToastMessage('Running in browser preview mode (Camera not detected)');
                }

                if (!isMounted) return;
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // 2. Setup RTCPeerConnection
                const pc = new RTCPeerConnection(ICE_SERVERS);
                peerConnectionRef.current = pc;

                // Add local tracks to peer connection
                stream.getTracks().forEach(track => pc.addTrack(track, stream));

                // Handle remote stream
                pc.ontrack = (event) => {
                    if (remoteVideoRef.current && event.streams[0]) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                        setCallStatus('connected');
                        setToastMessage(`${partnerName} connected to call`);
                    }
                };

                // Send ICE candidates to signaling server
                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        API.post('/api/mentorship/call/signal', {
                            roomId,
                            signal: { type: 'candidate', candidate: event.candidate },
                            targetUserId: partner?.id
                        }).catch(() => {});
                    }
                };

                // Create and send offer if initiator
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                await API.post('/api/mentorship/call/signal', {
                    roomId,
                    signal: { type: 'offer', sdp: offer },
                    targetUserId: partner?.id
                }).catch(() => {});

                setToastMessage('Ready for connection. Waiting for participant...');

                // 3. Signaling Polling Loop
                signalingPollRef.current = setInterval(async () => {
                    try {
                        const { data } = await API.get(`/api/mentorship/call/signal/${roomId}`);
                        if (data && data.signals && data.signals.length > 0) {
                            for (const sigItem of data.signals) {
                                const { signal } = sigItem;
                                if (!signal) continue;

                                if (signal.type === 'offer' && pc.signalingState !== 'stable') {
                                    await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                                    const answer = await pc.createAnswer();
                                    await pc.setLocalDescription(answer);
                                    await API.post('/api/mentorship/call/signal', {
                                        roomId,
                                        signal: { type: 'answer', sdp: answer },
                                        targetUserId: sigItem.senderId
                                    });
                                    setCallStatus('connected');
                                } else if (signal.type === 'answer') {
                                    if (pc.signalingState === 'have-local-offer') {
                                        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                                        setCallStatus('connected');
                                    }
                                } else if (signal.type === 'candidate' && signal.candidate) {
                                    try {
                                        await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
                                    } catch (e) {}
                                }
                            }
                        }
                    } catch (pollErr) {
                        // Silent fail for polling
                    }
                }, 1500);

            } catch (err) {
                console.error('Call initialization error:', err);
                setToastMessage('Connection ready.');
            }
        };

        startCall();

        return () => {
            isMounted = false;
            // Clean up polling
            if (signalingPollRef.current) {
                clearInterval(signalingPollRef.current);
            }
            // Clean up streams
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach(track => track.stop());
            }
            // Close peer connection
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
            // Inform server
            API.post('/api/mentorship/call/end', { roomId }).catch(() => {});
        };
    }, [roomId, partner?.id]);

    // Controls
    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTracks = localStreamRef.current.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
            setToastMessage(!isMuted ? 'Microphone muted' : 'Microphone unmuted');
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTracks = localStreamRef.current.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
            setToastMessage(!isVideoOff ? 'Camera turned off' : 'Camera turned on');
        }
    };

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStreamRef.current = screenStream;
                const screenTrack = screenStream.getVideoTracks()[0];

                if (peerConnectionRef.current) {
                    const senders = peerConnectionRef.current.getSenders();
                    const videoSender = senders.find(s => s.track && s.track.kind === 'video');
                    if (videoSender) {
                        videoSender.replaceTrack(screenTrack);
                    }
                }

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = screenStream;
                }

                screenTrack.onended = () => {
                    stopScreenSharing();
                };

                setIsScreenSharing(true);
                setToastMessage('Sharing your screen with participant');
            } catch (err) {
                console.warn('Screen share cancelled or failed:', err);
            }
        } else {
            stopScreenSharing();
        }
    };

    const stopScreenSharing = () => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(t => t.stop());
        }
        if (localStreamRef.current && peerConnectionRef.current) {
            const originalVideoTrack = localStreamRef.current.getVideoTracks()[0];
            const senders = peerConnectionRef.current.getSenders();
            const videoSender = senders.find(s => s.track && s.track.kind === 'video');
            if (videoSender && originalVideoTrack) {
                videoSender.replaceTrack(originalVideoTrack);
            }
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStreamRef.current;
            }
        }
        setIsScreenSharing(false);
        setToastMessage('Screen sharing stopped');
    };

    const handleCopyRoom = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSendInCallChat = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        setChatMessages(prev => [
            ...prev,
            { sender: 'me', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
        setChatInput('');
    };

    return (
        <div className="video-modal-overlay">
            <div className={`video-call-container ${isFullscreen ? 'fullscreen' : ''}`}>
                {/* Call Header */}
                <div className="video-call-header">
                    <div className="call-partner-info">
                        <div className="call-avatar">
                            {partnerName.charAt(0)}
                        </div>
                        <div className="call-details">
                            <h4>
                                {partnerName}
                                <span className={`call-status-pill ${callStatus}`}>
                                    <span className="pulse-dot"></span>
                                    {callStatus === 'connected' ? 'Connected (Encrypted P2P)' : 'Waiting to connect...'}
                                </span>
                            </h4>
                            <p>{partnerRole} • 1-on-1 Mentorship Video Session</p>
                        </div>
                    </div>

                    <div className="call-header-actions">
                        <div className="call-timer-badge">
                            <span className="pulse-dot"></span>
                            {formatTime(callSeconds)}
                        </div>

                        <button 
                            className="header-icon-btn" 
                            onClick={handleCopyRoom} 
                            title="Copy Room ID"
                        >
                            {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                        </button>

                        <button 
                            className="header-icon-btn" 
                            onClick={() => setIsFullscreen(!isFullscreen)} 
                            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        >
                            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                    </div>
                </div>

                {/* Main Video Area */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    <div className="video-stage">
                        {toastMessage && (
                            <div className="call-toast">
                                💬 {toastMessage}
                            </div>
                        )}

                        {/* Remote Video / Primary Screen */}
                        <div className="remote-video-container">
                            <video 
                                ref={remoteVideoRef} 
                                autoPlay 
                                playsInline 
                                className="remote-video-feed"
                                style={{ display: callStatus === 'connected' ? 'block' : 'none' }}
                            />

                            {callStatus !== 'connected' && (
                                <div className="remote-placeholder">
                                    <div className="placeholder-avatar-large">
                                        {partnerName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: '0 0 6px 0', color: '#f1f5f9' }}>{partnerName}</h3>
                                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
                                            Call session active. Waiting for participant to connect audio & video.
                                        </p>
                                    </div>
                                    <div className="room-invite-pill" onClick={handleCopyRoom}>
                                        Room: <strong>{roomId}</strong> {copied ? '(Copied!)' : '(Click to copy)'}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Local Video Picture-in-Picture */}
                        <div className="local-video-pip">
                            <video 
                                ref={localVideoRef} 
                                autoPlay 
                                muted 
                                playsInline 
                                className="local-video-feed"
                                style={{ display: isVideoOff ? 'none' : 'block' }}
                            />
                            {isVideoOff && (
                                <div className="pip-off-overlay">
                                    <VideoOff size={24} />
                                    <span>Camera Off</span>
                                </div>
                            )}
                            <div className="pip-label">You {isMuted ? '(Muted)' : ''}</div>
                        </div>
                    </div>

                    {/* Side In-Call Chat Drawer */}
                    {showChat && (
                        <div className="video-side-chat">
                            <div className="side-chat-header">
                                <h4>Session Messages</h4>
                                <button className="header-icon-btn" onClick={() => setShowChat(false)}>✕</button>
                            </div>
                            <div className="side-chat-messages">
                                <div className="text-center" style={{ color: '#64748b', fontSize: '0.8rem', padding: '0.5rem 0' }}>
                                    Shared links, notes, and questions appear here.
                                </div>
                                {chatMessages.map((msg, i) => (
                                    <div key={i} className={`side-chat-bubble ${msg.sender === 'me' ? 'mine' : 'theirs'}`}>
                                        <p style={{ margin: 0 }}>{msg.text}</p>
                                        <small style={{ opacity: 0.7, fontSize: '0.7rem' }}>{msg.time}</small>
                                    </div>
                                ))}
                            </div>
                            <form className="side-chat-input" onSubmit={handleSendInCallChat}>
                                <input 
                                    type="text" 
                                    placeholder="Type note or question..." 
                                    value={chatInput} 
                                    onChange={(e) => setChatInput(e.target.value)}
                                />
                                <button type="submit"><Send size={16} /></button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Bottom Call Controls Toolbar */}
                <div className="video-call-controls">
                    <button 
                        className={`ctrl-btn ${isMuted ? 'active-off' : ''}`} 
                        onClick={toggleMute}
                        title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                    >
                        {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                    </button>

                    <button 
                        className={`ctrl-btn ${isVideoOff ? 'active-off' : ''}`} 
                        onClick={toggleVideo}
                        title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
                    >
                        {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
                    </button>

                    <button 
                        className={`ctrl-btn ${isScreenSharing ? 'active-feature' : ''}`} 
                        onClick={toggleScreenShare}
                        title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
                    >
                        <ScreenShare size={22} />
                    </button>

                    <button 
                        className={`ctrl-btn ${showChat ? 'active-feature' : ''}`} 
                        onClick={() => setShowChat(!showChat)}
                        title="In-call Notes & Chat"
                    >
                        <MessageSquare size={22} />
                    </button>

                    <button 
                        className="ctrl-btn end-call" 
                        onClick={onClose}
                        title="End Video Call"
                    >
                        <PhoneOff size={26} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoCallModal;
