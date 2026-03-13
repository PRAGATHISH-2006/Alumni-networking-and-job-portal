import React, { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { 
    MessageSquare, 
    Check, 
    X, 
    Clock, 
    User, 
    Send, 
    MessageCircle,
    Users,
    ChevronRight,
    Loader,
    Image,
    UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './Mentorship.css'; // Reusing styles

const AlumniChat = () => {
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('connections');
    const [requests, setRequests] = useState([]);
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState(false);
    
    const chatEndRef = useRef(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reqRes, chatRes] = await Promise.all([
                API.get('/api/mentorship/requests'),
                API.get('/api/messages/chats')
            ]);

            // Filter for alumni-to-alumni only
            const alumniRequests = reqRes.data.filter(req => {
                const partner = user.id === req.mentorId ? req.student : req.mentor;
                return partner.role === 'alumni';
            });

            const alumniChats = chatRes.data.filter(chat => chat.role === 'alumni');

            setRequests(alumniRequests);
            setChats(alumniChats);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.id);
        }
    }, [selectedChat]);

    const fetchMessages = async (partnerId) => {
        setMsgLoading(true);
        try {
            const { data } = await API.get('/api/messages/${partnerId}');
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
            await API.put('/api/mentorship/${id}', { status });
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="mentorship-page">
            <div className="container">
                <div className="mentorship-header">
                    <h1>Alumni <span className="gradient-text">Connect</span></h1>
                    <p>Network and collaborate with your fellow graduates.</p>
                </div>

                <div className="mentorship-tabs">
                    <button className={`tab-btn ${activeTab === 'connections' ? 'active' : ''}`} onClick={() => setActiveTab('connections')}>
                        <UserPlus size={18} /> Connections ({requests.length})
                    </button>
                    <button className={`tab-btn ${activeTab === 'chats' ? 'active' : ''}`} onClick={() => setActiveTab('chats')}>
                        <MessageCircle size={18} /> Chat Room
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'connections' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="connections">
                            <div className="requests-stack">
                                {requests.map(req => {
                                    const partner = user.id === req.mentorId ? req.student : req.mentor;
                                    const isIncoming = user.id === req.mentorId;
                                    
                                    return (
                                        <div key={req.id} className="glass-card request-panel">
                                            <div className="req-user">
                                                <div className="avatar-med">{partner?.name?.charAt(0) || '?'}</div>
                                                <div className="partner-details">
                                                    <h4>{partner?.name || 'User'}</h4>
                                                    <span className="relationship-tag">Alumni</span>
                                                    <p className="topic-text">Interested in: <strong>{req.topic}</strong></p>
                                                </div>
                                                <div className={`status-badge ${req.status.toLowerCase()}`}>{req.status}</div>
                                            </div>
                                            <div className="req-msg">"{req.message}"</div>
                                            <div className="req-actions">
                                                {req.status === 'Pending' && isIncoming && (
                                                    <>
                                                        <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(req.id, 'Accepted')}>Accept Connection</button>
                                                        <button className="btn btn-danger-ghost btn-sm" onClick={() => handleStatusUpdate(req.id, 'Rejected')}>Decline</button>
                                                    </>
                                                )}
                                                {req.status === 'Accepted' && (
                                                    <button className="btn btn-outline btn-sm" onClick={() => {
                                                        setSelectedChat(partner);
                                                        setActiveTab('chats');
                                                    }}>
                                                        <MessageSquare size={16} /> Message
                                                    </button>
                                                )}
                                                {req.status === 'Pending' && !isIncoming && (
                                                    <span className="wait-msg">Awaiting connection...</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {requests.length === 0 && (
                                    <div className="empty-state">
                                        <h3>No connection requests</h3>
                                        <p>Head over to the Directory to find fellow alumni to connect with.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'chats' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="chats" className="chat-interface glass-card">
                            <div className="chat-sidebar">
                                <h3>Active Chats</h3>
                                <div className="chat-list">
                                    {chats.map(chat => (
                                        <div key={chat.id} 
                                             className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                                             onClick={() => setSelectedChat(chat)}
                                        >
                                            <div className="avatar-xs">{chat.name.charAt(0)}</div>
                                            <div className="chat-meta">
                                                <h4>{chat.name}</h4>
                                                <span>{chat.company}</span>
                                            </div>
                                            <ChevronRight size={16} />
                                        </div>
                                    ))}
                                    {chats.length === 0 && <div className="p-4 text-muted text-sm">No active chats.</div>}
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
                                                    <span>{selectedChat.company}</span>
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
                                                placeholder="Type your message..." 
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                            />
                                            <button type="submit" className="send-btn"><Send size={20} /></button>
                                        </form>
                                    </>
                                ) : (
                                    <div className="chat-placeholder">
                                        <MessageSquare size={64} />
                                        <h3>Your Alumni Network</h3>
                                        <p>Select a fellow alumni to start a conversation.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AlumniChat;
