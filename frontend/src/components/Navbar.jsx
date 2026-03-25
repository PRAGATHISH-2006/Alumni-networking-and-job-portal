import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rocket, ChevronDown, LogOut, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const isAdminView = location.pathname.toLowerCase().includes('/admin') || user?.role === 'admin';

    const careersLinks = [
        { label: 'Jobs', path: '/jobs' },
        { label: 'Internships', path: '/jobs?type=Internship' },
        { label: 'Search Alumni', path: '/directory' },
        { label: 'Search Faculty', path: '/faculty' },
        { label: 'Mentorship', path: '/mentorship' }
    ];

    if (user?.role === 'alumni') {
        careersLinks.push({ label: 'Alumni Connect', path: '/alumni-chat' });
    }

    const isUnapproved = user && user.role !== 'admin' && !user.isApproved;

    const dropdownData = isAdminView ? [] : (isUnapproved ? [
        {
            label: 'More',
            links: [
                { label: 'UMS Password Reset', path: '/support' },
                { label: 'Alumni Magazine', path: '/magazine' },
                { label: 'Volunteer Opportunities', path: '/volunteer' },
                { label: 'FAQ', path: '/faq' },
            ]
        }
    ] : [
        {
            label: 'Careers',
            links: careersLinks
        },
        {
            label: 'Events',
            links: [
                { label: 'Event Registrations', path: '/events' },
                { label: 'Alumni Event Calendar', path: '/events' },
                { label: 'Nominations – Alumni Awards 2025', path: '/awards/nominations' },
            ]
        },
        {
            label: 'Contribute',
            links: [
                { label: 'Alumni Student Support Funds 2024–25', path: '/donate' },
                { label: 'Other Alumni Fund Raising Campaigns', path: '/donate' },
            ]
        },
        {
            label: 'Benefits',
            links: [
                { label: 'Online Courses', path: '/courses' },
                { label: 'Job Services', path: '/jobs' },
                { label: 'UMS Password Reset', path: '/support' },
            ]
        },
        {
            label: 'More',
            links: [
                { label: 'Elite Alumni', path: '/alumni/elite' },
                { label: 'Happenings at LPU', path: '/news' },
                { label: 'Alumni Awards', path: '/awards' },
                { label: 'Notable Alumni', path: '/alumni/notable' },
                { label: 'Alumni Stories', path: '/stories' },
                { label: 'Alumni Magazine', path: '/magazine' },
                { label: 'News & Updates', path: '/news' },
                { label: 'Volunteer Opportunities', path: '/volunteer' },
                { label: 'FAQ', path: '/faq' },
            ]
        }
    ]);

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <Rocket size={28} className="logo-icon" />
                    <span>ALUMNI</span>
                </Link>

                <div className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
                    {!isAdminView && (
                        <ul className="nav-list">
                            {dropdownData.map((dropdown, index) => (
                                <li key={index} className="nav-item has-dropdown">
                                    <span className="nav-link">
                                        {dropdown.label} <ChevronDown size={14} />
                                    </span>
                                    <ul className="dropdown-menu">
                                        {dropdown.links.map((link, lIndex) => (
                                            <li key={lIndex}>
                                                <Link to={link.path} onClick={() => setIsMobileMenuOpen(false)}>
                                                    {link.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    )}

                    {user ? (
                        <div className="nav-auth-info">
                            <Link to="/profile" className="user-profile-link">
                                <div className="user-avatar-small">{user?.name?.charAt(0) || '?'}</div>
                                <span className="user-name">{user?.name || 'User'}</span>
                            </Link>
                            {user.role === 'admin' && <Link to="/admin" className="admin-link">Admin</Link>}
                            <button className="logout-btn" onClick={async () => {
                                await logout();
                                navigate('/login');
                            }}>
                                <LogOut size={18} />
                                <span className="logout-text">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="login-btn">Login</Link>
                    )}
                </div>

                <div className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
