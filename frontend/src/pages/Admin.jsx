import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    LayoutDashboard, 
    Users, 
    Briefcase, 
    Calendar, 
    Heart, 
    MessageSquare, 
    Star, 
    Settings, 
    Search, 
    Bell, 
    LogOut, 
    ChevronRight, 
    MoreVertical, 
    Trash2, 
    Check, 
    X, 
    UserCheck, 
    TrendingDown,
    TrendingUp,
    Shield,
    Share2,
    Trophy,
    RefreshCw,
    Menu as HamburgerIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const Admin = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEventModal, setShowEventModal] = useState(false);
    const [showJobModal, setShowJobModal] = useState(false);
    const [showStoryModal, setShowStoryModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [viewingAttendees, setViewingAttendees] = useState(null);
    const [viewingApplicants, setViewingApplicants] = useState(null);

    const [error, setError] = useState(null);

    const fetchData = async () => {
        if (user?.role !== 'admin') {
            setError('Access Denied: Admin credentials required.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const statsRes = await axios.get('http://localhost:5000/api/admin/stats');
            setStats(statsRes.data);
            loadTabData(activeTab);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to fetch dashboard data. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const loadTabData = async (tab) => {
        let endpoint = '';
        switch(tab) {
            case 'users': endpoint = 'users'; break;
            case 'jobs': endpoint = 'jobs'; break;
            case 'events': endpoint = 'events'; break;
            case 'donations': endpoint = 'donations'; break;
            case 'feedback': endpoint = 'feedback'; break;
            case 'stories': endpoint = 'stories'; break;
            case 'mentorship': endpoint = 'mentorship-requests'; break;
            case 'pending': endpoint = 'pending-users'; break;
            default: return;
        }

        try {
            const res = await axios.get(`http://localhost:5000/api/admin/${endpoint}`);
            setData(res.data);
        } catch (error) {
            console.error(`Error loading ${tab}:`, error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [activeTab, user]);

    const handleAction = async (method, endpoint, dataOrMsg, maybeMsg) => {
        setActionLoading(true);
        try {
            const isData = typeof dataOrMsg === 'object' && dataOrMsg !== null;
            const data = isData ? dataOrMsg : null;
            const successMsg = isData ? maybeMsg : dataOrMsg;

            if (method === 'post' || method === 'put' || method === 'patch') {
                await axios[method](`http://localhost:5000/api/admin/${endpoint}`, data);
            } else {
                await axios[method](`http://localhost:5000/api/admin/${endpoint}`);
            }
            fetchData();
            if (successMsg) console.log(successMsg);
        } catch (error) {
            console.error('Action failed:', error);
            alert('Action failed: ' + (error.response?.data?.message || 'Unknown error'));
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && !stats) return (
        <div className="admin-loading-screen">
            <div className="spinner-large"></div>
            <p>Initializing Secure Dashboard...</p>
        </div>
    );

    if (error && !stats) return (
        <div className="admin-error-screen">
            <X size={48} color="#ef4444" />
            <h2>System Error</h2>
            <p>{error}</p>
            <button className="btn-icon" onClick={fetchData} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
                <RefreshCw size={16} /> Retry
            </button>
        </div>
    );

    const filteredData = Array.isArray(data) ? data.filter(item => {
        // Filter by search term
        const searchStr = (item.name || item.title || item.label || '').toLowerCase();
        const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
        
        // Specific tab filtering
        if (activeTab === 'users') {
            return matchesSearch && (item.role === 'student' || item.role === 'alumni');
        }
        
        return matchesSearch;
    }) : [];

    return (
        <div className="admin-page">
            {/* Sidebar Drawer */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        <motion.div 
                            className="drawer-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDrawerOpen(false)}
                        />
                        <motion.aside 
                            className="admin-drawer"
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        >
                            <div className="drawer-header">
                                <span className="gradient-text">Elite</span>Admin
                                <button onClick={() => setIsDrawerOpen(false)}><X size={20} /></button>
                            </div>
                            
                            <nav className="drawer-nav">
                                <SidebarLink icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => {setActiveTab('dashboard'); setIsDrawerOpen(false);}} />
                                <SidebarLink icon={<Shield size={20} />} label="Admin Panel" active={activeTab === 'users'} onClick={() => {setActiveTab('users'); setIsDrawerOpen(false);}} />
                                <SidebarLink icon={<UserCheck size={20} />} label="Pending Approvals" active={activeTab === 'pending'} onClick={() => {setActiveTab('pending'); setIsDrawerOpen(false);}} />
                                <SidebarLink icon={<Share2 size={20} />} label="Networking Hub" active={activeTab === 'mentorship'} onClick={() => {setActiveTab('mentorship'); setIsDrawerOpen(false);}} />
                                <SidebarLink icon={<Briefcase size={20} />} label="Job Portal" active={activeTab === 'jobs'} onClick={() => {setActiveTab('jobs'); setIsDrawerOpen(false);}} />
                                <SidebarLink icon={<Heart size={20} />} label="Donations" active={activeTab === 'donations'} onClick={() => {setActiveTab('donations'); setIsDrawerOpen(false);}} />
                                <SidebarLink icon={<Calendar size={20} />} label="Events & Reunions" active={activeTab === 'events'} onClick={() => {setActiveTab('events'); setIsDrawerOpen(false);}} />
                                <SidebarLink icon={<Trophy size={20} />} label="Success Stories" active={activeTab === 'stories'} onClick={() => {setActiveTab('stories'); setIsDrawerOpen(false);}} />
                                <SidebarLink icon={<MessageSquare size={20} />} label="Feedback" active={activeTab === 'feedback'} onClick={() => {setActiveTab('feedback'); setIsDrawerOpen(false);}} />
                                <SidebarLink icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => {setActiveTab('settings'); setIsDrawerOpen(false);}} />
                            </nav>

                            <div className="drawer-footer">
                                <button className="sidebar-link danger" onClick={logout}>
                                    <LogOut size={20} /> <span>Sign Out</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="admin-main">
                {/* Topbar */}
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <button className="menu-toggle" onClick={() => setIsDrawerOpen(true)}>
                            <HamburgerIcon size={24} />
                        </button>
                        <div className="sidebar-brand-mini">
                            <span className="gradient-text">Elite</span>Admin
                        </div>
                        <div className="search-wrapper">
                            <Search className="search-icon" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="topbar-actions">
                        <button className="topbar-btn"><Bell size={20} /><span className="dot"></span></button>
                        <div className="admin-profile">
                            <div className="activity-avatar" style={{ background: 'var(--primary)', color: 'white' }}>{user?.name ? user.name.charAt(0) : 'A'}</div>
                            <div className="profile-info" style={{ marginLeft: '0.8rem' }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{user?.name || 'System Admin'}</p>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Admin'}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="dashboard">
                            {/* Stats Grid */}
                            <div className="stats-grid">
                                <StatCard 
                                    icon={<Users size={24} />} 
                                    label="Total Students" 
                                    value={stats?.studentCount} 
                                    color="#3b82f6" 
                                    trend="+12%" 
                                    up={true} 
                                />
                                <StatCard 
                                    icon={<Users size={24} />} 
                                    label="Total Alumni" 
                                    value={stats?.alumniCount} 
                                    color="#8b5cf6" 
                                    trend="+5%" 
                                    up={true} 
                                />
                                <StatCard 
                                    icon={<Briefcase size={24} />} 
                                    label="Active Jobs" 
                                    value={stats?.jobCount} 
                                    color="#10b981" 
                                    trend="+8%" 
                                    up={true} 
                                />
                                <StatCard 
                                    icon={<Heart size={24} />} 
                                    label="Donations" 
                                    value={`₹${(stats?.totalDonations || 0).toLocaleString()}`} 
                                    color="#ef4444" 
                                    trend="+22%" 
                                    up={true} 
                                />
                                <StatCard 
                                    icon={<Calendar size={24} />} 
                                    label="Active Events" 
                                    value={stats?.eventCount} 
                                    color="#10b981" 
                                />
                                <StatCard 
                                    icon={<Star size={24} />} 
                                    label="Collections" 
                                    value={`₹${(stats?.eventCollections || 0).toLocaleString()}`} 
                                    color="#f59e0b" 
                                />
                            </div>

                            <div className="dashboard-grid">
                                {/* Recent Activity */}
                                <div className="glass-panel">
                                    <div className="panel-header">
                                        <h3>Recent Activities</h3>
                                        <button className="topbar-btn"><MoreVertical size={18} /></button>
                                    </div>
                                    <div className="activity-list">
                                        {stats?.recentActivities?.users?.map(u => (
                                            <div key={u.id} className="activity-item">
                                                <div className="activity-avatar">{u.name ? u.name.charAt(0) : '?'}</div>
                                                <div className="activity-info">
                                                    <p><strong>{u.name || 'Unknown User'}</strong> registered as a <strong>{u.role}</strong></p>
                                                    <span>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Date N/A'} at {u.createdAt ? new Date(u.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time N/A'}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {stats?.recentActivities?.jobs?.map(j => (
                                            <div key={j.id} className="activity-item">
                                                <div className="activity-avatar" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><Briefcase size={16} /></div>
                                                <div className="activity-info">
                                                    <p>New job post: <strong>{j.title || 'Untitled'}</strong> at <strong>{j.company || 'Unknown Co.'}</strong></p>
                                                    <span>{j.createdAt ? new Date(j.createdAt).toLocaleDateString() : 'Date N/A'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Stats / Analytics Chart Mockup */}
                                <div className="glass-panel">
                                    <div className="panel-header">
                                        <h3>Portal Growth</h3>
                                        <TrendingUp size={18} color="#10b981" />
                                    </div>
                                    <div className="visual-chart" style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '10px', padding: '10px' }}>
                                        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                            <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--primary)', opacity: 0.3 + (i * 0.1), borderRadius: '4px' }}></div>
                                        ))}
                                    </div>
                                    <div className="chart-labels" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.7rem', color: '#64748b' }}>
                                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                    </div>
                                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                            <span>User Retention</span>
                                            <span style={{ color: '#10b981' }}>84%</span>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', height: '4px', borderRadius: '2px' }}>
                                            <div style={{ background: '#10b981', width: '84%', height: '100%', borderRadius: '2px' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={activeTab}>
                            <div className="panel-header">
                                <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}</h2>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    {activeTab === 'events' && (
                                        <button className="btn btn-primary btn-sm" onClick={() => setShowEventModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                            <Calendar size={14} /> Create Event
                                        </button>
                                    )}
                                    {activeTab === 'jobs' && (
                                        <button className="btn btn-primary btn-sm" onClick={() => setShowJobModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                            <Briefcase size={14} /> Create Job
                                        </button>
                                    )}
                                    {activeTab === 'stories' && (
                                        <button className="btn btn-primary btn-sm" onClick={() => setShowStoryModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                            <Trophy size={14} /> Create Story
                                        </button>
                                    )}
                                    <span className="badge-alert" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '8px', padding: '5px 12px' }}>
                                        {filteredData.length} records found
                                    </span>
                                    <button className="topbar-btn" onClick={() => fetchData()}><RefreshCw size={18} /></button>
                                </div>
                            </div>

                            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                {renderTableHeaders(activeTab)}
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredData.map(item => (
                                                <tr key={item.id}>
                                                    {renderTableRows(activeTab, item, handleAction)}
                                                    <td>
                                                        <div className="action-btns">
                                                            {renderCustomActions(activeTab, item, handleAction, setEditingItem, setShowReplyModal, setViewingAttendees, setViewingApplicants)}
                                                            <button className="btn-icon danger" onClick={() => handleAction('delete', `${activeTab === 'users' ? 'user' : activeTab === 'jobs' ? 'job' : activeTab === 'events' ? 'event' : activeTab}/${item.id}`, 'Removed successfully')}><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredData.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No records discovered in this sector.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Create Event Modal */}
                {showEventModal && (
                    <div className="admin-modal-overlay">
                        <motion.div className="admin-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <div className="modal-header">
                                <h3>Create New Event</h3>
                                <button onClick={() => setShowEventModal(false)}><X size={20} /></button>
                            </div>
                            <form className="modal-form" onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const eventData = Object.fromEntries(formData);
                                await handleAction('post', 'events', eventData, 'Event created');
                                setShowEventModal(false);
                            }}>
                                <div className="form-group">
                                    <label>Event Title</label>
                                    <input name="title" required placeholder="e.g. Annual Alumni Meet 2026" />
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Type</label>
                                        <select name="type">
                                            <option value="Meetup">Meetup</option>
                                            <option value="Webinar">Webinar</option>
                                            <option value="Workshop">Workshop</option>
                                            <option value="Conference">Conference</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Entry Fee (₹)</label>
                                        <input name="price" type="number" defaultValue="0" />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input name="date" type="date" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input name="location" required placeholder="Venue or Link" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea name="description" rows="3" required placeholder="What's this event about?"></textarea>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-ghost" onClick={() => setShowEventModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                                        {actionLoading ? <RefreshCw className="spinner" size={16} /> : 'Publish Event'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Create Job Modal */}
                {showJobModal && (
                    <div className="admin-modal-overlay">
                        <motion.div className="admin-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <div className="modal-header">
                                <h3>Post Career Opportunity</h3>
                                <button onClick={() => setShowJobModal(false)}><X size={20} /></button>
                            </div>
                            <form className="modal-form" onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const jobData = Object.fromEntries(formData);
                                await handleAction('post', 'jobs', jobData, 'Job posted');
                                setShowJobModal(false);
                            }}>
                                <div className="form-group">
                                    <label>Job Title</label>
                                    <input name="title" required placeholder="e.g. Senior Developer" />
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Company</label>
                                        <input name="company" required placeholder="Company Name" />
                                    </div>
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input name="location" required placeholder="Remote, NYC, etc." />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Job Type</label>
                                        <select name="type">
                                            <option value="Full-time">Full-time</option>
                                            <option value="Internship">Internship</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Part-time">Part-time</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Salary/Budget</label>
                                        <input name="salary" placeholder="e.g. $100k - $120k" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea name="description" rows="3" required placeholder="Job details..."></textarea>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-ghost" onClick={() => setShowJobModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                                        {actionLoading ? <RefreshCw className="spinner" size={16} /> : 'Post Job'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Create Success Story Modal */}
                {showStoryModal && (
                    <div className="admin-modal-overlay">
                        <motion.div className="admin-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <div className="modal-header">
                                <h3>Create Success Story</h3>
                                <button onClick={() => setShowStoryModal(false)}><X size={20} /></button>
                            </div>
                            <form className="modal-form" onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const storyData = Object.fromEntries(formData);
                                await handleAction('post', 'stories', storyData, 'Story published');
                                setShowStoryModal(false);
                            }}>
                                <div className="form-group">
                                    <label>Define Journey (Quote)</label>
                                    <textarea name="quote" rows="2" required placeholder="e.g. This portal helped me find my dream job..."></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Notable Achievement</label>
                                    <textarea name="achievement" rows="3" required placeholder="e.g. Promoted to VP within 3 years..."></textarea>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-ghost" onClick={() => setShowStoryModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                                        {actionLoading ? <RefreshCw className="spinner" size={16} /> : 'Publish Story'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Edit Modal (Universal) */}
                {editingItem && (
                    <div className="admin-modal-overlay">
                        <motion.div className="admin-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <div className="modal-header">
                                <h3>Edit {editingItem.type.charAt(0).toUpperCase() + editingItem.type.slice(1)}</h3>
                                <button onClick={() => setEditingItem(null)}><X size={20} /></button>
                            </div>
                            <form className="modal-form" onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const updateData = Object.fromEntries(formData);
                                await handleAction('put', `${editingItem.type === 'user' ? 'users' : editingItem.type === 'job' ? 'jobs' : editingItem.type === 'story' ? 'stories' : 'events'}/${editingItem.data.id}`, updateData, 'Updated successfully');
                                setEditingItem(null);
                            }}>
                                {editingItem.type === 'user' && (
                                    <>
                                        <div className="form-group"><label>Name</label><input name="name" defaultValue={editingItem.data.name} /></div>
                                        <div className="form-group"><label>Email</label><input name="email" defaultValue={editingItem.data.email} /></div>
                                        <div className="form-group"><label>Batch</label><input name="batch" defaultValue={editingItem.data.batch} /></div>
                                    </>
                                )}
                                {editingItem.type === 'job' && (
                                    <>
                                        <div className="form-group"><label>Job Title</label><input name="title" defaultValue={editingItem.data.title} /></div>
                                        <div className="form-group"><label>Company</label><input name="company" defaultValue={editingItem.data.company} /></div>
                                        <div className="form-group"><label>Location</label><input name="location" defaultValue={editingItem.data.location} /></div>
                                    </>
                                )}
                                {editingItem.type === 'story' && (
                                    <>
                                        <div className="form-group"><label>Quote</label><input name="quote" defaultValue={editingItem.data.quote} /></div>
                                        <div className="form-group"><label>Achievement</label><textarea name="achievement" defaultValue={editingItem.data.achievement} /></div>
                                    </>
                                )}
                                {editingItem.type === 'event' && (
                                    <>
                                        <div className="form-group"><label>Event Title</label><input name="title" defaultValue={editingItem.data.title} /></div>
                                        <div className="form-group"><label>Fee (₹)</label><input name="price" type="number" defaultValue={editingItem.data.price} /></div>
                                        <div className="form-group"><label>Location</label><input name="location" defaultValue={editingItem.data.location} /></div>
                                    </>
                                )}
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-ghost" onClick={() => setEditingItem(null)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Applicants List Modal */}
                {viewingApplicants && (
                    <div className="admin-modal-overlay">
                        <motion.div className="admin-modal modal-lg" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ maxWidth: '1000px' }}>
                            <div className="modal-header">
                                <div>
                                    <h3 style={{ margin: 0 }}>Applicants for: {viewingApplicants.job.title}</h3>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{viewingApplicants.applicants.length} candidates applied</p>
                                </div>
                                <button onClick={() => setViewingApplicants(null)}><X size={20} /></button>
                            </div>
                            
                            <div className="modal-table-wrapper" style={{ maxHeight: '500px', overflowY: 'auto', marginTop: '1rem' }}>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Applicant</th>
                                            <th>Resume / Details</th>
                                            <th>Applied On</th>
                                            <th>Status</th>
                                            <th>Manage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viewingApplicants.applicants.map((app) => (
                                            <tr key={app.id}>
                                                <td>
                                                    <strong>{app.name}</strong><br/>
                                                    <small>{app.email}</small><br/>
                                                    <small>{app.batch} / {app.department}</small>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                        {app.JobApplicants.resumePath ? (
                                                            <a href={`http://localhost:5000/${app.JobApplicants.resumePath}`} target="_blank" rel="noopener noreferrer" className="badge-alert" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', textDecoration: 'none', padding: '2px 8px', borderRadius: '4px' }}>
                                                                View Resume
                                                            </a>
                                                        ) : <span className="text-muted">No Resume</span>}
                                                        <button className="btn-icon" title={app.JobApplicants.details} onClick={() => alert(app.JobApplicants.details || 'No details provided')}>
                                                            <MessageSquare size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td>{new Date(app.JobApplicants.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`status-badge ${app.JobApplicants.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                                        {app.JobApplicants.status}
                                                    </span>
                                                    {app.JobApplicants.interviewDate && (
                                                        <div style={{ fontSize: '0.7rem', marginTop: '4px', color: '#10b981' }}>
                                                            Interview: {new Date(app.JobApplicants.interviewDate).toLocaleDateString()}
                                                            <span style={{ marginLeft: '5px', opacity: 0.8 }}>({app.JobApplicants.interviewType || 'TBD'})</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <form style={{ display: 'flex', gap: '5px' }} onSubmit={async (e) => {
                                                        e.preventDefault();
                                                        const formData = new FormData(e.target);
                                                        const update = Object.fromEntries(formData);
                                                        try {
                                                            await axios.patch(`http://localhost:5000/api/jobs/${viewingApplicants.job.id}/manage/${app.id}`, update);
                                                            // Update local state
                                                            const updatedApplicants = viewingApplicants.applicants.map(a => 
                                                                a.id === app.id ? { ...a, JobApplicants: { ...a.JobApplicants, ...update } } : a
                                                            );
                                                            setViewingApplicants({ ...viewingApplicants, applicants: updatedApplicants });
                                                            alert('Application updated');
                                                        } catch (err) {
                                                            console.error(err);
                                                            alert(`Update failed: ${err.response?.data?.error || err.response?.data?.message || err.message}`);
                                                        }
                                                    }}>
                                                        <select name="status" defaultValue={app.JobApplicants.status} style={{ fontSize: '0.75rem', padding: '2px' }}>
                                                            <option value="Pending">Pending</option>
                                                            <option value="Accepted">Accepted</option>
                                                            <option value="Rejected">Rejected</option>
                                                            <option value="Interview Scheduled">Interview Scheduled</option>
                                                        </select>
                                                        {app.JobApplicants.status === 'Interview Scheduled' && (
                                                            <>
                                                                <input name="interviewDate" type="date" defaultValue={app.JobApplicants.interviewDate?.split('T')[0]} style={{ fontSize: '0.75rem', padding: '2px', width: '90px' }} />
                                                                <select name="interviewType" defaultValue={app.JobApplicants.interviewType || 'Online'} style={{ fontSize: '0.75rem', padding: '2px' }}>
                                                                    <option value="Online">Online</option>
                                                                    <option value="Offline">Offline</option>
                                                                </select>
                                                            </>
                                                        )}
                                                        <button type="submit" className="btn-icon success"><Check size={14} /></button>
                                                    </form>
                                                </td>
                                            </tr>
                                        ))}
                                        {viewingApplicants.applicants.length === 0 && (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No applications received yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="modal-actions" style={{ marginTop: '1rem' }}>
                                <button className="btn btn-ghost" onClick={() => setViewingApplicants(null)}>Close</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Feedback Reply Modal */}
                {showReplyModal && (
                    <div className="admin-modal-overlay">
                        <motion.div className="admin-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <div className="modal-header">
                                <h3>Reply to Feedback</h3>
                                <button onClick={() => setShowReplyModal(false)}><X size={20} /></button>
                            </div>
                            <div className="original-message" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>From: {showReplyModal.name}</p>
                                <p style={{ fontSize: '0.9rem' }}>"{showReplyModal.message}"</p>
                            </div>
                            <form className="modal-form" onSubmit={async (e) => {
                                e.preventDefault();
                                const adminResponse = e.target.adminResponse.value;
                                await handleAction('put', `feedback/${showReplyModal.id}`, { adminResponse, status: 'Resolved' }, 'Reply sent');
                                setShowReplyModal(false);
                            }}>
                                <div className="form-group">
                                    <label>Your Response</label>
                                    <textarea name="adminResponse" rows="4" required placeholder="Type your reply here..."></textarea>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-ghost" onClick={() => setShowReplyModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Send Reply</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Attendee List Modal */}
                {viewingAttendees && (
                    <div className="admin-modal-overlay">
                        <motion.div className="admin-modal modal-lg" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ maxWidth: '900px' }}>
                            <div className="modal-header">
                                <h3>Attendees for: {viewingAttendees.title}</h3>
                                <button onClick={() => setViewingAttendees(null)}><X size={20} /></button>
                            </div>
                            <div className="attendee-stats mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div className="glass-card p-3 text-center">
                                    <p style={{fontSize: '0.8rem', color: '#64748b', marginBottom: '0.3rem'}}>Total Registered</p>
                                    <h4 style={{margin: 0}}>{viewingAttendees.attendees?.length || 0}</h4>
                                </div>
                                <div className="glass-card p-3 text-center">
                                    <p style={{fontSize: '0.8rem', color: '#64748b', marginBottom: '0.3rem'}}>Total Revenue</p>
                                    <h4 style={{margin: 0, color: '#10b981'}}>₹{((viewingAttendees.attendees?.length || 0) * (viewingAttendees.price || 0)).toLocaleString()}</h4>
                                </div>
                                <div className="glass-card p-3 text-center">
                                    <p style={{fontSize: '0.8rem', color: '#64748b', marginBottom: '0.3rem'}}>Event Type</p>
                                    <h4 style={{margin: 0}}>{viewingAttendees.type}</h4>
                                </div>
                            </div>
                            <div className="modal-table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Attendee</th>
                                            <th>Reg. No / Batch</th>
                                            <th>Status</th>
                                            <th>Dietary</th>
                                            <th>Payment</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viewingAttendees.attendees?.map((att, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <div className="activity-item">
                                                        <div className="activity-avatar">{att.name?.charAt(0)}</div>
                                                        <div>
                                                            <strong>{att.name}</strong><br/>
                                                            <small>{att.email}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    {att.EventAttendees?.regNo || 'N/A'}<br/>
                                                    <small>{att.EventAttendees?.batch || 'N/A'}</small>
                                                </td>
                                                <td><span className="role-pill student">{att.EventAttendees?.jobStatus || 'N/A'}</span></td>
                                                <td>{att.EventAttendees?.dietary || 'None'}</td>
                                                <td><span style={{ color: '#10b981', fontWeight: 600 }}>PAID</span><br/><small>{att.EventAttendees?.paymentMethod?.toUpperCase()}</small></td>
                                            </tr>
                                        ))}
                                        {(!viewingAttendees.attendees || viewingAttendees.attendees.length === 0) && (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No attendees registered yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="modal-actions">
                                <button className="btn btn-outline" onClick={() => setViewingAttendees(null)}>Close</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </main>
        </div>
    );
};

// Helper Components
const SidebarLink = ({ icon, label, active, onClick, badge }) => (
    <button className={`sidebar-link ${active ? 'active' : ''}`} onClick={onClick}>
        {icon} <span>{label}</span>
        {badge > 0 && <span className="badge-alert">{badge}</span>}
    </button>
);

const StatCard = ({ icon, label, value, color, trend, up }) => (
    <div className="stat-card">
        <div className="stat-main">
            <div className="stat-icon" style={{ background: `${color}1A`, color }}>{icon}</div>
            <div className={`stat-trend ${up ? 'up' : 'down'}`}>
                {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {trend}
            </div>
        </div>
        <div className="stat-data">
            <h3>{value}</h3>
            <p>{label}</p>
        </div>
    </div>
);

// Table Render Helpers
const renderTableHeaders = (tab) => {
    switch(tab) {
        case 'users': 
        case 'pending':
            return <><th>Name</th><th>Email</th><th>Role</th><th>Batch/Dept</th></>;
        case 'jobs': return <><th>Title</th><th>Company</th><th>Posted By</th><th>Date</th></>;
        case 'donations': return <><th>Donor</th><th>Fund Type</th><th>Amount</th><th>Status</th></>;
        case 'feedback': return <><th>From</th><th>Type</th><th>Message</th><th>Status</th></>;
        case 'stories': return <><th>Author</th><th>Quote</th><th>Achievement</th><th>Published</th></>;
        case 'mentorship': return <><th>Student</th><th>Mentor</th><th>Topic</th><th>Status</th></>;
        case 'events': return <><th>Event Title</th><th>Type</th><th>Date</th><th>Fee</th><th>Reg.</th></>;
        default: return <th>Item</th>;
    }
};

const renderTableRows = (tab, item, handleAction) => {
    switch(tab) {
        case 'users':
        case 'pending':
            return (
                <>
                    <td><div className="activity-item"><div className="activity-avatar">{item.name ? item.name.charAt(0) : '?'}</div>{item.name || 'Anonymous'}</div></td>
                    <td>{item.email}</td>
                    <td><span className={`role-pill ${item.role}`}>{item.role}</span></td>
                    <td>{item.batch || 'N/A'} / {item.department || 'N/A'}</td>
                </>
            );
        case 'jobs':
            return (
                <>
                    <td><strong>{item.title}</strong></td>
                    <td>{item.company}</td>
                    <td>{item.poster?.name || 'User'}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                </>
            );
        case 'donations':
            return (
                <>
                    <td>{item.donor?.name || 'Anonymous'}</td>
                    <td>{item.fundType}</td>
                    <td>₹{parseFloat(item.amount).toLocaleString()}</td>
                    <td><span className={`status-badge ${item.status?.toLowerCase()}`}>{item.status}</span></td>
                </>
            );
        case 'feedback':
            return (
                <>
                    <td>{item.name}<br/><span style={{fontSize: '0.7rem', color: '#64748b'}}>{item.email}</span></td>
                    <td><span className="role-pill student">{item.type}</span></td>
                    <td><p style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={item.message}>{item.message}</p></td>
                    <td><span className={`status-badge ${item.status?.toLowerCase()}`}>{item.status}</span></td>
                </>
            );
        case 'stories':
            return (
                <>
                    <td>{item.author?.name || item.name}</td>
                    <td><p style={{maxWidth: '200px'}}>{item.quote}</p></td>
                    <td><p style={{maxWidth: '200px'}}>{item.achievement}</p></td>
                    <td>{item.isPublished ? 'Yes' : 'No'}</td>
                </>
            );
        case 'mentorship':
            return (
                <>
                    <td>{item.student?.name}</td>
                    <td>{item.mentor?.name}</td>
                    <td>{item.subject || 'Career Guidance'}</td>
                    <td><span className={`status-badge ${item.status?.toLowerCase()}`}>{item.status}</span></td>
                </>
            );
        case 'events':
            return (
                <>
                    <td><strong>{item.title}</strong><br /><small style={{ color: '#64748b' }}>{item.location}</small></td>
                    <td><span className="role-pill student">{item.type}</span></td>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                    <td>₹{item.price || 0}</td>
                    <td>{item.attendees?.length || 0} Reg.</td>
                </>
            );
        default: return <td>{item.id}</td>;
    }
};

const renderCustomActions = (tab, item, handleAction, setEditingItem, setShowReplyModal, setViewingAttendees, setViewingApplicants) => {
    switch(tab) {
        case 'pending':
            return <button className="btn-icon success" onClick={() => handleAction('put', `users/approve/${item.id}`, 'User approved')}><UserCheck size={16} title="Approve" /></button>;
        case 'users':
            return <button className="btn-icon edit" onClick={() => setEditingItem({ type: 'user', data: item })}><Settings size={16} title="Edit User" /></button>;
        case 'jobs':
            return (
                <>
                    <button className="btn-icon success" onClick={async () => {
                        try {
                            const res = await axios.get(`http://localhost:5000/api/jobs/${item.id}/applicants`);
                            setViewingApplicants({ job: item, applicants: res.data });
                        } catch (err) {
                            console.error(err);
                            alert(`Failed to load applicants: ${err.response?.data?.error || err.response?.data?.message || err.message}`);
                        }
                    }}><Users size={16} title="View Applicants" /></button>
                    <button className="btn-icon edit" onClick={() => setEditingItem({ type: 'job', data: item })}><Settings size={16} title="Edit Job" /></button>
                </>
            );
        case 'events':
            return (
                <>
                    <button className="btn-icon edit" onClick={() => setViewingAttendees(item)}><Users size={16} title="View Attendees" /></button>
                    <button className="btn-icon edit" onClick={() => setEditingItem({ type: 'event', data: item })}><Settings size={16} title="Edit Event" /></button>
                </>
            );
        case 'stories':
            return (
                <>
                    {!item.isPublished && <button className="btn-icon success" onClick={() => handleAction('put', `stories/approve/${item.id}`, 'Story published')}><Check size={16} title="Approve" /></button>}
                    <button className="btn-icon edit" onClick={() => setEditingItem({ type: 'story', data: item })}><Settings size={16} title="Edit Story" /></button>
                </>
            );
        case 'feedback':
            return (
                <>
                    {item.status === 'New' && <button className="btn-icon success" onClick={() => handleAction('put', `feedback/${item.id}`, {status: 'Reviewed'})}><Check size={16} title="Mark Reviewed" /></button>}
                    <button className="btn-icon edit" onClick={() => setShowReplyModal(item)}><MessageSquare size={16} title="Reply" /></button>
                </>
            );
        default: return null;
    }
};

export default Admin;
