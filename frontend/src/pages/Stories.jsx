import React from 'react';
import { motion } from 'framer-motion';
import { Quote, ExternalLink, Award, GraduationCap } from 'lucide-react';
import './Stories.css';

const stories = [
    {
        id: 1,
        name: "Sarah Chen",
        batch: "2018",
        role: "Tech Lead @ Google",
        image: "SC",
        quote: "The networking opportunities provided by this portal were instrumental in my journey to Silicon Valley.",
        achievement: "Founded 'DevConnect' - a non-profit for rural education."
    },
    {
        id: 2,
        name: "Michael Ross",
        batch: "2015",
        role: "Senior PM @ Tesla",
        image: "MR",
        quote: "Our alumni network is my biggest asset. From mentorship to hiring, it's a goldmine.",
        achievement: "Led the design of the Model 3 infotainment system."
    },
    {
        id: 3,
        name: "Elena Gomez",
        batch: "2020",
        role: "AI Researcher @ Meta",
        image: "EG",
        quote: "Stay curious, stay connected. The portal helped me find my first research internship.",
        achievement: "Published 5+ papers on LLM safety in top-tier journals."
    },
    {
        id: 4,
        name: "David Kim",
        batch: "2016",
        role: "SDE III @ AWS",
        image: "DK",
        quote: "Giving back through mentorship has been the most rewarding part of my career.",
        achievement: "Architected the latest region expansion for AWS Bangalore."
    },
    {
        id: 5,
        name: "Priya Sharma",
        batch: "2019",
        role: "Senior UI Engineer @ Netflix",
        image: "PS",
        quote: "Design is not just how it looks, but how it works for the community.",
        achievement: "Optimized the Netflix TV app for low-bandwidth regions."
    },
    {
        id: 6,
        name: "James Wilson",
        batch: "2014",
        role: "Hardware Architect @ Apple",
        image: "JW",
        quote: "Innovation follows those who never stop learning from their peers.",
        achievement: "Key contributor to the M3 performance core design."
    }
];

const Stories = () => {
    return (
        <div className="stories-page">
            <header className="stories-header">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="gradient-text"
                >
                    Success Stories
                </motion.h1>
                <p>Inspiring journeys of our alumni community across the globe.</p>
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
                                {story.image}
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
        </div>
    );
};

export default Stories;
