import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { useAuth } from './AuthContext';
import IncomingCallPopup from '../components/IncomingCallPopup';
import VideoCallModal from '../components/VideoCallModal';

const CallContext = createContext();

export const CallProvider = ({ children }) => {
    const { user } = useAuth();
    
    // Call States
    const [incomingCall, setIncomingCall] = useState(null);
    const [activeVideoCall, setActiveVideoCall] = useState({
        isOpen: false,
        partner: null,
        roomId: ''
    });
    const [outgoingCall, setOutgoingCall] = useState(null); // { partner, roomId, status: 'calling' }

    const outgoingPollRef = useRef(null);

    // 1. Polling for Incoming Calls for this user
    useEffect(() => {
        if (!user || activeVideoCall.isOpen) return;

        const checkIncoming = async () => {
            try {
                const { data } = await API.get('/api/mentorship/call/incoming');
                if (data && data.hasIncoming && data.call) {
                    // Don't show if it's our own outgoing call
                    if (data.call.callerId !== user.id) {
                        setIncomingCall(data.call);
                    }
                } else {
                    setIncomingCall(null);
                }
            } catch (err) {
                // Silent fail
            }
        };

        const interval = setInterval(checkIncoming, 2500);
        return () => clearInterval(interval);
    }, [user, activeVideoCall.isOpen]);

    // 2. Start a Call (Caller)
    const startCall = async (partner, customRoomId) => {
        if (!partner || !user) return;
        const roomId = customRoomId || `room-${partner.id.substring(0, 8)}-${user.id.substring(0, 8)}`;

        try {
            await API.post('/api/mentorship/call/initiate', {
                targetUserId: partner.id,
                roomId,
                callerName: user.name,
                callerRole: user.role
            });

            setOutgoingCall({ partner, roomId, status: 'calling' });

            // Poll for recipient's answer (accept or reject)
            if (outgoingPollRef.current) clearInterval(outgoingPollRef.current);
            
            outgoingPollRef.current = setInterval(async () => {
                try {
                    const { data } = await API.get(`/api/mentorship/call/status/${roomId}`);
                    if (data.status === 'accepted') {
                        clearInterval(outgoingPollRef.current);
                        setOutgoingCall(null);
                        // Open video call
                        setActiveVideoCall({
                            isOpen: true,
                            partner,
                            roomId
                        });
                    } else if (data.status === 'rejected') {
                        clearInterval(outgoingPollRef.current);
                        setOutgoingCall(null);
                        alert(`${partner.name} was unable to accept the video call at this time.`);
                    }
                } catch (e) {}
            }, 1800);

            // Timeout after 40 seconds if no answer
            setTimeout(() => {
                if (outgoingPollRef.current) {
                    clearInterval(outgoingPollRef.current);
                    setOutgoingCall(prev => {
                        if (prev && prev.roomId === roomId) {
                            alert(`No answer from ${partner.name}. You can leave a message in chat.`);
                            return null;
                        }
                        return prev;
                    });
                }
            }, 40000);

        } catch (error) {
            console.error('Failed to initiate call:', error);
            // Fallback: Direct room opening if signaling endpoint has issue
            setActiveVideoCall({
                isOpen: true,
                partner,
                roomId
            });
        }
    };

    // Cancel outgoing call
    const cancelOutgoingCall = () => {
        if (outgoingPollRef.current) clearInterval(outgoingPollRef.current);
        if (outgoingCall) {
            API.post('/api/mentorship/call/end', { roomId: outgoingCall.roomId }).catch(() => {});
        }
        setOutgoingCall(null);
    };

    // 3. Accept Incoming Call
    const acceptIncomingCall = async () => {
        if (!incomingCall) return;
        const { roomId, callerId, callerName, callerRole } = incomingCall;

        try {
            await API.post('/api/mentorship/call/respond', {
                roomId,
                response: 'accepted'
            });

            const partnerObj = {
                id: callerId,
                name: callerName,
                role: callerRole
            };

            setIncomingCall(null);
            setActiveVideoCall({
                isOpen: true,
                partner: partnerObj,
                roomId
            });
        } catch (error) {
            console.error('Error accepting call:', error);
        }
    };

    // 4. Reject Incoming Call
    const rejectIncomingCall = async () => {
        if (!incomingCall) return;
        try {
            await API.post('/api/mentorship/call/respond', {
                roomId: incomingCall.roomId,
                response: 'rejected'
            });
        } catch (error) {}
        setIncomingCall(null);
    };

    // 5. Close Active Video Call
    const closeActiveVideoCall = () => {
        if (activeVideoCall.roomId) {
            API.post('/api/mentorship/call/end', { roomId: activeVideoCall.roomId }).catch(() => {});
        }
        setActiveVideoCall({
            isOpen: false,
            partner: null,
            roomId: ''
        });
    };

    return (
        <CallContext.Provider value={{
            startCall,
            acceptIncomingCall,
            rejectIncomingCall,
            closeActiveVideoCall,
            activeVideoCall,
            incomingCall,
            outgoingCall
        }}>
            {children}

            {/* Live Incoming Call Popup */}
            {incomingCall && (
                <IncomingCallPopup 
                    call={incomingCall}
                    onAccept={acceptIncomingCall}
                    onReject={rejectIncomingCall}
                />
            )}

            {/* Outgoing Calling Dialog / Banner */}
            {outgoingCall && (
                <div className="incoming-call-overlay">
                    <div className="incoming-call-card" style={{ border: '2px solid #10b981' }}>
                        <div className="call-ripple-wrapper">
                            <div className="call-ripple" style={{ borderColor: 'rgba(16, 185, 129, 0.6)' }}></div>
                            <div className="call-ripple" style={{ borderColor: 'rgba(59, 130, 246, 0.6)' }}></div>
                            <div className="incoming-avatar" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
                                {outgoingCall.partner?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                        <h3>Calling {outgoingCall.partner?.name}...</h3>
                        <p className="incoming-subtitle">
                            Waiting for {outgoingCall.partner?.name} to accept video call...
                        </p>
                        <button 
                            className="call-action-btn reject" 
                            style={{ margin: '0 auto', maxWidth: '200px' }}
                            onClick={cancelOutgoingCall}
                        >
                            Cancel Call
                        </button>
                    </div>
                </div>
            )}

            {/* Active Video Call Modal */}
            <VideoCallModal 
                isOpen={activeVideoCall.isOpen}
                onClose={closeActiveVideoCall}
                partner={activeVideoCall.partner}
                roomId={activeVideoCall.roomId}
                currentUserId={user?.id}
            />
        </CallContext.Provider>
    );
};

export const useCall = () => useContext(CallContext);
