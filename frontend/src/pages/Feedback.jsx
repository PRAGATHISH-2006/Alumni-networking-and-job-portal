import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, User, Mail, HelpingHand } from 'lucide-react';
import API from '../api/axios';
import './Feedback.css';

const Feedback = () => {
    const [status, setStatus] = useState('idle'); // idle, sending, success
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        type: 'General Feedback',
        message: ''
    });
    const [history, setHistory] = useState([]);

    const fetchHistory = async () => {
        try {
            const res = await API.get('/api/feedback/history');
            setHistory(res.data);
        } catch (error) {
            console.error('Error fetching feedback history:', error);
        }
    };

    useState(() => {
        fetchHistory();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        try {
            await API.post('/api/feedback', formData);
            setStatus('success');
            setFormData({ name: '', email: '', type: 'General Feedback', message: '' });
            fetchHistory();
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            alert('Failed to send feedback');
            setStatus('idle');
        }
    };

    return (
        <div className="feedback-page">
            <header className="feedback-header">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="gradient-text"
                >
                    Your Feedback Matters
                </motion.h1>
                <p>Help us improve our community portal with your suggestions and reports.</p>
            </header>

            <div className="feedback-content">
                <AnimatePresence mode="wait">
                    {status === 'success' ? (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="glass-card success-card"
                        >
                            <div className="success-icon-wrapper">
                                <HelpingHand size={48} />
                            </div>
                            <h2>Thank You!</h2>
                            <p>Your feedback has been received. We'll get back to you soon.</p>
                            <button className="btn btn-primary" onClick={() => setStatus('idle')}>
                                Send Another
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card feedback-card"
                        >
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="input-group">
                                        <label><User size={16} /> Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter your name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label><Mail size={16} /> Email</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="your@email.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label><MessageSquare size={16} /> Category</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option>General Feedback</option>
                                        <option>Bug Report</option>
                                        <option>Feature Request</option>
                                        <option>Alumni Success</option>
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label><MessageSquare size={16} /> Message</label>
                                    <textarea
                                        rows="6"
                                        required
                                        placeholder="How can we help?"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary feedback-btn"
                                    disabled={status === 'sending'}
                                >
                                    {status === 'sending' ? 'Sending...' : (
                                        <>
                                            Submit Feedback <Send size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="feedback-info">
                    <div className="info-card glass-card history-card">
                        <h3>My Feedback History</h3>
                        <div className="history-list">
                            {history.length > 0 ? history.map(item => (
                                <div key={item.id} className="history-item">
                                    <div className="history-header">
                                        <span className={`status-dot ${item.status?.toLowerCase()}`}></span>
                                        <strong>{item.type}</strong>
                                        <span className="history-date">{new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="history-msg">"{item.message}"</p>
                                    {item.adminResponse && (
                                        <div className="admin-reply">
                                            <p><strong>Admin Response:</strong> {item.adminResponse}</p>
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No previous feedback discovered.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Feedback;
