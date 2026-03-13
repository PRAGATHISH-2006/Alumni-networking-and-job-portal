import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, UserPlus, Users, MessageSquare, Award, Loader, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const AlumniDashboard = () => {
    const { user, loading: authLoading } = useAuth();

    if (authLoading) {
        return (
            <div className="loading-screen">
                <Loader className="animate-spin" size={48} />
            </div>
        );
    }

    if (user && user.role === 'alumni' && !user.isApproved) {
        return (
            <div className="role-dashboard pending-state">
                <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="glass-card" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
                            <ShieldCheck size={64} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
                            <h1 style={{ marginBottom: '1rem' }}>Account <span className="gradient-text">Pending Approval</span></h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                                Thank you for joining our alumni network, <strong>{user.name}</strong>! <br/><br/> 
                                Your request is currently being reviewed by the administration. You will gain full access to the portal once your status is verified.
                            </p>
                            <div className="pending-actions">
                                <Link to="/support" className="btn btn-outline" style={{ marginRight: '1rem' }}>Contact Support</Link>
                                <button onClick={() => window.location.reload()} className="btn btn-primary">Check Status</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="role-dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1>Welcome, <span className="gradient-text">{user?.name || 'Alumni'}</span></h1>
                        <p>Give back to the community, hire talent, and reconnect with peers.</p>
                    </motion.div>
                </div>

                <div className="dashboard-grid">
                    <DashboardCard 
                        icon={<Briefcase size={40} />} 
                        title="Post a Job/Referral" 
                        description="Share career opportunities or provide referrals to students." 
                        linkTo="/jobs" 
                        color="var(--secondary)" 
                    />
                    <DashboardCard 
                        icon={<UserPlus size={40} />} 
                        title="Mentorship Requests" 
                        description="Review and respond to guidance requests from current students." 
                        linkTo="/mentorship" 
                        color="#10b981" 
                    />
                    <DashboardCard 
                        icon={<Users size={40} />} 
                        title="Alumni Network" 
                        description="Search the directory to reconnect with your batchmates." 
                        linkTo="/directory" 
                        color="var(--primary)" 
                    />
                    <DashboardCard 
                        icon={<Award size={40} />} 
                        title="Update Profile" 
                        description="Keep your professional experience and company details current." 
                        linkTo="/profile" 
                        color="#f59e0b" 
                    />
                </div>
            </div>
        </div>
    );
};

const DashboardCard = ({ icon, title, description, linkTo, color }) => (
    <motion.div whileHover={{ y: -5, scale: 1.02 }} className="glass-card dashboard-action-card" style={{ borderTop: `4px solid ${color}` }}>
        <Link to={linkTo} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="dashboard-icon" style={{ color }}>{icon}</div>
            <h3>{title}</h3>
            <p>{description}</p>
        </Link>
    </motion.div>
);

export default AlumniDashboard;
