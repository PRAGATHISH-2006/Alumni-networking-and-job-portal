import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Tag, ChevronRight, Newspaper, Bell } from 'lucide-react';
import './News.css';

const newsItems = [
    {
        id: 1,
        title: "LPU Alumni Meet 2026: A Grand Success",
        date: "March 15, 2026",
        category: "Event",
        excerpt: "Hundreds of alumni gathered at the main campus for a nostalgic evening of networking and celebration...",
        image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 2,
        title: "New Research Wing Inaugurated",
        date: "March 10, 2026",
        category: "Campus",
        excerpt: "The latest state-of-the-art AI Lab was inaugurated by our notable alumni David Kim...",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 3,
        title: "Alumni Achievement: Sarah Chen Wins Tech Award",
        date: "March 05, 2026",
        category: "Achievement",
        excerpt: "Sarah Chen (Class of 2018) has been recognized as the 'Emerging Tech Lead of the Year' by Global Tech Forum...",
        image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 4,
        title: "Upcoming Webinar: Future of Quantum Computing",
        date: "March 20, 2026",
        category: "Webinar",
        excerpt: "Join us for an exclusive session with leading researchers in the field of quantum tech...",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80"
    }
];

const News = () => {
    return (
        <div className="news-page">
            <header className="news-header">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="gradient-text"
                >
                    Happenings & News
                </motion.h1>
                <p>Stay updated with the latest stories from your alma mater.</p>
            </header>

            <div className="news-highlights">
                <div className="news-grid">
                    {newsItems.map((news, index) => (
                        <motion.div
                            key={news.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card news-card"
                        >
                            <div className="news-img-wrapper">
                                <img src={news.image} alt={news.title} loading="lazy" />
                                <div className="news-category">
                                    <Tag size={12} /> {news.category}
                                </div>
                            </div>
                            <div className="news-body">
                                <div className="news-meta">
                                    <Calendar size={14} /> {news.date}
                                </div>
                                <h3>{news.title}</h3>
                                <p>{news.excerpt}</p>
                                <button className="read-btn">
                                    Read Full Story <ChevronRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="news-sidebar">
                    <div className="glass-card sidebar-widget">
                        <h3><Bell size={20} /> Quick Announcements</h3>
                        <ul className="announcement-list">
                            <li>Convocation 2026 dates announced!</li>
                            <li>New alumni discount on online courses.</li>
                            <li>Mentorship applications now open for Batch 2027.</li>
                            <li>Join the volunteer team for LPU TechFest.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default News;
