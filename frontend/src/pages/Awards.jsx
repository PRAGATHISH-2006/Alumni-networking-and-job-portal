import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Trophy, Medal, CheckCircle2, UserPlus } from 'lucide-react';
import './Awards.css';

const Awards = ({ mode = 'general' }) => {
    const isNominations = mode === 'nominations';
    const isElite = mode === 'elite';
    const isNotable = mode === 'notable';

    const awardItems = [
        { id: 1, name: "Alumni of the Year 2025", winner: "Sarah Chen", year: "2025", desc: "For exceptional tech leadership at Google." },
        { id: 2, name: "Community Impact Award", winner: "Michael Ross", year: "2024", desc: "For driving sustainable infrastructure at Tesla." },
        { id: 3, name: "Young Achiever Award", winner: "Elena Gomez", year: "2025", desc: "For groundbreaking R&D in Meta AI." },
        { id: 4, name: "Entrepreneur Excellence", winner: "James Wilson", year: "2023", desc: "For pioneering work in custom hardware." }
    ];

    const eliteAlumni = [
        { name: "Satish Kumar", role: "VP @ Microsoft", batch: "1998", achievement: "Global Tech Visionary" },
        { name: "Anita Rao", role: "CEO @ GreenTech", batch: "2002", achievement: "Environmental Leader" },
        { name: "Rajat Verma", role: "Director @ Netflix", batch: "2005", achievement: "Media Innovation Award" }
    ];

    return (
        <div className="awards-page">
            <header className="awards-header">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="gradient-text"
                >
                    {isNominations ? "Award Nominations 2025" :
                        isElite ? "Elite Alumni Hall" :
                            isNotable ? "Notable Alumni Achievements" : "Alumni Awards"}
                </motion.h1>
                <p>Recognizing excellence and inspiring brilliance in our community.</p>
            </header>

            {isNominations ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card nomination-form">
                    <h2>Nominate an Alumnus</h2>
                    <p>Help us recognize someone who has made an impact.</p>
                    <form className="auth-form" style={{ marginTop: '2rem' }}>
                        <div className="form-row">
                            <div className="input-group">
                                <label>Nominee Name</label>
                                <input type="text" placeholder="Full Name" />
                            </div>
                            <div className="input-group">
                                <label>Award Category</label>
                                <select>
                                    <option>Alumni of the Year</option>
                                    <option>Young Achiever</option>
                                    <option>Community Impact</option>
                                </select>
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Reason for Nomination</label>
                            <textarea rows="4" placeholder="Mention their achievements..."></textarea>
                        </div>
                        <button className="btn btn-primary" type="button">
                            Submit Nomination <UserPlus size={18} />
                        </button>
                    </form>
                </motion.div>
            ) : (
                <div className="awards-content">
                    {isElite || isNotable ? (
                        <div className="elite-list">
                            {eliteAlumni.map((alumni, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass-card elite-card"
                                >
                                    <div className="elite-badge">
                                        {isElite ? <Trophy size={32} /> : <Star size={32} />}
                                    </div>
                                    <div className="elite-info">
                                        <h3>{alumni.name}</h3>
                                        <p className="elite-role">{alumni.role} | Class of {alumni.batch}</p>
                                        <div className="elite-achievement">
                                            <CheckCircle2 size={16} /> {alumni.achievement}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="awards-grid">
                            {awardItems.map((award, i) => (
                                <motion.div
                                    key={award.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass-card award-item-card"
                                >
                                    <Medal size={40} className="award-icon" />
                                    <div className="award-year">{award.year}</div>
                                    <h3>{award.name}</h3>
                                    <p className="award-winner">Won by: <span>{award.winner}</span></p>
                                    <p className="award-desc">{award.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Awards;
