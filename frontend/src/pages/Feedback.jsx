import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, User, Mail, HelpingHand } from 'lucide-react';
import './Feedback.css';

const Feedback = () => {
    const [status, setStatus] = useState('idle'); // idle, sending, success
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        type: 'General',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('sending');
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            setFormData({ name: '', email: '', type: 'General', message: '' });
            setTimeout(() => setStatus('idle'), 5000);
        }, 1500);
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
                    <div className="info-card glass-card">
                        <h3>Community Support</h3>
                        <p>Our team reviews every piece of feedback to ensure the best experience for our alumni.</p>
                        <ul className="info-list">
                            <li>Check regular updates in the News section.</li>
                            <li>Join the Mentorship program for 1:1 help.</li>
                            <li>Report critical bugs via the ELITE portal.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Feedback;
