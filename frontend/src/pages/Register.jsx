import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Briefcase, Loader } from 'lucide-react';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student'
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="container">
                <div className="glass-card auth-card">
                    <div className="auth-header">
                        <UserPlus size={48} className="auth-icon" />
                        <h2>Create Account</h2>
                        <p>Join the alumni community</p>
                    </div>

                    {error && <div className="error-msg">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="input-group">
                            <label><User size={18} /> Full Name</label>
                            <input
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="input-group">
                            <label><Mail size={18} /> Email Address</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="name@example.com"
                            />
                        </div>
                        <div className="input-group">
                            <label><Lock size={18} /> Password</label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="input-group">
                            <label><Briefcase size={18} /> I am a:</label>
                            <select name="role" value={formData.role} onChange={handleChange}>
                                <option value="student">Student</option>
                                <option value="alumni">Alumni</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary auth-btn" disabled={isLoading}>
                            {isLoading ? <Loader className="spin" size={20} /> : 'Register'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Already have an account? <Link to="/login">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
