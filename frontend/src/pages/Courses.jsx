import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Clock, Users, Star, BookOpen, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Courses.css';

const courses = [
    {
        id: 1,
        title: "Advanced System Design for Scalable Apps",
        instructor: "David Kim (Class of 2016)",
        duration: "12 Hours",
        students: "1,200+",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 2,
        title: "Product Management in Big Tech",
        instructor: "Michael Ross (Class of 2015)",
        duration: "8 Hours",
        students: "850+",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 3,
        title: "Mastering React & Framer Motion",
        instructor: "Priya Sharma (Class of 2019)",
        duration: "10 Hours",
        students: "2,500+",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 4,
        title: "AI & Machine Learning Foundations",
        instructor: "Elena Gomez (Class of 2020)",
        duration: "15 Hours",
        students: "3,000+",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=400&q=80"
    }
];

const Courses = () => {
    const navigate = useNavigate();
    return (
        <div className="courses-page">
            <header className="courses-header">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="gradient-text"
                >
                    Lifelong Learning
                </motion.h1>
                <p>Exclusive online courses led by our notable alumni experts.</p>
            </header>

            <div className="courses-toolbar">
                <div className="search-input glass-card" style={{ padding: '0.5rem 1rem', width: '400px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Search size={20} color="var(--text-muted)" />
                    <input type="text" placeholder="Search courses..." style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }} />
                </div>
                <div className="courses-categories">
                    <button className="category-pill active">All</button>
                    <button className="category-pill">Tech</button>
                    <button className="category-pill">Product</button>
                    <button className="category-pill">Design</button>
                </div>
            </div>

            <div className="courses-grid">
                {courses.map((course, index) => (
                    <motion.div
                        key={course.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card course-card"
                    >
                        <div className="course-img">
                            <img src={course.image} alt={course.title} loading="lazy" />
                            <div className="course-play"><PlayCircle size={40} /></div>
                        </div>
                        <div className="course-body">
                            <h3>{course.title}</h3>
                            <p className="instructor"><BookOpen size={14} /> {course.instructor}</p>
                            <div className="course-meta">
                                <span><Clock size={14} /> {course.duration}</span>
                                <span><Users size={14} /> {course.students}</span>
                                <span className="rating"><Star size={14} fill="var(--secondary)" /> {course.rating}</span>
                            </div>
                            <button
                                className="btn btn-primary start-btn"
                                onClick={() => navigate(`/course/${course.id}/play`)}
                            >
                                Enroll Now
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Courses;
