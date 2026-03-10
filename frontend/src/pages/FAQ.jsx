import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, MessageCircle } from 'lucide-react';
import './FAQ.css';

const faqs = [
    {
        q: "How do I register as an Alumnus?",
        a: "Click on the Register button on the login screen. Fill in your graduation details and current professional info. Once our admin verifies your details, your account will be active."
    },
    {
        q: "Can I post a job vacancy?",
        a: "Yes! Any registered alumnus can post job or internship opportunities. Go to the Careers dropdown and select 'Post a Job' (available in your dashboard) or reach out to the admin."
    },
    {
        q: "How can I mentor a student?",
        a: "Navigate to the Mentorship section. You can set up your profile as a mentor and students will be able to reach out to you based on your expertise."
    },
    {
        q: "What benefits do I get as an Alumnus?",
        a: "You get access to lifelong learning courses, career services, exclusive campus events, and the ability to hire directly from our talented pool of students."
    },
    {
        q: "How do I find a batchmate?",
        a: "Use the Alumni Directory. You can search by name, batch year, or company to find and connect with your former batchmates."
    }
];

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    return (
        <div className="faq-page">
            <header className="faq-header">
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="gradient-text"
                >
                    Frequently Asked Questions
                </motion.h1>
                <p>Everything you need to know about the Alumni Portal.</p>
            </header>

            <div className="faq-container glass-card">
                {faqs.map((faq, i) => (
                    <div key={i} className={`faq-item ${activeIndex === i ? 'active' : ''}`}>
                        <button className="faq-question" onClick={() => setActiveIndex(activeIndex === i ? null : i)}>
                            <span><HelpCircle size={20} /> {faq.q}</span>
                            <ChevronDown size={18} className="arrow" />
                        </button>
                        <AnimatePresence>
                            {activeIndex === i && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="faq-answer"
                                >
                                    <p>{faq.a}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            <div className="faq-cta glass-card">
                <MessageCircle size={40} className="cta-icon" />
                <h3>Still have questions?</h3>
                <p>Can't find what you're looking for? Reach out to our support team.</p>
                <button className="btn btn-primary" onClick={() => window.location.href = '/feedback'}>Contact Support</button>
            </div>
        </div>
    );
};

export default FAQ;
