import React from 'react';
import API from '../api/axios';
import { motion } from 'framer-motion';
import { Search, Briefcase, Calendar, MessageCircle, UserCircle, Loader, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const StudentDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const [applications, setApplications] = React.useState([]);
    const [loadingApps, setLoadingApps] = React.useState(true);

    React.useEffect(() => {
        const fetchApplications = async () => {
            try {
                const { data } = await API.get('/api/jobs/my-applications');
                setApplications(data);
            } catch (err) {
                console.error('Fetch applications error:', err);
            } finally {
                setLoadingApps(false);
            }
        };
        if (user && user.role?.toLowerCase().trim() === 'student') {
            fetchApplications();
        }
    }, [user]);

    if (authLoading) {
        return (
            <div className="loading-screen">
                <Loader className="animate-spin" size={48} />
            </div>
        );
    }

    return (
        <div className="role-dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1>Welcome, <span className="gradient-text">{user?.name || 'Student'}</span></h1>
                        <p>Launch your career, find mentors, and connect with successful alumni.</p>
                    </motion.div>
                </div>

                <div className="dashboard-grid">
                    <DashboardCard 
                        icon={<Briefcase size={40} />} 
                        title="Job & Internships" 
                        description="Apply for exclusive opportunities posted by our alumni network." 
                        linkTo="/jobs" 
                        color="var(--secondary)" 
                    />
                    <DashboardCard 
                        icon={<MessageCircle size={40} />} 
                        title="Mentorship" 
                        description="Request guidance and chat directly with experienced professionals." 
                        linkTo="/mentorship" 
                        color="#10b981" 
                    />
                    <DashboardCard 
                        icon={<Calendar size={40} />} 
                        title="Upcoming Events" 
                        description="Register for webinars, workshops, and networking meetups." 
                        linkTo="/events" 
                        color="#f59e0b" 
                    />
                    <DashboardCard 
                        icon={<UserCircle size={40} />} 
                        title="My Profile" 
                        description="Update your skills and resume to stand out to recruiters." 
                        linkTo="/profile" 
                        color="#8b5cf6" 
                    />
                </div>

                <div className="recent-activity-section" style={{ marginTop: '3rem' }}>
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2>My <span className="gradient-text">Applications</span></h2>
                        <Link to="/jobs" className="btn-text">Find more jobs <ChevronRight size={16} /></Link>
                    </div>

                    <div className="applications-list">
                        {loadingApps ? (
                            <div className="text-center p-4"><Loader className="spin" /></div>
                        ) : applications.length > 0 ? (
                            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                                <table className="admin-table" style={{ width: '100%', marginBottom: 0 }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <tr>
                                            <th style={{ padding: '1rem' }}>Job Opportunity</th>
                                            <th>Status</th>
                                            <th>Scheduled Interview</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map(app => (
                                            <tr key={app.id}>
                                                <td style={{ padding: '1rem' }}>
                                                    <strong>{app.title}</strong><br/>
                                                    <small style={{ color: '#64748b' }}>{app.poster?.company || app.company}</small>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${app.JobApplicants.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                                        {app.JobApplicants.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {app.JobApplicants.interviewDate ? (
                                                        <div style={{ color: '#10b981', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                <Calendar size={14} />
                                                                {new Date(app.JobApplicants.interviewDate).toLocaleDateString()}
                                                            </div>
                                                            <small style={{ opacity: 0.8, marginLeft: '19px' }}>Type: {app.JobApplicants.interviewType || 'TBD'}</small>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: '#64748b' }}>Not scheduled yet</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="glass-card text-center" style={{ padding: '2rem' }}>
                                <Briefcase size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p style={{ color: '#64748b' }}>You haven't applied for any jobs yet.</p>
                                <Link to="/jobs" className="btn btn-primary" style={{ marginTop: '1rem' }}>Explore Opportunities</Link>
                            </div>
                        )}
                    </div>
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

export default StudentDashboard;
