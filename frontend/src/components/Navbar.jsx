import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rocket, User, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <div className="container nav-content">
                <Link to="/" className="logo">
                    <Rocket size={32} color="#6366f1" />
                    <span>Alumni<span className="accent">Portal</span></span>
                </Link>

                <div className={`nav-links ${isOpen ? 'active' : ''}`}>
                    <Link to="/directory" onClick={() => setIsOpen(false)}>Directory</Link>
                    <Link to="/jobs" onClick={() => setIsOpen(false)}>Jobs</Link>
                    <Link to="/events" onClick={() => setIsOpen(false)}>Events</Link>

                    {user ? (
                        <div className="user-menu">
                            <span className="user-info">
                                <User size={20} />
                                {user.name}
                            </span>
                            <button onClick={logout} className="btn-logout">
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary" onClick={() => setIsOpen(false)}>Login</Link>
                    )}
                </div>

                <div className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
