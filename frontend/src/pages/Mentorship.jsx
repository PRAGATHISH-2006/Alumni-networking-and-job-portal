import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Check, X, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './Mentorship.css';

const Mentorship = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/mentorship/requests');
                setRequests(data);
            } catch (error) {
                console.error(error);
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
            alert('Failed to update status');
        }
    };

    return (
        <div className="mentorship-page">
            <div className="container">
                <div className="mentorship-header">
                    <h1>Mentorship <span className="gradient-text">Requests</span></h1>
                    <p>Manage your mentorship connections and guidance requests.</p>
                </div>

                {loading ? (
                    <div className="loading-state">Loading requests...</div>
                ) : (
                    <div className="requests-list">
                        {requests.length === 0 ? (
                            <div className="empty-state glass-card">
                                <MessageSquare size={48} />
                                <p>No mentorship requests found.</p>
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
