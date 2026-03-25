import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
    UserPlus, 
    Mail, 
    Lock, 
    User, 
    Briefcase, 
    Loader, 
    ArrowRight, 
    ArrowLeft, 
    GraduationCap, 
    MapPin,
    Eye,
    EyeOff
} from 'lucide-react';
import './Auth.css';

const Register = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        company: '',
        position: '',
        batch: '',
        department: '',
        location: '',
        skills: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        if (step === 1 && (!formData.name || !formData.email || !formData.password)) {
            setError('Please fill in all basic details');
            return;
        }
        setError('');
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setIsLoading(true);
        
        // Prepare skills as array if provided
        const finalData = {
            ...formData,
            skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : []
        };

        try {
            await register(finalData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-background">
                <div className="auth-blob auth-blob-1"></div>
                <div className="auth-blob auth-blob-2"></div>
                <div className="auth-blob auth-blob-3"></div>
            </div>
            <div className="auth-watermark">
                <img src="/logo.png" alt="Watermark Logo" />
            </div>
            <div className="container">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card auth-card extended"
                >
                    <div className="auth-header">
                        <div className="step-indicator">
                            <div className={`step-dot ${step >= 1 ? 'active' : ''}`}></div>
                            <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
                            <div className={`step-dot ${step >= 2 ? 'active' : ''}`}></div>
                        </div>
                        <UserPlus size={40} className="auth-icon gradient-icon" />
                        <h2>{step === 1 ? 'Join the Network' : 'Complete Profile'}</h2>
                        <p>{step === 1 ? 'Start your journey with us' : `Tell us more about your ${formData.role} status`}</p>
                    </div>

                    {error && <div className="error-msg">{error}</div>}

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.form 
                                key="step1"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="auth-form"
                                onSubmit={(e) => { e.preventDefault(); nextStep(); }}
                            >
                                <div className="input-group">
                                    <label><User size={18} /> Full Name</label>
                                    <input name="name" type="text" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
                                </div>
                                <div className="input-group">
                                    <label><Mail size={18} /> Email Address</label>
                                    <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="name@example.com" />
                                </div>
                                <div className="input-group">
                                    <label><Lock size={18} /> Password</label>
                                <div className="password-input-wrapper">
                                        <input 
                                            name="password" 
                                            type={showPassword ? "text" : "password"} 
                                            value={formData.password} 
                                            onChange={handleChange} 
                                            required 
                                            placeholder="••••••••" 
                                        />
                                        <button 
                                            type="button" 
                                            className="password-toggle" 
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label><ShieldCheck size={18} /> Account Type</label>
                                    <div className="role-selector">
                                        <button 
                                            type="button" 
                                            className={`role-btn ${formData.role === 'student' ? 'active' : ''}`}
                                            onClick={() => setFormData({...formData, role: 'student'})}
                                        >
                                            <GraduationCap size={20} /> Student
                                        </button>
                                        <button 
                                            type="button" 
                                            className={`role-btn ${formData.role === 'alumni' ? 'active' : ''}`}
                                            onClick={() => setFormData({...formData, role: 'alumni'})}
                                        >
                                            <Briefcase size={20} /> Alumni
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary auth-btn">
                                    Continue <ArrowRight size={18} />
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form 
                                key="step2"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="auth-form"
                                onSubmit={handleSubmit}
                            >
                                {formData.role === 'alumni' ? (
                                    <>
                                        <div className="input-group">
                                            <label><Building size={18} /> Current Company</label>
                                            <input name="company" type="text" value={formData.company} onChange={handleChange} required placeholder="e.g. Google" />
                                        </div>
                                        <div className="input-group">
                                            <label><Briefcase size={18} /> Current Position</label>
                                            <input name="position" type="text" value={formData.position} onChange={handleChange} required placeholder="e.g. Senior Software Engineer" />
                                        </div>
                                        <div className="input-group">
                                            <label><GraduationCap size={18} /> Graduation Batch</label>
                                            <input name="batch" type="text" value={formData.batch} onChange={handleChange} required placeholder="e.g. 2022" />
                                        </div>
                                        <div className="input-group">
                                            <label><Briefcase size={18} /> Department / Major</label>
                                            <input name="department" type="text" value={formData.department} onChange={handleChange} required placeholder="e.g. Computer Science" />
                                        </div>
                                        <div className="input-group">
                                            <label><MapPin size={18} /> Location</label>
                                            <input name="location" type="text" value={formData.location} onChange={handleChange} placeholder="e.g. New York, NY" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="input-group">
                                            <label><GraduationCap size={18} /> Current Batch</label>
                                            <input name="batch" type="text" value={formData.batch} onChange={handleChange} required placeholder="e.g. 2026" />
                                        </div>
                                        <div className="input-group">
                                            <label><Briefcase size={18} /> Department / Major</label>
                                            <input name="department" type="text" value={formData.department} onChange={handleChange} required placeholder="e.g. Computer Science" />
                                        </div>
                                        <div className="input-group">
                                            <label><Code size={18} /> Top Skills</label>
                                            <input name="skills" type="text" value={formData.skills} onChange={handleChange} required placeholder="e.g. React, Node.js, Python" />
                                            <small>Separate with commas</small>
                                        </div>
                                    </>
                                ) }
                                
                                <div className="form-actions">
                                    <button type="button" className="btn btn-outline" onClick={prevStep}>
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                    <button type="submit" className="btn btn-primary auth-btn" disabled={isLoading}>
                                        {isLoading ? <Loader className="spin" size={20} /> : 'Create Account'}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <p className="auth-footer">
                        Already have an account? <Link to="/login">Login</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
