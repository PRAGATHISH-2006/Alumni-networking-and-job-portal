import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Briefcase, Calendar, Check, Shield, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import './Admin.css';

const Admin = () => {
    const [stats, setStats] = useState({});
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, pendingRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/admin/stats'),
                    axios.get('http://localhost:5000/api/admin/pending')
                ]);
                setStats(statsRes.data);
                setPending(pendingRes.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleApprove = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/approve/${id}`);
            setPending(pending.filter(user => user._id !== id));
            setStats({ ...stats, pendingAlumni: stats.pendingAlumni - 1 });
        } catch (error) {
            alert('Approval failed');
        }
    };

    return (
        <div className="admin-page">
            <div className="container">
                <div className="admin-header">
                    <h1>Admin <span className="gradient-text">Dashboard</span></h1>
                    <p>Platform overview and user management.</p>
                </div>

                <div className="stats-grid">
                    <StatCard icon={<Users />} label="Total Users" value={stats.userCount} color="var(--primary)" />
                    <StatCard icon={<Activity />} label="Pending Approvals" value={stats.pendingAlumni} color="#f59e0b" />
                    <StatCard icon={<Briefcase />} label="Jobs Posted" value={stats.jobCount} color="var(--secondary)" />
                    <StatCard icon={<Calendar />} label="Events" value={stats.eventCount} color="#10b981" />
                </div>

                <div className="admin-section">
                    <h2>Pending Alumni Approvals</h2>
                    <div className="pending-list">
                        {pending.length === 0 ? (
                            <p className="no-pending">No pending approvals.</p>
                        ) : (
                            pending.map((user) => (
                                <div key={user._id} className="glass-card pending-card">
                                    <div className="user-info">
                                        <div className="user-avatar">{user.name.charAt(0)}</div>
                                        <div>
                                            <h3>{user.name}</h3>
                                            <p>{user.email}</p>
                                        </div>
                                    </div>
                                    <button className="btn btn-primary" onClick={() => handleApprove(user._id)}>
                                        <Check size={18} /> Approve
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => (
    <motion.div whileHover={{ y: -5 }} className="glass-card stat-card" style={{ borderColor: `${color}33` }}>
        <div className="stat-icon" style={{ backgroundColor: `${color}1A`, color }}>{icon}</div>
        <div className="stat-content">
            <h3>{value || 0}</h3>
            <p>{label}</p>
        </div>
    </motion.div>
);

export default Admin;
