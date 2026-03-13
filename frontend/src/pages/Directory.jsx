import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Search, MapPin, Building, GraduationCap, Filter, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Directory.css';

const Directory = () => {
    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Safety Guard
    if (authLoading) {
        return <div className="loading-state">Initializing...</div>;
    }
    const [filters, setFilters] = useState({
        search: '',
        department: '',
        batch: '',
        company: ''
    });

    useEffect(() => {
        const fetchAlumni = async () => {
            setLoading(true);
            try {
                const { data } = await API.get('/api/users/alumni', { params: filters });
                console.log('Alumni data received:', data);
                setAlumni(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Fetch alumni error:', error);
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
                        <input
                            name="company"
                            type="text"
                            placeholder="Filter by Company..."
                            value={filters.company}
                            onChange={handleFilterChange}
                            className="directory-filter-input"
                        />
                        <select name="department" value={filters.department} onChange={handleFilterChange}>
                            <option value="">All Departments</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Mechanical Engineering">Mechanical Engineering</option>
                            <option value="Civil Engineering">Civil Engineering</option>
                            <option value="Electrical Engineering">Electrical Engineering</option>
                        </select>
                        <select name="batch" value={filters.batch} onChange={handleFilterChange}>
                            <option value="">All Batches</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                            <option value="2022">2022</option>
                            <option value="2021">2021</option>
                            <option value="2020">2020</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">Loading alumni...</div>
                ) : (
                    <div className="alumni-grid">
                        {alumni.length > 0 ? (
                            alumni.map((person) => (
                                <AlumniCard key={person.id} person={person} user={user} navigate={navigate} />
                            ))
                        ) : (
                            <div className="no-results glass-card">
                                <h3>No alumni found</h3>
                                <p>Try adjusting your filters or search terms.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const AlumniCard = ({ person, user, navigate }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-card alumni-card"
    >
        <div className="alumni-avatar">
            <div className="avatar-placeholder">{person.name?.charAt(0) || '?'}</div>
        </div>
        <h3>{person.name}</h3>
        <p className="role">{person.bio || 'Alumni'}</p>

        <div className="alumni-details">
            <div className="detail-item">
                <Building size={16} />
                <span>{person.company || 'Not specified'}</span>
            </div>
            <div className="detail-item">
                <GraduationCap size={16} />
                <span>{person.batch ? `Class of ${person.batch}` : 'Alumni'} • {person.department || 'N/A'}</span>
            </div>
            <div className="detail-item">
                <MapPin size={16} />
                <span>{person.location || 'Remote'}</span>
            </div>
        </div>

        <div className="card-actions-row">
            <button
                className="btn btn-outline btn-sm"
                onClick={() => user ? navigate(`/profile/${person.id}`) : navigate('/login')}
            >
                View Profile
            </button>
            {user && user.id !== person.id && (
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/profile/${person.id}`)}
                >
                    <MessageSquare size={14} style={{ marginRight: '4px' }} /> 
                    {person.role === 'alumni' ? 'Request Guidance' : 'Connect'}
                </button>
            )}
        </div>
    </motion.div>
);

export default Directory;
