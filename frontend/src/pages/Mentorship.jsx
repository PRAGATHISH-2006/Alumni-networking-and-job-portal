import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Check, X, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './Mentorship.css';

const featuredMentors = [
    { id: 1, name: "Satish Kumar", role: "VP @ Microsoft", expertise: "Cloud & Scalable Systems", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
    { id: 2, name: "Anita Rao", role: "CEO @ GreenTech", expertise: "Sustainability & Leadership", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
    { id: 3, name: "Rajat Verma", role: "Director @ Netflix", expertise: "Product & Media Design", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" }
];

const Mentorship = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'requests'
    const { user } = useAuth();

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/mentorship/requests');
                setRequests(data);
            } catch (error) {
                console.error(error);
                // Fallback sample data if backend fails
                setRequests([
                    { _id: '1', student: { name: 'Rahul Dev' }, mentor: { name: 'Satish Kumar' }, topic: 'Career in Cloud', message: 'I need guidance on AWS certifications.', status: 'Pending' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/mentorship/${id}`, { status });
            setRequests(requests.map(r => r._id === id ? { ...r, status } : r));
        } catch (error) {
            alert('Status updated (Simulation)');
            setRequests(requests.map(r => r._id === id ? { ...r, status } : r));
        }
    };

    const handleRequestMentorship = (mentorName) => {
        const topic = prompt(`Requesting mentorship from ${mentorName}. \nWhat topic would you like to discuss?`);
        if (!topic) return;

        const newRequest = {
            _id: Date.now().toString(),
            student: { name: user?.name || 'You' },
            mentor: { name: mentorName },
            topic: topic,
            message: 'Awaiting initial connection...',
            status: 'Pending'
        };

        setRequests([newRequest, ...requests]);
        alert(`Your request has been sent to ${mentorName}!`);
        setActiveTab('requests');
    };

    return (
        <div className="mentorship-page">
            <div className="container">
                <div className="mentorship-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
                        onClick={() => setActiveTab('browse')}
                    >
                        Find a Mentor
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        My Requests ({requests.length})
                    </button>
                </div>

                {activeTab === 'browse' ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="mentorship-header">
                            <h1>Connect with <span className="gradient-text">Experts</span></h1>
                            <p>Choose a mentor to guide you through your professional journey.</p>
                        </div>

                        <div className="featured-mentors-grid">
                            {featuredMentors.map(mentor => (
                                <div key={mentor.id} className="glass-card mentor-intro-card">
                                    <img src={mentor.image} alt={mentor.name} className="mentor-thumb" />
                                    <h3>{mentor.name}</h3>
                                    <p className="mentor-role">{mentor.role}</p>
                                    <p className="mentor-exp">Expertise: <span>{mentor.expertise}</span></p>
                                    <button
                                        className="btn btn-primary small-btn"
                                        onClick={() => handleRequestMentorship(mentor.name)}
                                    >
                                        Request Mentorship
                                    </button>
                                </div>
                            ))}
                        </div>

                        {(user?.role === 'alumni' || user?.role === 'admin') && (
                            <>
                                <div className="mentorship-header" style={{ marginTop: '5rem' }}>
                                    <h2>Share Your <span className="gradient-text">Expertise</span></h2>
                                    <p>Apply to become a mentor and help the next generation of graduates.</p>
                                </div>

                                <div className="glass-card mentor-form-card">
                                    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); alert('Application submitted successfully!'); }}>
                                        <div className="form-row">
                                            <div className="input-group">
                                                <label>Industry Expertise</label>
                                                <input type="text" placeholder="e.g. AI, Fintech, Marketing" required />
                                            </div>
                                            <div className="input-group">
                                                <label>Years of Experience</label>
                                                <input type="number" placeholder="e.g. 5" required />
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <label>Why do you want to mentor?</label>
                                            <textarea rows="4" placeholder="Briefly describe your motivation..."></textarea>
                                        </div>
                                        <button className="btn btn-primary" type="submit">
                                            Apply as Mentor <User size={18} />
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="mentorship-header">
                            <h2>Active <span className="gradient-text">Connections</span></h2>
                            <p>Manage your mentorship requests and ongoing sessions.</p>
                        </div>

                        {loading ? (
                            <div className="loading-state">Loading connections...</div>
                        ) : (
                            <div className="requests-list">
                                {requests.length === 0 ? (
                                    <div className="empty-state glass-card">
                                        <MessageSquare size={48} />
                                        <p>No active connections found. Browse mentors to get started!</p>
                                    </div>
                                ) : (
                                    requests.map((req) => (
                                        <RequestCard
                                            key={req._id}
                                            request={req}
                                            isMentor={user?.role === 'alumni'}
                                            onUpdate={handleStatusUpdate}
                                        />
                                    ))
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const RequestCard = ({ request, isMentor, onUpdate }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card request-card"
    >
        <div className="request-user">
            <div className="user-icon"><User size={24} /></div>
            <div>
                <h3>{isMentor ? request.student.name : request.mentor.name}</h3>
                <p>{isMentor ? 'Student' : 'Mentor'}</p>
            </div>
            <div className={`status-badge ${request.status.toLowerCase()}`}>{request.status}</div>
        </div>

        <div className="request-body">
            <h4>Topic: {request.topic}</h4>
            <p>{request.message}</p>
        </div>

        {isMentor && request.status === 'Pending' && (
            <div className="request-actions">
                <button className="btn btn-primary" onClick={() => onUpdate(request._id, 'Accepted')}>
                    <Check size={18} /> Accept
                </button>
                <button className="btn btn-outline-danger" onClick={() => onUpdate(request._id, 'Rejected')}>
                    <X size={18} /> Reject
                </button>
            </div>
        )}
    </motion.div>
);

export default Mentorship;
