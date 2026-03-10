import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, MapPin, Building, DollarSign, Clock, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Jobs.css';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/jobs');
                setJobs(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Fetch jobs error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const typeFilter = queryParams.get('type');
        if (typeFilter) {
            setFilteredJobs(jobs.filter(job => job.type.toLowerCase() === typeFilter.toLowerCase()));
        } else {
            setFilteredJobs(jobs);
        }
    }, [jobs, location.search]);

    const handleApply = async (jobId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            await axios.post(`http://localhost:5000/api/jobs/${jobId}/apply`);
            alert('Applied successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to apply');
        }
    };

    return (
        <div className="jobs-page">
            <div className="container">
                <div className="jobs-header">
                    <div>
                        <h1>{location.search.includes('Internship') ? 'Internship' : 'Career'} <span className="gradient-text">Opportunities</span></h1>
                        <p>Explore {location.search.includes('Internship') ? 'internships' : 'jobs'} posted by our alumni network.</p>
                    </div>
                    {(user?.role === 'alumni' || user?.role === 'admin') && (
                        <button className="btn btn-primary">
                            <Plus size={20} /> Post a Job
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="loading-state">Loading jobs...</div>
                ) : (
                    <div className="jobs-list">
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map((job) => (
                                <JobCard key={job.id} job={job} onApply={() => handleApply(job.id)} />
                            ))
                        ) : (
                            <div className="no-data-msg">No {location.search.includes('Internship') ? 'internships' : 'jobs'} found for this category.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const JobCard = ({ job, onApply }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card job-card"
    >
        <div className="job-main">
            <div className="job-info">
                <h3>{job.title}</h3>
                <div className="job-meta">
                    <span className="company"><Building size={16} /> {job.company}</span>
                    <span className="location"><MapPin size={16} /> {job.location}</span>
                    <span className="type-badge">{job.type}</span>
                </div>
            </div>
            <div className="job-salary">
                <DollarSign size={20} />
                <span>{job.salary || 'Negotiable'}</span>
            </div>
        </div>

        <p className="job-desc">{job.description ? job.description.substring(0, 150) : 'No description available'}...</p>

        <div className="job-footer">
            <span className="posted-at"><Clock size={14} /> Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recent'}</span>
            <button className="btn btn-primary" onClick={onApply}>Apply Now</button>
        </div>
    </motion.div>
);

export default Jobs;
