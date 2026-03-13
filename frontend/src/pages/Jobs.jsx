import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Briefcase, 
    MapPin, 
    Building, 
    DollarSign, 
    Clock, 
    Plus, 
    X, 
    Send, 
    CheckCircle,
    UserCircle,
    Search,
    Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Jobs.css';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPostModal, setShowPostModal] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isPosting, setIsPosting] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [newJob, setNewJob] = useState({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        description: '',
        salary: '',
        isReferral: false
    });

    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Safety Guard
    if (authLoading) {
        return <div className="loading-state">Syncing Career Hub...</div>;
    }

    const fetchJobs = async () => {
        try {
            const { data } = await API.get('/api/jobs');
            setJobs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Fetch jobs error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const typeFilter = queryParams.get('type');
        let result = jobs;

        if (typeFilter) {
            result = result.filter(job => job.type.toLowerCase() === typeFilter.toLowerCase());
        }

        if (searchTerm) {
            result = result.filter(job => 
                job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.company.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredJobs(result);
    }, [jobs, location.search, searchTerm]);

    const handleApplyClick = (job) => {
        if (!user) {
            navigate('/login');
            return;
        }
        setSelectedJob(job);
        setShowApplyModal(true);
    };

    const handleApplySubmit = async (e) => {
        e.preventDefault();
        setIsApplying(true);
        const formData = new FormData(e.target);
        
        try {
            await axios.post(`http://localhost:5000/api/jobs/${selectedJob.id}/apply`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowApplyModal(false);
            alert('Application submitted! The recruiter/alumni will review your profile.');
            fetchJobs(); // Refresh to update potentially applied status if needed
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to apply';
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsApplying(false);
        }
    };

    const handlePostJob = async (e) => {
        e.preventDefault();
        setIsPosting(true);
        try {
            await API.post('/api/jobs', newJob);
            setShowPostModal(false);
            setNewJob({ title: '', company: '', location: '', type: 'Full-time', description: '', salary: '', isReferral: false });
            fetchJobs();
        } catch (error) {
            alert('Failed to post job');
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="jobs-page">
            <div className="container">
                <div className="jobs-header">
                    <div className="header-main">
                        <h1>Career <span className="gradient-text">Hub</span></h1>
                        <p>Opportunities curated for the LPU Alumni network.</p>
                    </div>
                    <div className="header-actions">
                        <div className="search-bar-gl">
                            <Search size={18} />
                            <input 
                                type="text" 
                                placeholder="Search title or company..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {(user?.role === 'alumni' || user?.role === 'admin') && (
                            <button className="btn btn-primary post-btn" onClick={() => setShowPostModal(true)}>
                                <Plus size={20} /> Post Opportunity
                            </button>
                        )}
                    </div>
                </div>

                <div className="jobs-layout">
                    <aside className="jobs-filter-panel glass-card">
                        <h3>Filter by Type</h3>
                        <div className="filter-options">
                            <button className={`filter-btn ${!location.search ? 'active' : ''}`} onClick={() => navigate('/jobs')}>All Jobs</button>
                            <button className={`filter-btn ${location.search.includes('Full-time') ? 'active' : ''}`} onClick={() => navigate('/jobs?type=Full-time')}>Full-time</button>
                            <button className={`filter-btn ${location.search.includes('Internship') ? 'active' : ''}`} onClick={() => navigate('/jobs?type=Internship')}>Internships</button>
                            <button className={`filter-btn ${location.search.includes('Contract') ? 'active' : ''}`} onClick={() => navigate('/jobs?type=Contract')}>Contract</button>
                        </div>
                    </aside>

                    <main className="jobs-main-content">
                        {loading ? (
                            <div className="loading-state">
                                <Loader className="spin" /> Discovering opportunities...
                            </div>
                        ) : (
                            <div className="jobs-list">
                                {filteredJobs.length > 0 ? (
                                    filteredJobs.map((job) => (
                                        <JobCard key={job.id} job={job} onApply={() => handleApplyClick(job)} />
                                    ))
                                ) : (
                                    <div className="empty-careers glass-card">
                                        <p>No matches found for your criteria.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Post Job Modal */}
            <AnimatePresence>
                {showPostModal && (
                    <div className="modal-overlay">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card modal-card"
                        >
                            <div className="modal-header">
                                <h3>Post Career Opportunity</h3>
                                <button className="close-btn" onClick={() => setShowPostModal(false)}><X size={24} /></button>
                            </div>
                            <form onSubmit={handlePostJob} className="post-job-form">
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label>Job Title</label>
                                        <input type="text" required value={newJob.title} onChange={(e) => setNewJob({...newJob, title: e.target.value})} placeholder="e.g. Software Engineer" />
                                    </div>
                                    <div className="input-group">
                                        <label>Company</label>
                                        <input type="text" required value={newJob.company} onChange={(e) => setNewJob({...newJob, company: e.target.value})} placeholder="e.g. Google" />
                                    </div>
                                    <div className="input-group">
                                        <label>Location</label>
                                        <input type="text" required value={newJob.location} onChange={(e) => setNewJob({...newJob, location: e.target.value})} placeholder="e.g. Remote or NYC" />
                                    </div>
                                    <div className="input-group">
                                        <label>Job Type</label>
                                        <select value={newJob.type} onChange={(e) => setNewJob({...newJob, type: e.target.value})}>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Internship">Internship</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Part-time">Part-time</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Salary/Budget</label>
                                    <input type="text" value={newJob.salary} onChange={(e) => setNewJob({...newJob, salary: e.target.value})} placeholder="e.g. $100k - $120k" />
                                </div>
                                <div className="input-group">
                                    <label>Description</label>
                                    <textarea required value={newJob.description} onChange={(e) => setNewJob({...newJob, description: e.target.value})} placeholder="Describe the role, requirements, and benefits..." rows="4"></textarea>
                                </div>
                                <div className="checkbox-group">
                                    <input type="checkbox" id="referral" checked={newJob.isReferral} onChange={(e) => setNewJob({...newJob, isReferral: e.target.checked})} />
                                    <label htmlFor="referral">Internal Referral (I can refer candidates personally)</label>
                                </div>
                                <button type="submit" className="btn btn-primary w-full" disabled={isPosting}>
                                    {isPosting ? <Loader className="spin" /> : <><Send size={18} /> Post Opportunity</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Apply Job Modal */}
            <AnimatePresence>
                {showApplyModal && (
                    <div className="modal-overlay">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card modal-card"
                        >
                            <div className="modal-header">
                                <div>
                                    <h3>Apply for {selectedJob?.title}</h3>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{selectedJob?.company}</p>
                                </div>
                                <button className="close-btn" onClick={() => setShowApplyModal(false)}><X size={24} /></button>
                            </div>
                            <form onSubmit={handleApplySubmit} className="post-job-form">
                                <div className="input-group">
                                    <label>Why are you a good fit? (Optional)</label>
                                    <textarea name="details" placeholder="Briefly describe your relevant experience..." rows="4"></textarea>
                                </div>
                                <div className="input-group">
                                    <label>Upload Resume (PDF/Doc, Max 5MB)</label>
                                    <input type="file" name="resume" accept=".pdf,.doc,.docx" required />
                                </div>
                                <button type="submit" className="btn btn-primary w-full" disabled={isApplying}>
                                    {isApplying ? <Loader className="spin" /> : <><Send size={18} /> Submit Application</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const JobCard = ({ job, onApply }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card job-card ${job.isReferral ? 'referral' : ''}`}
    >
        {job.isReferral && <div className="referral-ribbon">ALUMNI REFERRAL</div>}
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
                <DollarSign size={18} />
                <span>{job.salary || 'Negotiable'}</span>
            </div>
        </div>

        <p className="job-desc">{job.description}</p>

        <div className="job-footer">
            <div className="poster-meta">
                <UserCircle size={16} />
                <span>Posted by {job.poster?.name || 'Network Member'}</span>
            </div>
            <div className="card-actions">
                <button className="btn btn-primary" onClick={onApply}>Apply Now</button>
            </div>
        </div>
    </motion.div>
);

export default Jobs;
