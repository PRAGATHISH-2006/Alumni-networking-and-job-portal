import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Building, GraduationCap, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import './Directory.css';

const Directory = () => {
    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        department: '',
        batch: ''
    });

    useEffect(() => {
        const fetchAlumni = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get('http://localhost:5000/api/users/alumni', { params: filters });
                setAlumni(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAlumni();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="directory-page">
            <div className="container">
                <div className="directory-header">
                    <h1>Alumni <span className="gradient-text">Directory</span></h1>
                    <p>Connect with your fellow graduates and grow your network.</p>
                </div>

                <div className="search-bar glass-card">
                    <div className="search-input">
                        <Search size={20} className="search-icon" />
                        <input
                            name="search"
                            type="text"
                            placeholder="Search by name or skills..."
                            value={filters.search}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="filters">
                        <select name="department" value={filters.department} onChange={handleFilterChange}>
                            <option value="">All Departments</option>
                            <option value="CS">Computer Science</option>
                            <option value="IT">Information Technology</option>
                            <option value="EE">Electrical Engineering</option>
                        </select>
                        <select name="batch" value={filters.batch} onChange={handleFilterChange}>
                            <option value="">All Batches</option>
                            <option value="2023">2023</option>
                            <option value="2022">2022</option>
                            <option value="2021">2021</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">Loading alumni...</div>
                ) : (
                    <div className="alumni-grid">
                        {alumni.map((person) => (
                            <AlumniCard key={person._id} person={person} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const AlumniCard = ({ person }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-card alumni-card"
    >
        <div className="alumni-avatar">
            {person.profile.profilePicture ? (
                <img src={person.profile.profilePicture} alt={person.name} />
            ) : (
                <div className="avatar-placeholder">{person.name.charAt(0)}</div>
            )}
        </div>
        <h3>{person.name}</h3>
        <p className="role">{person.profile.experience?.[0]?.role || 'Alumni'}</p>

        <div className="alumni-details">
            <div className="detail-item">
                <Building size={16} />
                <span>{person.profile.experience?.[0]?.company || 'Searching...'}</span>
            </div>
            <div className="detail-item">
                <GraduationCap size={16} />
                <span>Batch {person.profile.education?.[0]?.batchYear || 'N/A'}</span>
            </div>
            <div className="detail-item">
                <MapPin size={16} />
                <span>{person.profile.location || 'Remote'}</span>
            </div>
        </div>

        <button className="btn btn-outline">View Profile</button>
    </motion.div>
);

export default Directory;
