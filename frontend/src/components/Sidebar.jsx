import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Share2,
    Briefcase,
    HeartHandshake,
    Calendar,
    Trophy,
    MessageSquare,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { logout } = useAuth();

    const menuItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/directory', icon: <Share2 size={20} />, label: 'Networking Hub' },
        { path: '/jobs', icon: <Briefcase size={20} />, label: 'Job Portal' },
        { path: '/donate', icon: <HeartHandshake size={20} />, label: 'Donations' },
        { path: '/events', icon: <Calendar size={20} />, label: 'Events & Reunions' },
        { path: '/stories', icon: <Trophy size={20} />, label: 'Success Stories' },
        { path: '/feedback', icon: <MessageSquare size={20} />, label: 'Feedback' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-menu">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
