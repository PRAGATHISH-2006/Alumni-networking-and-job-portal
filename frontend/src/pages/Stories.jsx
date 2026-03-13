import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ExternalLink, Award, GraduationCap, Plus, X, Send, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import './Stories.css';

const Stories = () => {
    const { user, loading: authLoading } = useAuth();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newStory, setNewStory] = useState({
        quote: '',
        achievement: ''
    });

    const fetchStories = async () => {
        try {
            const { data } = await API.get('/api/stories');
            setStories(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    const handleAddStory = async (e) => {
        e.preventDefault();
        try {
            await API.post('/api/stories', newStory);
            setShowModal(false);
            setNewStory({ quote: '', achievement: '' });
            alert("Your success story has been submitted for approval!");
            fetchStories();
        } catch (error) {
            alert('Submission failed');
        }
    };

    // Safety Guard
    if (authLoading || loading) {
        return (
            <div className="loading-screen">
                <Loader className="animate-spin" size={48} />
            </div>
        );
    }

    return (
        <div className="stories-page">
            <header className="stories-header">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="gradient-text"
                    >
                        Success Stories
                    </motion.h1>
                    <p>Inspiring journeys of our alumni community across the globe.</p>
                </div>
                {(user?.role === 'alumni' || user?.role === 'admin') && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> {user?.role === 'admin' ? 'Create Success Story' : 'Share Your Journey'}
                    </button>
                )}
            </header>

            <div className="stories-grid">
                {stories.map((story, index) => (
                    <motion.div
                        key={story.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card story-card"
                    >
                        <div className="story-top">
                            <div className="story-avatar">
                                {story.image || (story.name ? story.name.charAt(0) : '?')}
                            </div>
                            <div className="story-basic-info">
                                <h3>{story.name}</h3>
                                <p className="story-batch"><GraduationCap size={14} /> Class of {story.batch}</p>
                            </div>
                        </div>

                        <div className="story-role">
                            <Award size={16} /> <span>{story.role}</span>
                        </div>

                        <div className="story-quote">
                            <Quote size={20} className="quote-icon" />
                            <p>{story.quote}</p>
                        </div>

                        <div className="story-achievement">
                            <strong>Notable Achievement:</strong>
                            <p>{story.achievement}</p>
                        </div>

                        <button className="btn-outline read-more">
                            Full Story <ExternalLink size={14} />
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Share Story Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card modal-card"
                        >
                            <div className="modal-header">
                                <h3>Share Your Journey</h3>
                                <button className="close-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
                            </div>
                            <form onSubmit={handleAddStory} className="post-job-form">
                                <div className="input-group">
                                    <label>A Quote that defines your journey (Visbile on Card)</label>
                                    <textarea 
                                        required 
                                        value={newStory.quote} 
                                        onChange={(e) => setNewStory({...newStory, quote: e.target.value})} 
                                        placeholder="e.g., The networking opportunities here changed my career..." 
                                        rows="3"
                                    ></textarea>
                                </div>
                                <div className="input-group">
                                    <label>A Notable Achievement</label>
                                    <textarea 
                                        required 
                                        value={newStory.achievement} 
                                        onChange={(e) => setNewStory({...newStory, achievement: e.target.value})} 
                                        placeholder="e.g., Promoted to Tech Lead within 2 years, published a paper..." 
                                        rows="3"
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary w-full">
                                    <Send size={18} /> Publish Story
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Stories;
