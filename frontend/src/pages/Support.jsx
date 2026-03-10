import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Key, Globe, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import './Support.css';

const Support = () => {
    return (
        <div className="support-page">
            <header className="support-header">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="gradient-text"
                >
                    Alumni Support & UMS
                </motion.h1>
                <p>Manage your account, reset passwords, and access campus services.</p>
            </header>

            <div className="support-grid">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card support-card highlight">
                    <div className="support-icon"><Key size={32} /></div>
                    <h3>UMS Password Reset</h3>
                    <p>Lost access to your University Management System account? Click below to start the verification and reset process.</p>
                    <div className="support-steps">
                        <div className="step"><span>1</span> Verify Alumni ID</div>
                        <div className="step"><span>2</span> OTP Verification</div>
                        <div className="step"><span>3</span> New Password</div>
                    </div>
                    <button className="btn btn-primary">Start Reset Process <ArrowRight size={18} /></button>
                </motion.div>

                <div className="support-side">
                    <div className="glass-card support-card small">
                        <ShieldCheck size={24} className="icon-blue" />
                        <div>
                            <h4>Alumni ID Services</h4>
                            <p>Request or renew your physical Alumni ID card for campus access.</p>
                        </div>
                    </div>

                    <div className="glass-card support-card small">
                        <Globe size={24} className="icon-purple" />
                        <div>
                            <h4>Global Verification</h4>
                            <p>Get your degree credentials verified for international opportunities.</p>
                        </div>
                    </div>

                    <div className="glass-card support-card small">
                        <HelpCircle size={24} className="icon-cyan" />
                        <div>
                            <h4>Need Help?</h4>
                            <p>Chat with our support team regarding any portal technical issues.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="emergency-note glass-card">
                <ShieldAlert size={20} />
                <p><strong>Note:</strong> Password resets can take up to 24 hours for security verification by the University IT department.</p>
            </div>
        </div>
    );
};

export default Support;
