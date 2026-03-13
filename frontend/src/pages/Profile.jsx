import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
    User, 
    Mail, 
    MapPin, 
    Briefcase, 
    GraduationCap, 
    Edit3, 
    FileText, 
    Github, 
    Linkedin, 
    Globe,
    Award,
    Star,
    ExternalLink,
    Code,
    Loader,
    MessageSquare,
    Send,
    X,
    Save
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const { userId } = useParams();
    const { user: currentUser, loading: authLoading, updateUser } = useAuth();
    const [viewedUser, setViewedUser] = useState(null);
    const [pageLoading, setPageLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const isOwnProfile = !userId || userId === currentUser?.id;

    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        location: '',
        skills: [],
        company: '',
        position: '',
        batch: '',
        department: '',
        experience: '',
        interests: [],
        institution: 'Lovely Professional University',
        links: []
    });
    const [saving, setSaving] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestData, setRequestData] = useState({ topic: '', message: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            if (isOwnProfile) {
                setViewedUser(currentUser);
                if (currentUser) {
                    setFormData({
                        name: currentUser.name || '',
                        bio: currentUser.bio || '',
                        location: currentUser.location || '',
                        skills: currentUser.skills || [],
                        company: currentUser.company || '',
                        position: currentUser.position || '',
                        batch: currentUser.batch || '',
                        department: currentUser.department || '',
                        experience: currentUser.experience || '',
                        interests: currentUser.interests || [],
                        institution: currentUser.institution || 'Lovely Professional University',
                        links: currentUser.links || []
                    });
                }
            } else {
                setPageLoading(true);
                try {
                    const { data } = await API.get('/api/users/${userId}');
                    setViewedUser(data);
                } catch (error) {
                    console.error('Error fetching profile', error);
                } finally {
                    setPageLoading(false);
                }
            }
        };

        fetchProfile();
    }, [userId, currentUser, isOwnProfile]);

    if (authLoading || pageLoading) {
        return (
            <div className="loading-screen">
                <Loader className="animate-spin" size={48} />
            </div>
        );
    }

    if (!viewedUser) {
        return <div className="p-8 text-center">User not found.</div>;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSkillsChange = (e) => {
        const skillsArray = e.target.value.split(',').map(s => s.trim());
        setFormData(prev => ({ ...prev, skills: skillsArray }));
    };

    const handleLinkChange = (index, field, value) => {
        const updatedLinks = [...formData.links];
        updatedLinks[index] = { ...updatedLinks[index], [field]: value };
        setFormData(prev => ({ ...prev, links: updatedLinks }));
    };

    const addLink = () => {
        setFormData(prev => ({
            ...prev,
            links: [...prev.links, { title: 'New Link', url: '', type: 'other' }]
        }));
    };

    const removeLink = (index) => {
        const updatedLinks = formData.links.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, links: updatedLinks }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateUser(formData);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const toggleEdit = () => {
        if (!isEditing) {
            setFormData({
                name: viewedUser?.name || '',
                bio: viewedUser?.bio || '',
                location: viewedUser?.location || '',
                skills: viewedUser?.skills || [],
                company: viewedUser?.company || '',
                position: viewedUser?.position || '',
                batch: viewedUser?.batch || '',
                department: viewedUser?.department || '',
                experience: viewedUser?.experience || '',
                interests: viewedUser?.interests || [],
                institution: viewedUser?.institution || 'Lovely Professional University',
                links: viewedUser?.links?.length > 0 ? viewedUser.links : [
                    { title: 'Professional Resume', url: '#', type: 'resume' },
                    { title: 'Portfolio Project', url: '#', type: 'project' }
                ]
            });
        }
        setIsEditing(!isEditing);
    };

    const handleSendRequest = async (e) => {
        e.preventDefault();
        try {
            await API.post('/api/mentorship/request', {
                mentorId: viewedUser.id,
                topic: requestData.topic,
                message: requestData.message
            });
            alert('Request sent successfully!');
            setShowRequestModal(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to send request');
        }
    };

    // Mock data for skills and interests if not present
    const skills = (viewedUser?.skills && Array.isArray(viewedUser.skills) && viewedUser.skills.length > 0) ? viewedUser.skills : ['Add Skills'];
    const displayLinks = viewedUser?.links?.length > 0 ? viewedUser.links : [
        { title: 'Professional Resume', url: '#', type: 'resume' },
        { title: 'Portfolio Project', url: '#', type: 'project' }
    ];

    return (
        <div className="profile-page">
            <div className="profile-header-banner">
                <div className="banner-overlay"></div>
                <div className="edit-toggle-container">
                    {isOwnProfile ? (
                        <>
                            <button onClick={toggleEdit} className={`btn ${isEditing ? 'btn-outline' : 'btn-primary'}`}>
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                            {isEditing && (
                                <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            )}
                        </>
                    ) : (
                        <button onClick={() => setShowRequestModal(true)} className="btn btn-primary">
                            <MessageSquare size={18} /> 
                            {currentUser.role === 'alumni' && viewedUser.role === 'alumni' ? 'Connect' : 'Request Guidance'}
                        </button>
                    )}
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-sidebar-card glass-card">
                    <div className="profile-avatar-wrapper">
                        <div className="avatar-placeholder gradient-bg">
                            {viewedUser?.name?.charAt(0) || 'U'}
                        </div>
                    </div>
                    
                    <div className="profile-basic-info">
                        {isEditing ? (
                            <div className="edit-field">
                                <label>Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} />
                            </div>
                        ) : (
                            <h1>{viewedUser?.name || 'User'}</h1>
                        )}
                        <p className="user-role-badge">{viewedUser?.role?.toUpperCase() || 'MEMBER'}</p>
                        <div className="info-list">
                            <div className="info-item"><Mail size={16} /> <span>{viewedUser?.email}</span></div>
                            <div className="info-item">
                                <MapPin size={16} /> 
                                {isEditing ? (
                                    <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location" />
                                ) : (
                                    <span>{viewedUser?.location || 'Location not set'}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="social-links">
                        <button className="social-icon"><Linkedin size={20} /></button>
                        <button className="social-icon"><Github size={20} /></button>
                        <button className="social-icon"><Globe size={20} /></button>
                    </div>
                </div>

                <div className="profile-main-area">
                    <div className="profile-section glass-card">
                        <div className="section-header">
                            <h2>About Me</h2>
                        </div>
                        {isEditing ? (
                            <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." className="edit-textarea"></textarea>
                        ) : (
                            <p className="bio-text">
                                {viewedUser?.bio || `Professional ${viewedUser?.role} at ${viewedUser?.company || 'our institution'}.`}
                            </p>
                        )}
                    </div>

                    <div className="profile-grid">
                        <div className="profile-section glass-card">
                            <div className="section-header">
                                <h2>{viewedUser?.role === 'alumni' ? 'Experience' : 'Skills'}</h2>
                            </div>
                            {viewedUser?.role === 'alumni' ? (
                                <div className="experience-list">
                                    <div className="exp-item">
                                        <div className="exp-icon"><Briefcase size={20} /></div>
                                        <div className="exp-details">
                                            {isEditing ? (
                                                <>
                                                    <input type="text" name="position" value={formData.position} onChange={handleChange} placeholder="Position" />
                                                    <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Company" />
                                                </>
                                            ) : (
                                                <>
                                                    <h4>{viewedUser?.position || 'Update Position'}</h4>
                                                    <p>{viewedUser?.company || 'Update Company'}</p>
                                                </>
                                            )}
                                            <span>{viewedUser?.batch ? `Class of ${viewedUser.batch}` : 'Present'}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="skills-tags">
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={formData.skills.join(', ')} 
                                            onChange={handleSkillsChange} 
                                            placeholder="Skills (comma separated)" 
                                            className="edit-input-full"
                                        />
                                    ) : (
                                        skills.map((skill, i) => (
                                            <span key={i} className="skill-tag">{skill}</span>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="profile-section glass-card">
                            <div className="section-header">
                                <h2>Education</h2>
                            </div>
                            <div className="exp-item">
                                <div className="exp-icon"><GraduationCap size={20} /></div>
                                <div className="exp-details">
                                    {isEditing ? (
                                        <>
                                            <input type="text" name="institution" value={formData.institution} onChange={handleChange} placeholder="Institution Name" />
                                            <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="Department" />
                                            <input type="text" name="batch" value={formData.batch} onChange={handleChange} placeholder="Batch" />
                                        </>
                                    ) : (
                                        <>
                                            <h4>{viewedUser?.department || 'Set Department'}</h4>
                                            <p>{viewedUser?.institution || 'Lovely Professional University'}</p>
                                            <span>{viewedUser?.batch ? `Class of ${viewedUser.batch}` : 'Class of 2026'}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="profile-section glass-card">
                        <div className="section-header">
                            <h2>Portfolio & Links</h2>
                            {isEditing && (
                                <button onClick={addLink} className="btn btn-sm btn-outline">Add Link</button>
                            )}
                        </div>
                        <div className="links-grid">
                            {isEditing ? (
                                formData.links.map((link, index) => (
                                    <div key={index} className="link-card edit-link-card">
                                        <div className="edit-link-inputs">
                                            <input 
                                                type="text" 
                                                placeholder="Link Title" 
                                                value={link.title} 
                                                onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="URL (https://...)" 
                                                value={link.url} 
                                                onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                                            />
                                        </div>
                                        <button onClick={() => removeLink(index)} className="btn-remove">&times;</button>
                                    </div>
                                ))
                            ) : (
                                displayLinks.map((link, index) => (
                                    <div key={index} className="link-card">
                                        {link.type === 'resume' ? (
                                            <FileText size={24} color="var(--primary)" />
                                        ) : (
                                            <Award size={24} color="var(--secondary)" />
                                        )}
                                        <div>
                                            <h5>{link.title}</h5>
                                            <p>{link.url.substring(0, 30)}{link.url.length > 30 ? '...' : ''}</p>
                                        </div>
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">View</a>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Request Connection/Guidance Modal */}
            <AnimatePresence>
                {showRequestModal && (
                    <div className="modal-overlay">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card modal-card"
                        >
                            <div className="modal-header">
                                <h3>
                                    {currentUser.role === 'alumni' && viewedUser.role === 'alumni' ? 'Connect' : 'Request Guidance'} with {viewedUser.name}
                                </h3>
                                <button className="close-btn" onClick={() => setShowRequestModal(false)}><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSendRequest} className="post-job-form">
                                <div className="input-group">
                                    <label>
                                        {currentUser.role === 'alumni' && viewedUser.role === 'alumni' ? 'What would you like to connect about?' : 'What topic do you need guidance on?'}
                                    </label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={requestData.topic} 
                                        onChange={(e) => setRequestData({...requestData, topic: e.target.value})} 
                                        placeholder={currentUser.role === 'alumni' && viewedUser.role === 'alumni' ? 'e.g., Collaboration, Networking, Business' : 'e.g., Career Advice, Networking, Mentorship'} 
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Message</label>
                                    <textarea 
                                        required 
                                        value={requestData.message} 
                                        onChange={(e) => setRequestData({...requestData, message: e.target.value})} 
                                        placeholder={`Hi ${viewedUser.name}, I would love to connect with you...`} 
                                        rows="4"
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary w-full" disabled={saving}>
                                    <Send size={18} /> {saving ? 'Sending...' : 'Send Request'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
