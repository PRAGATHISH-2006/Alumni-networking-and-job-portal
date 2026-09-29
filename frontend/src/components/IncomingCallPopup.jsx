import React, { useEffect } from 'react';
import { Video, PhoneOff, PhoneCall } from 'lucide-react';
import './IncomingCallPopup.css';

const IncomingCallPopup = ({ call, onAccept, onReject }) => {
    if (!call) return null;

    // Web Audio API Ringtone synthesis
    useEffect(() => {
        let audioCtx;
        let ringInterval;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();

                const playChime = () => {
                    if (audioCtx.state === 'suspended') {
                        audioCtx.resume();
                    }
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
                    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5

                    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

                    osc.connect(gain);
                    gain.connect(audioCtx.destination);

                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.35);
                };

                playChime();
                ringInterval = setInterval(playChime, 2000);
            }
        } catch (e) {
            console.warn('Audio synthesis not supported or prevented by policy:', e);
        }

        return () => {
            if (ringInterval) clearInterval(ringInterval);
            if (audioCtx) audioCtx.close().catch(() => {});
        };
    }, []);

    const callerName = call.callerName || 'Member';
    const callerRole = call.callerRole || 'Student';

    return (
        <div className="incoming-call-overlay">
            <div className="incoming-call-card">
                <div className="call-ripple-wrapper">
                    <div className="call-ripple"></div>
                    <div className="call-ripple"></div>
                    <div className="call-ripple"></div>
                    <div className="incoming-avatar">
                        {callerName.charAt(0)}
                    </div>
                </div>

                <h3>{callerName}</h3>
                <span className="incoming-role-badge">
                    {callerRole}
                </span>

                <p className="incoming-subtitle">
                    Incoming 1-on-1 Mentorship Video Call...
                </p>

                <div className="incoming-actions-row">
                    <button 
                        className="call-action-btn reject" 
                        onClick={onReject}
                    >
                        <PhoneOff size={20} /> Decline
                    </button>
                    <button 
                        className="call-action-btn accept" 
                        onClick={onAccept}
                    >
                        <Video size={20} /> Accept Call
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallPopup;
