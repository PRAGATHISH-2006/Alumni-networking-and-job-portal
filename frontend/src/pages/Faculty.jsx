import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mail, Phone, BookOpen, User, Filter, GraduationCap } from 'lucide-react';
import './Faculty.css';

const departments = ["All", "Computer Science", "Electronics", "Business", "Mechanical", "BioTech", "Design"];

const facultyData = [
    { id: 1, name: "Dr. Arvinder Singh", dept: "Computer Science", role: "Professor & Head", expertise: "Cloud Computing, Big Data", email: "arvinder.s@lpu.co.in", image: "AS" },
    { id: 2, name: "Prof. Meera Sharma", dept: "Electronics", role: "Associate Professor", expertise: "VLSI, IoT Systems", email: "meera.sh@lpu.co.in", image: "MS" },
    { id: 3, name: "Dr. Rajesh Verma", dept: "Business", role: "Professor", expertise: "Strategic Management", email: "rajesh.v@lpu.co.in", image: "RV" },
    { id: 4, name: "Dr. Sunita Kapoor", dept: "Computer Science", role: "Assistant Professor", expertise: "AI & ML, Neural networks", email: "sunita.k@lpu.co.in", image: "SK" },
    { id: 5, name: "Prof. David Johnson", dept: "Mechanical", role: "Professor", expertise: "Robotics, Automation", email: "david.j@lpu.co.in", image: "DJ" },
    { id: 6, name: "Dr. Priya Iyer", dept: "BioTech", role: "Associate Professor", expertise: "Genetic Engineering", email: "priya.i@lpu.co.in", image: "PI" },
    { id: 7, name: "Prof. Amit Khanna", dept: "Design", role: "HOD Design", expertise: "UX/UI, Product Design", email: "amit.k@lpu.co.in", image: "AK" },
    { id: 8, name: "Dr. Neha Gupta", dept: "Computer Science", role: "Professor", expertise: "Cyber Security", email: "neha.g@lpu.co.in", image: "NG" },
    { id: 9, name: "Prof. James Smith", dept: "Electronics", role: "Assistant Professor", expertise: "Embedded Systems", email: "james.s@lpu.co.in", image: "JS" },
    { id: 10, name: "Dr. Kavita Reddy", dept: "Business", role: "Associate Professor", expertise: "Economics, Finance", email: "kavita.r@lpu.co.in", image: "KR" }
];

const Faculty = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('All');

    const filteredFaculty = facultyData.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.expertise.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = selectedDept === 'All' || f.dept === selectedDept;
        return matchesSearch && matchesDept;
    });

    return (
        <div className="faculty-page">
            <header className="faculty-header">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="gradient-text"
                >
                    Faculty Directory
                </motion.h1>
                <p>Connect with our world-class faculty and academic guides.</p>
            </header>

            <div className="faculty-controls glass-card">
                <div className="search-box">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name or expertise..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <Filter size={18} />
                    <div className="dept-pills">
                        {departments.map(dept => (
                            <button
                                key={dept}
                                className={`dept-pill ${selectedDept === dept ? 'active' : ''}`}
                                onClick={() => setSelectedDept(dept)}
                            >
                                {dept}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="faculty-grid">
                <AnimatePresence>
                    {filteredFaculty.map((faculty, index) => (
                        <motion.div
                            key={faculty.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="glass-card faculty-card"
                        >
                            <div className="faculty-card-top">
                                <div className="faculty-avatar">
                                    {faculty.image}
                                </div>
                                <div className="faculty-title">
                                    <h3>{faculty.name}</h3>
                                    <p className="role"><GraduationCap size={14} /> {faculty.role}</p>
                                </div>
                            </div>

                            <div className="faculty-details">
                                <div className="detail-item">
                                    <BookOpen size={16} />
                                    <span>{faculty.dept}</span>
                                </div>
                                <div className="expertise">
                                    <strong>Expertise:</strong>
                                    <p>{faculty.expertise}</p>
                                </div>
                            </div>

                            <div className="faculty-actions">
                                <a href={`mailto:${faculty.email}`} className="btn btn-outline small">
                                    <Mail size={16} /> Email
                                </a>
                                <button className="btn btn-primary small">
                                    View Profile
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {filteredFaculty.length === 0 && (
                    <div className="no-results glass-card">
                        <User size={48} />
                        <h3>No Faculty Found</h3>
                        <p>Try adjusting your search or filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Faculty;
