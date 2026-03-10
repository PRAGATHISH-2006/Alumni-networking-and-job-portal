import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Calendar, MapPin, HandHelping, ClipboardCheck } from 'lucide-react';
import './Volunteer.css';

const opportunities = [
    {
        id: 1,
        title: "Guest Lecturer: Cloud Computing",
        deadline: "April 10, 2026",
        location: "Virtual / Campus",
        points: 50,
        desc: "Share your industry experience with current 3rd-year CS students."
    },
    {
        id: 2,
        title: "Career Mentor for Batch 2027",
        deadline: "March 30, 2026",
        location: "Virtual",
        points: 100,
        desc: "Guide 5 students through their final year placements and projects."
    },
    {
        id: 3,
        title: "Conference Volunteer: TechFest",
        deadline: "May 15, 2026",
        location: "LPU Main Campus",
        points: 30,
        desc: "Help organize the biggest annual technical festival on campus."
    }
];

const Volunteer = () => {
    return (
        <div className="volunteer-page">
            <header className="volunteer-header">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="gradient-text"
                >
                    Volunteer Opportunities
                </motion.h1>
                <p>Give back to your alma mater and earn 'Alumni Points' and recognition.</p>
            </header>

            <div className="volunteer-stats">
                <div className="glass-card stat-card">
                    <Heart size={24} color="#f43f5e" />
                    <div className="stat-info">
                        <h3>1,200+</h3>
                        <p>Total Volunteers</p>
                    </div>
                </div>
                <div className="glass-card stat-card">
                    <Users size={24} color="#8b5cf6" />
                    <div className="stat-info">
                        <h3>5,400+</h3>
                        <p>Hours Contributed</p>
                    </div>
                </div>
                <div className="glass-card stat-card">
                    <MapPin size={24} color="#06b6d4" />
                    <div className="stat-info">
                        <h3>20+</h3>
                        <p>Campus Events</p>
                    </div>
                </div>
            </div>

            <div className="volunteer-list">
                <h2>Open Roles</h2>
                {opportunities.map((opp, index) => (
                    <motion.div
                        key={opp.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card opp-card"
                    >
                        <div className="opp-info">
                            <HandHelping size={32} className="opp-icon" />
                            <div>
                                <h3>{opp.title}</h3>
                                <div className="opp-meta">
                                    <span><Calendar size={14} /> Deadline: {opp.deadline}</span>
                                    <span><MapPin size={14} /> {opp.location}</span>
                                </div>
                                <p>{opp.desc}</p>
                            </div>
                        </div>
                        <div className="opp-action">
                            <div className="points-badge">+{opp.points} Points</div>
                            <button className="btn btn-primary">Apply to Volunteer</button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="volunteer-footer glass-card">
                <ClipboardCheck size={40} className="footer-icon" />
                <h3>Your Contribution History</h3>
                <p>Log in to view your points and contribution certificates.</p>
                <button className="btn btn-outline">View My Dashboard</button>
            </div>
        </div>
    );
};

export default Volunteer;
