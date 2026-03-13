import React, { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { 
    MessageSquare, 
    Check, 
    X, 
    Clock, 
    User, 
    Send, 
    Search,
    MessageCircle,
    Users,
    ChevronRight,
    Loader,
    Image,
    ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './Mentorship.css';

// Removing static featuredMentors as we will fetch them dynamically

const Mentorship = () => {
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('browse');
    
    useEffect(() => {
        if (user?.role === 'alumni') {
            setActiveTab('requests');
        }
    }, [user]);
    const [mentors, setMentors] = useState([]);
    const [requests, setRequests] = useState([]);
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState(false);
    
    // Request Modal State
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedMentorForRequest, setSelectedMentorForRequest] = useState(null);
    const [requestData, setRequestData] = useState({ topic: '', message: '' });
    
    const chatEndRef = useRef(null);

    // Safety Guard: Show loading while auth initializes
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    // Redirect or show message if not logged in (App.jsx usually handles this, but safety first)
    if (!user) {
        return <div className="p-8 text-center">Please login to access mentorship features.</div>;
    }

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reqRes, chatRes, mentorsRes] = await Promise.all([
                API.get('/api/mentorship/requests'),
                API.get('/api/messages/chats'),
                API.get('/api/users/alumni') // Fetch real alumni
            ]);
            // Filter for student-alumni mentorship only
            const filteredRequests = reqRes.data.filter(req => {
                const partner = user.id === req.mentorId ? req.student : req.mentor;
                // If the partner is an alumni, then it's an alumni-to-alumni connection (handled in Alumni Connect)
                // If I am alumni, I only want to see requests from students here.
                // If I am student, I only want to see requests to alumni here.
                if (user.role === 'alumni') {
                    return partner.role === 'student';
                } else {
                    return partner.role === 'alumni';
                }
            });

            const filteredChats = chatRes.data.filter(chat => {
                if (user.role === 'alumni') {
                    return chat.role === 'student';
                } else {
                    return chat.role === 'alumni';
                }
            });

            setRequests(filteredRequests);
            setChats(filteredChats);
            setMentors(mentorsRes.data.filter(m => m.id !== user.id));

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.id);
        }
    }, [selectedChat]);

    const fetchMessages = async (partnerId) => {
        setMsgLoading(true);
        try {
            const { data } = await axios.get(`http://localhost:5000/api/messages/${partnerId}`);
            setMessages(data);
            scrollToBottom();
        } catch (error) {
            console.error(error);
        } finally {
            setMsgLoading(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        try {
            const { data } = await API.post('/api/messages', {
                receiverId: selectedChat.id,
                content: newMessage
            });
            setMessages([...messages, data]);
            setNewMessage('');
            scrollToBottom();
        } catch (error) {
            alert('Failed to send message');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/mentorship/${id}`, { status });
            setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendRequest = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/api/mentorship/request', {
                mentorId: selectedMentorForRequest.id,
                topic: requestData.topic,
                message: requestData.message
            });
            alert('Mentorship request sent successfully!');
            setShowRequestModal(false);
            setRequestData({ topic: '', message: '' });
            // Refresh requests
            const reqRes = await API.get('/api/mentorship/requests');
            setRequests(reqRes.data);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to send request');
        }
    };

    const handleStartChatFromRequest = (partner) => {
        setSelectedChat(partner);
        setActiveTab('chats');
    };

    return (
        <div className="mentorship-page">
            <div className="container">
                <div className="mentorship-tabs">
                    {user?.role !== 'alumni' && (
                        <button className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>
                            <Search size={18} /> Find Alumni
                        </button>
                    )}
                    <button className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
                        <Send size={18} /> Requests ({requests.length})
                    </button>
                    <button className={`tab-btn ${activeTab === 'chats' ? 'active' : ''}`} onClick={() => setActiveTab('chats')}>
                        <MessageSquare size={18} /> Guidance Chat
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'browse' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="browse">
                            <div className="mentorship-header">
                                <h1>Our Notable <span className="gradient-text">Mentors</span></h1>
                                <p>Learn from those who walked the path before you.</p>
                            </div>
                            <div className="mentors-grid">
                                {mentors.length > 0 ? mentors.map(mentor => (
                                    <div key={mentor.id} className="glass-card mentor-card-gl">
                                        <div className="mentor-avatar-lg">
                                            {mentor.name.charAt(0)}
                                        </div>
                                        <div className="mentor-info">
                                            <h3>{mentor.name}</h3>
                                            <p className="role">{mentor.position || 'Professional'} @ {mentor.company || 'Alumni'}</p>
                                            <p className="exp"><strong>{mentor.department || 'General'}</strong></p>
                                            <button 
                                                className="btn btn-primary btn-sm" 
                                                onClick={() => {
                                                    setSelectedMentorForRequest(mentor);
                                                    setShowRequestModal(true);
                                                }}>
                                                Request Guidance
                                            </button>
                                        </div>
                                    </div>
                                )) : <div className="p-4 text-muted">No mentors found.</div>}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'requests' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="requests">
                            <div className="mentorship-header">
                                <h2>Mentorship <span className="gradient-text">Connections</span></h2>
                                <p>Track your guidance requests and responses.</p>
                            </div>
                            <div className="requests-stack">
                                {requests.map(req => {
                                    const partner = user.role === 'alumni' ? req.student : req.mentor;
                                    const isIncoming = user.role === 'alumni';
                                    
                                    return (
                                        <div key={req.id} className="glass-card request-panel">
                                            <div className="req-user">
                                                <div className="avatar-med">{partner?.name?.charAt(0) || '?'}</div>
                                                <div className="partner-details">
                                                    <h4>{partner?.name || 'User'}</h4>
                                                    <span className="relationship-tag">{isIncoming ? 'Student' : 'Mentor'}</span>
                                                    <p className="topic-text">Topic: <strong>{req.topic}</strong></p>
                                                </div>
                                                <div className={`status-badge ${req.status.toLowerCase()}`}>{req.status}</div>
                                            </div>
                                            <div className="req-msg">"{req.message}"</div>
                                            <div className="req-actions">
                                                {req.status === 'Pending' && isIncoming && (
                                                    <>
                                                        <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(req.id, 'Accepted')}>Accept</button>
                                                        <button className="btn btn-danger-ghost btn-sm" onClick={() => handleStatusUpdate(req.id, 'Rejected')}>Reject</button>
                                                    </>
                                                )}
                                                {req.status === 'Accepted' && (
                                                    <button className="btn btn-outline btn-sm" onClick={() => handleStartChatFromRequest(partner)}>
                                                        <MessageSquare size={16} /> Start Chat
                                                    </button>
                                                )}
                                                {req.status === 'Pending' && !isIncoming && (
                                                    <span className="wait-msg">Awaiting alumni response...</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {requests.length === 0 && <div className="empty-state">No mentorship requests yet. Start by finding a mentor!</div>}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'chats' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="chats" className="chat-interface glass-card">
                            <div className="chat-sidebar">
                                <h3>Messages</h3>
                                <div className="chat-list">
                                    {chats.map(chat => (
                                        <div key={chat.id} 
                                             className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                                             onClick={() => setSelectedChat(chat)}
                                        >
                                            <div className="avatar-xs">{chat.name.charAt(0)}</div>
                                            <div className="chat-meta">
                                                <h4>{chat.name}</h4>
                                                <span>{chat.position || chat.role}</span>
                                            </div>
                                            <ChevronRight size={16} />
                                        </div>
                                    ))}
                                    {chats.length === 0 && <div className="p-4 text-muted text-sm">No active chats. Start a connection!</div>}
                                </div>
                            </div>

                            <div className="chat-main">
                                {selectedChat ? (
                                    <>
                                        <div className="chat-header">
                                            <div className="chat-user">
                                                <div className="avatar-small">{selectedChat.name.charAt(0)}</div>
                                                <div>
                                                    <h4>{selectedChat.name}</h4>
                                                    <span>{selectedChat.company || 'Student'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="chat-messages">
                                            {msgLoading ? <div className="loading-msg"><Loader className="spin" /> Loading conversation...</div> : (
                                                <>
                                                    {messages.map((m, idx) => (
                                                        <div key={idx} className={`message-bubble ${m.senderId === user.id ? 'sent' : 'received'}`}>
                                                            {m.imageUrl && (
                                                                <div className="chat-image-container">
                                                                    <img src={`http://localhost:5000${m.imageUrl}`} alt="Shared" className="chat-img" />
                                                                </div>
                                                            )}
                                                            {m.content && <p className="msg-text">{m.content}</p>}
                                                            <span className="msg-time">{new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                        </div>
                                                    ))}
                                                    <div ref={chatEndRef} />
                                                </>
                                            )}
                                        </div>
                                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                                            <label className="image-upload-btn">
                                                <Image size={24} />
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    style={{ display: 'none' }} 
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const formData = new FormData();
                                                            formData.append('receiverId', selectedChat.id);
                                                            formData.append('image', file);
                                                            API.post('/api/messages', formData)
                                                                .then(({data}) => {
                                                                    setMessages([...messages, data]);
                                                                    scrollToBottom();
                                                                })
                                                                .catch(() => alert('Failed to send image'));
                                                        }
                                                    }}
                                                />
                                            </label>
                                            <input 
                                                type="text" 
                                                placeholder="Type your guidance message..." 
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                            />
                                            <button type="submit" className="send-btn"><Send size={20} /></button>
                                        </form>
                                    </>
                                ) : (
                                    <div className="chat-placeholder">
                                        <MessageSquare size={64} />
                                        <h3>Select a mentor or student to start guidance</h3>
                                        <p>Your connections for career mapping will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Request Guidance Modal */}
            <AnimatePresence>
                {showRequestModal && selectedMentorForRequest && (
                    <div className="modal-overlay">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card modal-card"
                        >
                            <div className="modal-header">
                                <h3>Request Guidance from {selectedMentorForRequest.name}</h3>
                                <button className="close-btn" onClick={() => setShowRequestModal(false)}><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSendRequest} className="post-job-form">
                                <div className="input-group">
                                    <label>What topic do you need guidance on?</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={requestData.topic} 
                                        onChange={(e) => setRequestData({...requestData, topic: e.target.value})} 
                                        placeholder="e.g., Resume Review, Mock Interview, Career Advice" 
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Introductory Message</label>
                                    <textarea 
                                        required 
                                        value={requestData.message} 
                                        onChange={(e) => setRequestData({...requestData, message: e.target.value})} 
                                        placeholder={`Hi ${selectedMentorForRequest.name}, I would love to get your insights on...`} 
                                        rows="4"
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary w-full">
                                    <Send size={18} /> Send Request
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Mentorship;
