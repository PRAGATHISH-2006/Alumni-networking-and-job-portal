import React from 'react';
import { motion } from 'framer-motion';
import { Book, Download, Eye, Calendar, User } from 'lucide-react';
import './Magazine.css';

const magazines = [
    {
        id: 1,
        title: "Alumni Voice - Spring 2026",
        date: "March 2026",
        editor: "Dr. Arvinder Singh",
        cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80",
        desc: "Focus on AI and the future of work for LPU alumni."
    },
    {
        id: 2,
        title: "LPU Chronicles - Annual 2025",
        date: "Dec 2025",
        editor: "Prof. Meera Sharma",
        cover: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=400&q=80",
        desc: "A year in review: Triumphs and transitions."
    },
    {
        id: 3,
        title: "Tech Trends x Alumni",
        date: "Oct 2025",
        editor: "James Wilson (Alumni)",
        cover: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80",
        desc: "How our grads are shaping the global silicon landscape."
    }
];

const Magazine = () => {
    return (
        <div className="magazine-page">
            <header className="magazine-header">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="gradient-text"
                >
                    Alumni Magazine
                </motion.h1>
                <p>Digital editions of our flagship publications and newsletters.</p>
            </header>

            <div className="magazine-grid">
                {magazines.map((mag, index) => (
                    <motion.div
                        key={mag.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card magazine-card"
                    >
                        <div className="mag-cover-wrapper">
                            <img src={mag.cover} alt={mag.title} />
                            <div className="mag-overlay">
                                <button className="icon-btn"><Eye size={24} /></button>
                                <button className="icon-btn"><Download size={24} /></button>
                            </div>
                        </div>
                        <div className="mag-content">
                            <div className="mag-meta">
                                <span><Calendar size={14} /> {mag.date}</span>
                                <span><User size={14} /> {mag.editor}</span>
                            </div>
                            <h3>{mag.title}</h3>
                            <p>{mag.desc}</p>
                            <div className="mag-actions">
                                <button className="btn btn-primary">Read Online</button>
                                <button className="btn btn-outline">PDF Download</button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="subscription-box glass-card">
                <Book size={40} className="sub-icon" />
                <h3>Subscribe to Print Edition</h3>
                <p>Get the high-quality physical copy delivered to your doorstep twice a year.</p>
                <button className="btn btn-primary">Manage Subscription</button>
            </div>
        </div>
    );
};

export default Magazine;
