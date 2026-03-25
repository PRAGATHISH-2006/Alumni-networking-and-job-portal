import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, Calendar, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import AlumniDashboard from './AlumniDashboard';
import AdminDashboard from './Admin';
import './Home.css';

const Home = () => {
    const { user } = useAuth();

    if (user) {
        if (user.role === 'student') return <StudentDashboard />;
        if (user.role === 'alumni') return <AlumniDashboard />;
        if (user.role === 'admin') return <AdminDashboard />;
    }

    return (
        <div className="home-page">
            <section className="hero">
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="hero-content"
                    >
                        <h1 className="hero-title">Connecting <span className="gradient-text">Generations</span> of Success.</h1>
                        <p className="hero-subtitle">The ultimate platform for alumni networking, mentorship, and career growth. Join thousands of graduates shaping the future.</p>
                        <div className="hero-actions">
                            <button className="btn btn-primary">Join Community</button>
                            <button className="btn" style={{ border: '1px solid var(--glass-border)' }}>Learn More</button>
                        </div>
                    </motion.div>
                </div>
                <div className="hero-bg-blobs">
                    <div className="blob blur-1"></div>
                    <div className="blob blur-2"></div>
                </div>
            </section>

            <section className="features container">
                <div className="feature-grid">
                    <FeatureCard icon={<Users size={32} />} title="Alumni Directory" desc="Find and connect with graduates across different fields." />
                    <FeatureCard icon={<Briefcase size={32} />} title="Job Portal" desc="Exclusive job listings posted by alumni and partners." />
                    <FeatureCard icon={<Calendar size={32} />} title="Events" desc="Stay updated with webinars, meetups, and conferences." />
                    <FeatureCard icon={<Award size={32} />} title="Mentorship" desc="Get career guidance from experienced professionals." />
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        className="glass-card feature-card"
    >
        <div className="feature-icon">{icon}</div>
        <h3>{title}</h3>
        <p>{desc}</p>
    </motion.div>
);

export default Home;
