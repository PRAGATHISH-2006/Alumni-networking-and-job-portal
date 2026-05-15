import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SplashScreen.css';

const SplashScreen = ({ onFinish }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        // Fallback timer just in case video doesn't trigger onEnded
        const timer = setTimeout(onFinish, 12000); // 12 seconds max
        
        return () => clearTimeout(timer);
    }, [onFinish]);

    const handleVideoEnd = () => {
        onFinish();
    };

    return (
        <motion.div 
            className="splash-screen video-splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ 
                opacity: 0, 
                scale: 1.05,
                filter: 'blur(10px)',
                transition: { duration: 0.8, ease: 'easeInOut' }
            }}
        >
            <div className="video-container">
                <video 
                    ref={videoRef}
                    autoPlay 
                    muted 
                    playsInline
                    onEnded={() => {
                        console.log("Video ended");
                        handleVideoEnd();
                    }}
                    onError={(e) => {
                        console.error("Video error:", e);
                        onFinish();
                    }}
                    className="intro-video"
                >
                    <source src="/A1.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
            
            <motion.button 
                className="skip-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                whileHover={{ opacity: 1 }}
                onClick={() => {
                    console.log("Skip clicked");
                    onFinish();
                }}
            >
                Skip Intro
            </motion.button>
        </motion.div>
    );
};

export default SplashScreen;
