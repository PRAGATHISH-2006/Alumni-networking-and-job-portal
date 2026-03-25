import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { Mail, ArrowLeft, Loader, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await API.post('/api/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-background">
                    <div className="auth-blob auth-blob-1"></div>
                    <div className="auth-blob auth-blob-2"></div>
                </div>
                <div className="container">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card auth-card text-center"
                    >
                        <CheckCircle size={64} className="text-success" style={{ color: '#10b981', margin: '0 auto 1.5rem' }} />
                        <h2 className="gradient-text" style={{ marginBottom: '1rem' }}>Check Your Email</h2>
                        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
                            We've sent a password reset link to <strong>{email}</strong>. 
                            Please check your inbox and follow the instructions.
                        </p>
                        <Link to="/login" className="btn btn-primary w-full">
                            <ArrowLeft size={18} /> Back to Login
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-background">
                <div className="auth-blob auth-blob-1"></div>
                <div className="auth-blob auth-blob-2"></div>
                <div className="auth-blob auth-blob-3"></div>
            </div>
            <div className="container">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card auth-card"
                >
                    <div className="auth-header">
                        <Mail size={40} className="auth-icon gradient-icon" />
                        <h2>Forgot Password?</h2>
                        <p>No worries, we'll send you reset instructions.</p>
                    </div>

                    {error && <div className="error-msg">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="input-group">
                            <label><Mail size={18} /> Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="name@example.com"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary auth-btn" disabled={isLoading}>
                            {isLoading ? <Loader className="spin" size={20} /> : 'Send Reset Link'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <ArrowLeft size={16} /> Back to Login
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
