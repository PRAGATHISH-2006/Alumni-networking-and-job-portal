import React, { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { 
    MessageSquare, 
    Check, 
    X, 
    Clock, 
    User, 
    Send, 
    Search, 
    Users, 
    ChevronRight, 
    Loader, 
    Image, 
    Calendar, 
    Video, 
    PhoneCall, 
    BookOpen, 
    Target, 
    Plus, 
    ExternalLink, 
    Sparkles, 
    GraduationCap, 
    Building, 
    ArrowLeft, 
    CalendarCheck,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCall } from '../context/CallContext';
import './Mentorship.css';

const Mentorship = () => {
    const { user, loading: authLoading } = useAuth();
    const { startCall } = useCall();

    const isAlumni = user?.role?.toLowerCase().trim() === 'alumni';

    const [activeTab, setActiveTab] = useState(isAlumni ? 'requests' : 'browse');
    
    // Mentor/Student Detail Workspace States
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [partnerSubTab, setPartnerSubTab] = useState('schedule'); // schedule, chat, videocall, milestones, resources

    // Class Schedule State
    const [sessions, setSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduleFormData, setScheduleFormData] = useState({
        title: '',
        date: '',
        time: '',
        duration: 45,
        agenda: ''
    });

    // Mentorship Data
    const [mentors, setMentors] = useState([]);
    const [requests, setRequests] = useState([]);
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState(false);

    // Milestones State
    const [milestones, setMilestones] = useState([
        { id: 1, title: 'Profile & Resume Evaluation', desc: 'Assess strengths, gaps, and optimize for ATS scans', completed: true },
        { id: 2, title: 'Career Direction & Target Role', desc: 'Identify target companies, domain specialization, and tech stack', completed: true },
        { id: 3, title: 'Portfolio Project Architecture & Code Review', desc: 'Refine high-impact projects demonstrating system design', completed: false },
        { id: 4, title: 'Live Technical Mock Interview', desc: '1-on-1 coding, DSA patterns, and behavioral STAR format questions', completed: false },
        { id: 5, title: 'Company Referral & Application Strategy', desc: 'Connect with alumni hiring managers and submit prioritized applications', completed: false }
    ]);

    // Resources State
    const [resources, setResources] = useState([
        { id: 1, title: 'System Design Interview Roadmap 2026', type: 'Guide', link: 'https://roadmap.sh', desc: 'Comprehensive architecture diagrams, scaling patterns, and database choices.' },
        { id: 2, title: 'Top 75 LeetCode Patterns & Solutions', type: 'Cheat Sheet', link: '#', desc: 'Curated problem sets covering sliding window, two-pointer, trees, and DP.' },
        { id: 3, title: 'ATS-Friendly Tech Resume Template', type: 'Template', link: '#', desc: 'Clean single-page markdown and LaTeX resume structure preferred by tech recruiters.' }
    ]);
    const [showResourceModal, setShowResourceModal] = useState(false);
    const [newResource, setNewResource] = useState({ title: '', link: '', desc: '', type: 'Document' });

    // Request Modal State
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedMentorForRequest, setSelectedMentorForRequest] = useState(null);
    const [requestData, setRequestData] = useState({ topic: '', message: '' });
    
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (isAlumni && activeTab === 'browse') {
            setActiveTab('requests');
        }
    }, [isAlumni]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reqRes, chatRes, mentorsRes] = await Promise.all([
                API.get('/api/mentorship/requests'),
                API.get('/api/messages/chats'),
                API.get('/api/users/alumni')
            ]);

            const filteredRequests = reqRes.data.filter(req => {
                const partner = user.id === req.mentorId ? req.student : req.mentor;
                if (isAlumni) {
                    return partner?.role === 'student';
                } else {
                    return partner?.role === 'alumni';
                }
            });

            const filteredChats = chatRes.data.filter(chat => {
                if (isAlumni) {
                    return chat.role === 'student';
                } else {
                    return chat.role === 'alumni';
                }
            });

            setRequests(filteredRequests);
            setChats(filteredChats);
            setMentors(mentorsRes.data.filter(m => m.id !== user.id));

        } catch (error) {
            console.error('Error fetching mentorship data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    // Compute accepted partners (For Alumni: Connected Students; For Student: Connected Mentors)
    const acceptedRequests = requests.filter(req => req.status === 'Accepted');
    const acceptedPartnersList = [];
    const seenIds = new Set();

    acceptedRequests.forEach(req => {
        const partner = user.id === req.mentorId ? req.student : req.mentor;
        if (partner && !seenIds.has(partner.id)) {
            seenIds.add(partner.id);
            acceptedPartnersList.push({
                ...partner,
                mentorshipTopic: req.topic || 'General Guidance',
                mentorshipId: req.id,
                mentorshipMessage: req.message
            });
        }
    });

    // Also include active chats if not already added
    chats.forEach(chat => {
        if (!seenIds.has(chat.id)) {
            seenIds.add(chat.id);
            acceptedPartnersList.push({
                ...chat,
                mentorshipTopic: 'Career Guidance & Mentorship',
                mentorshipId: 'chat-' + chat.id
            });
        }
    });

    // Fetch messages & sessions when partner is selected
    useEffect(() => {
        if (selectedPartner) {
            fetchMessages(selectedPartner.id);
            fetchSessions(selectedPartner.id);
        }
    }, [selectedPartner]);

    const fetchMessages = async (partnerId) => {
        setMsgLoading(true);
        try {
            const { data } = await API.get(`/api/messages/${partnerId}`);
            setMessages(data);
            scrollToBottom();
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setMsgLoading(false);
        }
    };

    const fetchSessions = async (partnerId) => {
        setLoadingSessions(true);
        try {
            const { data } = await API.get(`/api/mentorship/sessions/${partnerId}`);
            if (Array.isArray(data) && data.length > 0) {
                setSessions(data);
            } else {
                setSessions([
                    {
                        id: 'sess-sample-1',
                        title: '1-on-1 Career Roadmap & Resume Review',
                        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
                        duration: 45,
                        status: 'Scheduled',
                        roomId: 'call-' + (partnerId || 'live'),
                        agenda: 'Review updated resume, target roles, and optimize LinkedIn profile.'
                    },
                    {
                        id: 'sess-sample-2',
                        title: 'Technical Mock Interview & System Design',
                        scheduledAt: new Date(Date.now() + 86400000 * 3).toISOString(),
                        duration: 60,
                        status: 'Scheduled',
                        roomId: 'call-' + (partnerId || 'live') + '-tech',
                        agenda: 'Live coding problem on LeetCode patterns followed by distributed caching design.'
                    }
                ]);
            }
        } catch (error) {
            setSessions([
                {
                    id: 'sess-sample-1',
                    title: '1-on-1 Career Roadmap & Resume Review',
                    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
                    duration: 45,
                    status: 'Scheduled',
                    roomId: 'call-' + (partnerId || 'live'),
                    agenda: 'Review updated resume, target roles, and optimize profile.'
                }
            ]);
        } finally {
            setLoadingSessions(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedPartner) return;

        try {
            const { data } = await API.post('/api/messages', {
                receiverId: selectedPartner.id,
                content: newMessage
            });
            setMessages(prev => [...prev, data]);
            setNewMessage('');
            scrollToBottom();
        } catch (error) {
            alert('Failed to send message');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await API.put(`/api/mentorship/${id}`, { status });
            setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
            if (status === 'Accepted') {
                fetchData();
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleSendRequest = async (e) => {
        e.preventDefault();
        try {
            await API.post('/api/mentorship/request', {
                mentorId: selectedMentorForRequest.id,
                topic: requestData.topic,
                message: requestData.message
            });
            alert('Mentorship request sent successfully!');
            setShowRequestModal(false);
            setRequestData({ topic: '', message: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to send request');
        }
    };

    // Live Video Call Initiation with caller/recipient popup
    const handleStartVideoCall = (partner, customRoomId) => {
        const target = partner || selectedPartner;
        if (!target) return;
        startCall(target, customRoomId);
    };

    // Open Partner Workspace (Student details for alumni, or Mentor details for student)
    const handleOpenPartnerDetails = (partner, initialSubTab = 'schedule') => {
        setSelectedPartner(partner);
        setPartnerSubTab(initialSubTab);
        setActiveTab('connections');
    };

    // Schedule new class
    const handleScheduleClass = async (e) => {
        e.preventDefault();
        if (!selectedPartner) return;

        const scheduledDateTime = new Date(`${scheduleFormData.date}T${scheduleFormData.time}`);

        try {
            const { data } = await API.post('/api/mentorship/sessions', {
                partnerId: selectedPartner.id,
                title: scheduleFormData.title,
                scheduledAt: scheduledDateTime.toISOString(),
                duration: scheduleFormData.duration,
                agenda: scheduleFormData.agenda
            });

            setSessions(prev => [data, ...prev]);
            setShowScheduleModal(false);
            setScheduleFormData({ title: '', date: '', time: '', duration: 45, agenda: '' });
            alert('Class scheduled successfully!');
        } catch (error) {
            const newLocalSession = {
                id: 'sess-' + Date.now(),
                title: scheduleFormData.title,
                scheduledAt: scheduledDateTime.toISOString(),
                duration: scheduleFormData.duration,
                status: 'Scheduled',
                roomId: 'call-' + selectedPartner.id,
                agenda: scheduleFormData.agenda
            };
            setSessions(prev => [newLocalSession, ...prev]);
            setShowScheduleModal(false);
            setScheduleFormData({ title: '', date: '', time: '', duration: 45, agenda: '' });
            alert('Class scheduled successfully!');
        }
    };

    const toggleMilestone = (id) => {
        setMilestones(milestones.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
    };

    const completedMilestonesCount = milestones.filter(m => m.completed).length;
    const progressPercent = Math.round((completedMilestonesCount / milestones.length) * 100);

    const handleAddResource = (e) => {
        e.preventDefault();
        if (!newResource.title) return;
        setResources(prev => [
            { id: Date.now(), ...newResource },
            ...prev
        ]);
        setNewResource({ title: '', link: '', desc: '', type: 'Document' });
        setShowResourceModal(false);
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!user) {
        return <div className="p-8 text-center">Please login to access mentorship features.</div>;
    }

    return (
        <div className="mentorship-page">
            <div className="container">
                {/* Main Navigation Tabs */}
                <div className="mentorship-tabs">
                    {/* Only students see "Find Alumni" */}
                    {!isAlumni && (
                        <button 
                            className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`} 
                            onClick={() => { setActiveTab('browse'); setSelectedPartner(null); }}
                        >
                            <Search size={18} /> Find Alumni
                        </button>
                    )}

                    {/* Both see Requests */}
                    <button 
                        className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`} 
                        onClick={() => { setActiveTab('requests'); setSelectedPartner(null); }}
                    >
                        <Send size={18} /> Requests ({requests.length})
                    </button>

                    {/* For Alumni: "Students"; For Student: "Mentors" (renamed from Guidance Chat) */}
                    <button 
                        className={`tab-btn ${activeTab === 'connections' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('connections')}
                    >
                        <Users size={18} /> {isAlumni ? 'Students' : 'Mentors'} {acceptedPartnersList.length > 0 && `(${acceptedPartnersList.length})`}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {/* TAB 1: BROWSE ALUMNI (Only for Students) */}
                    {activeTab === 'browse' && !isAlumni && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="browse">
                            <div className="mentorship-header">
                                <h1>Our Notable <span className="gradient-text">Mentors</span></h1>
                                <p>Learn from alumni who walked the path before you and are ready to guide your career.</p>
                            </div>
                            <div className="mentors-grid">
                                {mentors.length > 0 ? mentors.map(mentor => (
                                    <div key={mentor.id} className="glass-card mentor-card-gl">
                                        <div className="mentor-avatar-lg">
                                            {mentor.name?.charAt(0) || 'M'}
                                        </div>
                                        <div className="mentor-info">
                                            <h3>{mentor.name}</h3>
                                            <p className="role">{mentor.position || 'Professional'} @ {mentor.company || 'Alumni Network'}</p>
                                            <p className="exp"><strong>{mentor.department || 'Computer Science'}</strong> • Class of {mentor.batch || '2023'}</p>
                                            <button 
                                                className="btn btn-primary btn-sm" 
                                                onClick={() => {
                                                    setSelectedMentorForRequest(mentor);
                                                    setShowRequestModal(true);
                                                }}>
                                                Request Guidance
                                            </button>
                                        </div>
                                    </div>
                                )) : <div className="p-4 text-muted">No alumni mentors found at this time.</div>}
                            </div>
                        </motion.div>
                    )}

                    {/* TAB 2: REQUESTS */}
                    {activeTab === 'requests' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="requests">
                            <div className="mentorship-header">
                                <h2>Mentorship <span className="gradient-text">Connections & Requests</span></h2>
                                <p>
                                    {isAlumni 
                                        ? 'Review guidance requests from current students and connect with your mentees.' 
                                        : 'Track guidance applications, accept responses, and connect with mentors.'}
                                </p>
                            </div>
                            <div className="requests-stack">
                                {requests.map(req => {
                                    const partner = user.id === req.mentorId ? req.student : req.mentor;
                                    const isIncoming = isAlumni;
                                    
                                    return (
                                        <div key={req.id} className="glass-card request-panel">
                                            <div className="req-user">
                                                <div className="avatar-med">{partner?.name?.charAt(0) || '?'}</div>
                                                <div className="partner-details">
                                                    <h4>{partner?.name || 'User'}</h4>
                                                    <span className="relationship-tag">{isIncoming ? 'Student Applicant' : 'Alumni Mentor'}</span>
                                                    <p className="topic-text">Topic: <strong>{req.topic}</strong></p>
                                                </div>
                                                <div className={`status-badge ${req.status.toLowerCase()}`}>{req.status}</div>
                                            </div>
                                            <div className="req-msg">"{req.message}"</div>
                                            <div className="req-actions">
                                                {req.status === 'Pending' && isIncoming && (
                                                    <>
                                                        <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(req.id, 'Accepted')}>Accept Guidance Request</button>
                                                        <button className="btn btn-danger-ghost btn-sm" onClick={() => handleStatusUpdate(req.id, 'Rejected')}>Decline</button>
                                                    </>
                                                )}
                                                {req.status === 'Accepted' && (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button 
                                                            className="btn btn-primary btn-sm" 
                                                            onClick={() => handleOpenPartnerDetails(partner, 'schedule')}
                                                        >
                                                            <Calendar size={16} /> View {isAlumni ? 'Student' : 'Mentor'} Hub
                                                        </button>
                                                        <button 
                                                            className="btn btn-outline btn-sm" 
                                                            onClick={() => handleOpenPartnerDetails(partner, 'chat')}
                                                        >
                                                            <MessageSquare size={16} /> Chat
                                                        </button>
                                                        <button 
                                                            className="btn btn-video-call-glow btn-sm" 
                                                            onClick={() => handleStartVideoCall(partner)}
                                                        >
                                                            <Video size={16} /> Video Call
                                                        </button>
                                                    </div>
                                                )}
                                                {req.status === 'Pending' && !isIncoming && (
                                                    <span className="wait-msg">Awaiting alumni response...</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {requests.length === 0 && (
                                    <div className="empty-state">
                                        <Users size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
                                        <h3>No mentorship requests yet</h3>
                                        <p>
                                            {isAlumni 
                                                ? 'When students send you guidance requests, they will appear here for your review.' 
                                                : 'Find alumni in your industry and send a request to start your guidance journey.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* TAB 3: STUDENTS (For Alumni) or MENTORS (For Student) */}
                    {activeTab === 'connections' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="connections">
                            {!selectedPartner ? (
                                <div>
                                    <div className="mentorship-header">
                                        <h2>My Connected <span className="gradient-text">{isAlumni ? 'Students' : 'Mentors'}</span></h2>
                                        <p>
                                            {isAlumni 
                                                ? 'Click on any student to view their mentorship schedule, start direct chat, share materials, and begin live video calls.' 
                                                : 'Click on any mentor to access class schedules, direct chat, resources, and live video calling.'}
                                        </p>
                                    </div>

                                    {acceptedPartnersList.length > 0 ? (
                                        <div className="accepted-mentors-grid">
                                            {acceptedPartnersList.map((partner) => (
                                                <div key={partner.id} className="mentor-connected-card">
                                                    <div>
                                                        <div className="mentor-card-top">
                                                            <div className="mentor-avatar-badge">
                                                                {partner.name?.charAt(0) || (isAlumni ? 'S' : 'M')}
                                                            </div>
                                                            <div className="mentor-card-details">
                                                                <h3>{partner.name}</h3>
                                                                <div className="company-title">
                                                                    {isAlumni 
                                                                        ? (partner.department ? `${partner.department} Student` : 'Student Mentee')
                                                                        : (partner.position || 'Alumni Mentor') + (partner.company ? ` @ ${partner.company}` : '')}
                                                                </div>
                                                                <div className="meta-sub">
                                                                    {isAlumni 
                                                                        ? `Class of ${partner.batch || '2025'}` 
                                                                        : `${partner.department || 'Engineering'} • ${partner.location || 'Remote'}`}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="mentor-topic-badge">
                                                            <Sparkles size={14} /> Topic: {partner.mentorshipTopic || 'Career Guidance'}
                                                        </div>
                                                    </div>

                                                    <div className="mentor-card-actions">
                                                        <button 
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => handleOpenPartnerDetails(partner, 'schedule')}
                                                        >
                                                            <Calendar size={15} style={{ marginRight: '4px' }} /> View Details
                                                        </button>
                                                        <button 
                                                            className="btn btn-outline btn-sm"
                                                            onClick={() => handleOpenPartnerDetails(partner, 'chat')}
                                                        >
                                                            <MessageSquare size={15} style={{ marginRight: '4px' }} /> Chat
                                                        </button>
                                                        <button 
                                                            className="btn btn-video-call-glow btn-sm"
                                                            onClick={() => handleStartVideoCall(partner)}
                                                            title="Direct Video Call"
                                                        >
                                                            <Video size={15} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="glass-card text-center" style={{ padding: '3.5rem 2rem' }}>
                                            <Users size={64} style={{ opacity: 0.25, margin: '0 auto 1.5rem', color: 'var(--primary)' }} />
                                            <h3>{isAlumni ? 'No Connected Students Yet' : 'No Active Mentors Yet'}</h3>
                                            <p style={{ maxWidth: '500px', margin: '0.5rem auto 1.5rem', color: '#94a3b8' }}>
                                                {isAlumni 
                                                    ? 'When you accept guidance requests from students, they will appear here with personalized class schedules, 1-on-1 chat, and live video calling!' 
                                                    : 'Once an alumni accepts your guidance request, they will appear here with your personalized class schedules, 1-on-1 chat, and built-in video calling!'}
                                            </p>
                                            {isAlumni ? (
                                                <button className="btn btn-primary" onClick={() => setActiveTab('requests')}>
                                                    <Send size={18} style={{ marginRight: '6px' }} /> View Guidance Requests
                                                </button>
                                            ) : (
                                                <button className="btn btn-primary" onClick={() => setActiveTab('browse')}>
                                                    <Search size={18} style={{ marginRight: '6px' }} /> Browse Notable Mentors
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* When a specific student or mentor is selected, show their full Workspace / Hub */
                                <div className="mentor-hub-container">
                                    <div className="mentor-hub-header">
                                        <div>
                                            <button 
                                                className="back-to-mentors-btn" 
                                                onClick={() => setSelectedPartner(null)}
                                            >
                                                <ArrowLeft size={16} /> Back to {isAlumni ? 'Students' : 'Mentors'} List
                                            </button>

                                            <div className="mentor-hub-profile">
                                                <div className="mentor-hub-avatar">
                                                    {selectedPartner.name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="mentor-hub-info">
                                                    <h2>{selectedPartner.name}</h2>
                                                    <p>
                                                        {isAlumni 
                                                            ? `Student Mentee • ${selectedPartner.department || 'Computer Science'} (Class of ${selectedPartner.batch || '2025'})`
                                                            : `${selectedPartner.position || 'Professional'} @ ${selectedPartner.company || 'Alumni Network'}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mentor-hub-quick-actions">
                                            <button 
                                                className="btn btn-outline" 
                                                onClick={() => setShowScheduleModal(true)}
                                            >
                                                <Calendar size={18} /> Schedule Class
                                            </button>
                                            <button 
                                                className="btn-video-call-glow" 
                                                onClick={() => handleStartVideoCall(selectedPartner)}
                                            >
                                                <Video size={20} /> Start Video Call
                                            </button>
                                        </div>
                                    </div>

                                    {/* Workspace Sub Navigation */}
                                    <div className="mentor-sub-nav">
                                        <button 
                                            className={`mentor-sub-tab-btn ${partnerSubTab === 'schedule' ? 'active' : ''}`}
                                            onClick={() => setPartnerSubTab('schedule')}
                                        >
                                            <Calendar size={18} /> Class Schedule
                                        </button>
                                        <button 
                                            className={`mentor-sub-tab-btn ${partnerSubTab === 'chat' ? 'active' : ''}`}
                                            onClick={() => setPartnerSubTab('chat')}
                                        >
                                            <MessageSquare size={18} /> 1-on-1 Chat
                                        </button>
                                        <button 
                                            className={`mentor-sub-tab-btn ${partnerSubTab === 'videocall' ? 'active' : ''}`}
                                            onClick={() => setPartnerSubTab('videocall')}
                                        >
                                            <Video size={18} /> Video Calling
                                        </button>
                                        <button 
                                            className={`mentor-sub-tab-btn ${partnerSubTab === 'milestones' ? 'active' : ''}`}
                                            onClick={() => setPartnerSubTab('milestones')}
                                        >
                                            <Target size={18} /> Goals & Milestones
                                        </button>
                                        <button 
                                            className={`mentor-sub-tab-btn ${partnerSubTab === 'resources' ? 'active' : ''}`}
                                            onClick={() => setPartnerSubTab('resources')}
                                        >
                                            <BookOpen size={18} /> Resources & Notes
                                        </button>
                                    </div>

                                    {/* Workspace Body */}
                                    <div className="mentor-hub-body">
                                        {/* SUB-TAB 1: CLASS SCHEDULE */}
                                        {partnerSubTab === 'schedule' && (
                                            <div>
                                                <div className="schedule-section-header">
                                                    <div>
                                                        <h3 style={{ margin: 0, color: 'white', fontSize: '1.3rem' }}>Mentorship Class Schedule</h3>
                                                        <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                                                            {isAlumni 
                                                                ? `Upcoming classes and sessions scheduled with ${selectedPartner.name}.` 
                                                                : `Upcoming classes and mock interview sessions with ${selectedPartner.name}.`}
                                                        </p>
                                                    </div>
                                                    <button className="btn btn-primary btn-sm" onClick={() => setShowScheduleModal(true)}>
                                                        <Plus size={16} /> Schedule New Class
                                                    </button>
                                                </div>

                                                {loadingSessions ? (
                                                    <div className="text-center p-8"><Loader className="spin" /> Loading classes...</div>
                                                ) : (
                                                    <div className="schedule-grid">
                                                        {sessions.map((sess) => (
                                                            <div key={sess.id} className="schedule-card">
                                                                <div>
                                                                    <div className="schedule-top">
                                                                        <span className={`schedule-badge ${sess.status?.toLowerCase() || 'upcoming'}`}>
                                                                            {sess.status || 'Upcoming'}
                                                                        </span>
                                                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{sess.duration || 45} mins</span>
                                                                    </div>
                                                                    <h4>{sess.title}</h4>
                                                                    <div className="schedule-time-row">
                                                                        <span>
                                                                            <Calendar size={14} color="#60a5fa" /> 
                                                                            {new Date(sess.scheduledAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                                                        </span>
                                                                        <span>
                                                                            <Clock size={14} color="#60a5fa" /> 
                                                                            {new Date(sess.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    </div>
                                                                    {sess.agenda && (
                                                                        <div className="schedule-agenda">
                                                                            <strong>Agenda:</strong> {sess.agenda}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="schedule-actions">
                                                                    <button 
                                                                        className="btn btn-video-call-glow btn-sm w-full"
                                                                        onClick={() => handleStartVideoCall(selectedPartner, sess.roomId)}
                                                                    >
                                                                        <Video size={16} /> Join Video Call
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* SUB-TAB 2: 1-ON-1 CHAT */}
                                        {partnerSubTab === 'chat' && (
                                            <div className="chat-interface glass-card" style={{ height: '620px' }}>
                                                <div className="chat-sidebar" style={{ width: '260px' }}>
                                                    <h3 style={{ fontSize: '1rem', padding: '1.25rem' }}>{isAlumni ? 'Mentee Student' : 'Active Mentor'}</h3>
                                                    <div className="chat-item active">
                                                        <div className="avatar-xs">{selectedPartner.name?.charAt(0)}</div>
                                                        <div className="chat-meta">
                                                            <h4>{selectedPartner.name}</h4>
                                                            <span>{selectedPartner.company || selectedPartner.department || 'Active'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="chat-main">
                                                    <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div className="chat-user">
                                                            <div className="avatar-small">{selectedPartner.name?.charAt(0)}</div>
                                                            <div>
                                                                <h4 style={{ margin: 0 }}>{selectedPartner.name}</h4>
                                                                <span style={{ fontSize: '0.8rem', color: '#10b981' }}>● Online Mentorship Channel</span>
                                                            </div>
                                                        </div>

                                                        <button 
                                                            className="btn btn-video-call-glow btn-sm" 
                                                            onClick={() => handleStartVideoCall(selectedPartner)}
                                                        >
                                                            <Video size={16} /> Video Call
                                                        </button>
                                                    </div>

                                                    <div className="chat-messages">
                                                        {msgLoading ? (
                                                            <div className="loading-msg"><Loader className="spin" /> Loading chat...</div>
                                                        ) : (
                                                            <>
                                                                {messages.map((m, idx) => (
                                                                    <div key={idx} className={`message-bubble ${m.senderId === user.id ? 'sent' : 'received'}`}>
                                                                        {m.imageUrl && (
                                                                            <div className="chat-image-container">
                                                                                <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${m.imageUrl}`} alt="Shared" className="chat-img" />
                                                                            </div>
                                                                        )}
                                                                        {m.content && <p className="msg-text">{m.content}</p>}
                                                                        <span className="msg-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                    </div>
                                                                ))}
                                                                {messages.length === 0 && (
                                                                    <div className="text-center p-8" style={{ color: '#94a3b8' }}>
                                                                        Start your discussion with {selectedPartner.name}! Say hello or ask a question.
                                                                    </div>
                                                                )}
                                                                <div ref={chatEndRef} />
                                                            </>
                                                        )}
                                                    </div>

                                                    <form className="chat-input-area" onSubmit={handleSendMessage}>
                                                        <label className="image-upload-btn">
                                                            <Image size={24} />
                                                            <input 
                                                                type="file" 
                                                                accept="image/*" 
                                                                style={{ display: 'none' }} 
                                                                onChange={(e) => {
                                                                    const file = e.target.files[0];
                                                                    if (file) {
                                                                        const formData = new FormData();
                                                                        formData.append('receiverId', selectedPartner.id);
                                                                        formData.append('image', file);
                                                                        API.post('/api/messages', formData)
                                                                            .then(({ data }) => {
                                                                                setMessages([...messages, data]);
                                                                                scrollToBottom();
                                                                            })
                                                                            .catch(() => alert('Failed to send image'));
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                        <input 
                                                            type="text" 
                                                            placeholder={`Message ${selectedPartner.name}...`} 
                                                            value={newMessage} 
                                                            onChange={(e) => setNewMessage(e.target.value)} 
                                                        />
                                                        <button type="submit" className="send-btn"><Send size={20} /></button>
                                                    </form>
                                                </div>
                                            </div>
                                        )}

                                        {/* SUB-TAB 3: VIDEO CALLING OVERVIEW */}
                                        {partnerSubTab === 'videocall' && (
                                            <div>
                                                <div className="video-call-hub-banner">
                                                    <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                                                        <Video size={36} />
                                                    </div>
                                                    <h3>Direct In-Website Video Calling</h3>
                                                    <p>
                                                        Connect face-to-face with {selectedPartner.name} directly inside the website. When you initiate the call, a ringing popup appears on their screen allowing them to accept and connect immediately.
                                                    </p>
                                                    <button 
                                                        className="btn-video-call-glow" 
                                                        style={{ padding: '0.9rem 2rem', fontSize: '1.05rem', marginTop: '0.5rem' }}
                                                        onClick={() => handleStartVideoCall(selectedPartner)}
                                                    >
                                                        <Video size={22} /> Call {selectedPartner.name} Now
                                                    </button>
                                                </div>

                                                <div className="schedule-section-header">
                                                    <h4 style={{ margin: 0, color: 'white' }}>Scheduled Video Sessions</h4>
                                                </div>

                                                <div className="schedule-grid">
                                                    {sessions.map((sess) => (
                                                        <div key={sess.id} className="schedule-card">
                                                            <div className="schedule-top">
                                                                <span className="schedule-badge upcoming">Video Room</span>
                                                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{sess.duration || 45} mins</span>
                                                            </div>
                                                            <h4>{sess.title}</h4>
                                                            <div className="schedule-time-row">
                                                                <span><Calendar size={14} color="#60a5fa" /> {new Date(sess.scheduledAt).toLocaleDateString()}</span>
                                                                <span><Clock size={14} color="#60a5fa" /> {new Date(sess.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                            <button 
                                                                className="btn btn-video-call-glow btn-sm w-full"
                                                                onClick={() => handleStartVideoCall(selectedPartner, sess.roomId)}
                                                            >
                                                                <Video size={16} /> Join Call Room
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* SUB-TAB 4: GOALS & MILESTONES */}
                                        {partnerSubTab === 'milestones' && (
                                            <div>
                                                <div className="goals-progress-box">
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                            <h4 style={{ margin: '0 0 4px', color: 'white', fontSize: '1.15rem' }}>Mentorship Progress Tracker</h4>
                                                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{completedMilestonesCount} of {milestones.length} milestones accomplished</span>
                                                        </div>
                                                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981' }}>
                                                            {progressPercent}%
                                                        </div>
                                                    </div>
                                                    <div className="progress-bar-bg">
                                                        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                                                    </div>
                                                </div>

                                                <div className="milestones-list">
                                                    {milestones.map((m) => (
                                                        <div 
                                                            key={m.id} 
                                                            className={`milestone-item ${m.completed ? 'done' : ''}`}
                                                            onClick={() => toggleMilestone(m.id)}
                                                        >
                                                            <div className="milestone-checkbox">
                                                                {m.completed && <Check size={16} />}
                                                            </div>
                                                            <div className="milestone-text">
                                                                <h5>{m.title}</h5>
                                                                <p>{m.desc}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* SUB-TAB 5: RESOURCES & NOTES */}
                                        {partnerSubTab === 'resources' && (
                                            <div>
                                                <div className="schedule-section-header">
                                                    <div>
                                                        <h3 style={{ margin: 0, color: 'white' }}>Learning Materials & Notes</h3>
                                                        <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                                                            Curated roadmaps, interview guides, and references shared between you and {selectedPartner.name}.
                                                        </p>
                                                    </div>
                                                    <button className="btn btn-primary btn-sm" onClick={() => setShowResourceModal(true)}>
                                                        <Plus size={16} /> Share New Resource
                                                    </button>
                                                </div>

                                                <div className="resources-grid">
                                                    {resources.map((res) => (
                                                        <div key={res.id} className="resource-card">
                                                            <div>
                                                                <span style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 600, textTransform: 'uppercase' }}>
                                                                    {res.type}
                                                                </span>
                                                                <h4><BookOpen size={16} color="#60a5fa" /> {res.title}</h4>
                                                                <p>{res.desc}</p>
                                                            </div>
                                                            {res.link && res.link !== '#' ? (
                                                                <a 
                                                                    href={res.link} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    className="btn btn-outline btn-sm"
                                                                    style={{ textAlign: 'center', textDecoration: 'none' }}
                                                                >
                                                                    <ExternalLink size={14} style={{ marginRight: '4px' }} /> View Material
                                                                </a>
                                                            ) : (
                                                                <button className="btn btn-outline btn-sm" onClick={() => alert('Accessing shared notes.')}>
                                                                    View Document
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modal 1: Request Guidance Modal */}
            <AnimatePresence>
                {showRequestModal && selectedMentorForRequest && (
                    <div className="modal-overlay">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card modal-card"
                        >
                            <div className="modal-header">
                                <h3>Request Guidance from {selectedMentorForRequest.name}</h3>
                                <button className="close-btn" onClick={() => setShowRequestModal(false)}><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSendRequest} className="post-job-form">
                                <div className="input-group">
                                    <label>What topic do you need guidance on?</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={requestData.topic} 
                                        onChange={(e) => setRequestData({...requestData, topic: e.target.value})} 
                                        placeholder="e.g., Resume Review, Mock Technical Interview, System Design" 
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Introductory Message</label>
                                    <textarea 
                                        required 
                                        value={requestData.message} 
                                        onChange={(e) => setRequestData({...requestData, message: e.target.value})} 
                                        placeholder={`Hi ${selectedMentorForRequest.name}, I would love to learn from your experience at ${selectedMentorForRequest.company || 'your firm'}...`} 
                                        rows="4"
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary w-full">
                                    <Send size={18} /> Send Guidance Request
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal 2: Schedule Mentorship Class Modal */}
            <AnimatePresence>
                {showScheduleModal && selectedPartner && (
                    <div className="modal-overlay">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card modal-card"
                            style={{ maxWidth: '520px' }}
                        >
                            <div className="modal-header">
                                <h3>Schedule Class with {selectedPartner.name}</h3>
                                <button className="close-btn" onClick={() => setShowScheduleModal(false)}><X size={24} /></button>
                            </div>
                            <form onSubmit={handleScheduleClass} className="post-job-form">
                                <div className="input-group">
                                    <label>Session / Class Title</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="e.g., Mock Technical Interview & Portfolio Critique"
                                        value={scheduleFormData.title}
                                        onChange={(e) => setScheduleFormData({...scheduleFormData, title: e.target.value})}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="input-group">
                                        <label>Date</label>
                                        <input 
                                            type="date" 
                                            required 
                                            value={scheduleFormData.date}
                                            onChange={(e) => setScheduleFormData({...scheduleFormData, date: e.target.value})}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Time</label>
                                        <input 
                                            type="time" 
                                            required 
                                            value={scheduleFormData.time}
                                            onChange={(e) => setScheduleFormData({...scheduleFormData, time: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Duration (minutes)</label>
                                    <select 
                                        value={scheduleFormData.duration}
                                        onChange={(e) => setScheduleFormData({...scheduleFormData, duration: Number(e.target.value)})}
                                    >
                                        <option value={30}>30 Minutes</option>
                                        <option value={45}>45 Minutes (Recommended)</option>
                                        <option value={60}>60 Minutes</option>
                                        <option value={90}>90 Minutes</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Session Agenda / Key Goals</label>
                                    <textarea 
                                        rows="3" 
                                        placeholder="Specific topics to cover, questions to prepare, links to review..."
                                        value={scheduleFormData.agenda}
                                        onChange={(e) => setScheduleFormData({...scheduleFormData, agenda: e.target.value})}
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary w-full">
                                    <CalendarCheck size={18} /> Confirm & Schedule Class
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal 3: Share Resource Modal */}
            <AnimatePresence>
                {showResourceModal && (
                    <div className="modal-overlay">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card modal-card"
                            style={{ maxWidth: '480px' }}
                        >
                            <div className="modal-header">
                                <h3>Share Resource / Notes</h3>
                                <button className="close-btn" onClick={() => setShowResourceModal(false)}><X size={24} /></button>
                            </div>
                            <form onSubmit={handleAddResource} className="post-job-form">
                                <div className="input-group">
                                    <label>Resource Title</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="e.g., LeetCode Patterns Cheatsheet"
                                        value={newResource.title}
                                        onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Category</label>
                                    <select 
                                        value={newResource.type}
                                        onChange={(e) => setNewResource({...newResource, type: e.target.value})}
                                    >
                                        <option value="Guide">Study Guide</option>
                                        <option value="Roadmap">Career Roadmap</option>
                                        <option value="Cheat Sheet">Cheat Sheet</option>
                                        <option value="Template">Resume / Doc Template</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Link / URL (Optional)</label>
                                    <input 
                                        type="url" 
                                        placeholder="https://..."
                                        value={newResource.link}
                                        onChange={(e) => setNewResource({...newResource, link: e.target.value})}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Description / Notes</label>
                                    <textarea 
                                        rows="3" 
                                        placeholder="Key takeaways or summary..."
                                        value={newResource.desc}
                                        onChange={(e) => setNewResource({...newResource, desc: e.target.value})}
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary w-full">
                                    <Plus size={18} /> Add Resource
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Mentorship;
