import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
    Play,
    CheckCircle,
    Award,
    ArrowRight,
    ChevronLeft,
    FileText,
    Download,
    Star,
    BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './CoursePlayer.css';

const courseData = {
    "1": {
        title: "Advanced System Design for Scalable Apps",
        instructor: "David Kim",
        lessons: [
            { id: 1, title: "Introduction to Microservices", duration: "15:00" },
            { id: 2, title: "Database Sharding & Replication", duration: "25:00" },
            { id: 3, title: "Caching Strategies with Redis", duration: "20:00" },
            { id: 4, title: "Load Balancing Techniques", duration: "18:00" }
        ],
        quiz: [
            {
                question: "Which of these is a key benefit of Database Sharding?",
                options: ["Easier Backups", "Horizontal Scaling", "Reduced Data Redundancy", "Simplified Joins"],
                correct: 1
            },
            {
                question: "What does the 'C' in CAP theorem stand for?",
                options: ["Concurrency", "Caching", "Consistency", "Complexity"],
                correct: 2
            }
        ]
    },
    "2": {
        title: "Product Management in Big Tech",
        instructor: "Michael Ross",
        lessons: [
            { id: 1, title: "Defining Product Vision", duration: "12:00" },
            { id: 2, title: "Agile Scoping & Backlogs", duration: "20:00" },
            { id: 3, title: "Go-to-Market Strategy", duration: "15:00" }
        ],
        quiz: [
            {
                question: "What is an MVP?",
                options: ["Most Valued Product", "Minimum Viable Product", "Main Visual Prototype", "Major Version Program"],
                correct: 1
            }
        ]
    },
    "3": {
        title: "Mastering React & Framer Motion",
        instructor: "Priya Sharma",
        lessons: [
            { id: 1, title: "Declarative UI Patterns", duration: "18:00" },
            { id: 2, title: "Advanced Animation Loops", duration: "22:00" }
        ],
        quiz: [
            {
                question: "Which component is used for exit animations in Framer Motion?",
                options: ["AnimateOnExit", "ExitMotion", "AnimatePresence", "AutoAnimate"],
                correct: 2
            }
        ]
    },
    "4": {
        title: "AI & Machine Learning Foundations",
        instructor: "Elena Gomez",
        lessons: [
            { id: 1, title: "Neural Networks 101", duration: "25:00" },
            { id: 2, title: "Large Language Models", duration: "30:00" }
        ],
        quiz: [
            {
                question: "What does 'Transformer' architecture rely on?",
                options: ["Attention Mechanism", "Recursion", "Linear Kernels", "Binary Search"],
                correct: 0
            }
        ]
    }
};

const CoursePlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const course = courseData[id] || courseData["1"]; // Default to 1 for demo

    const [step, setStep] = useState('video'); // 'video', 'quiz', 'certificate'
    const [currentLesson, setCurrentLesson] = useState(course.lessons[0]);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleLessonComplete = () => {
        const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
        if (currentIndex < course.lessons.length - 1) {
            setCurrentLesson(course.lessons[currentIndex + 1]);
        } else {
            setStep('quiz');
        }
    };

    const handleQuizSubmit = () => {
        setQuizSubmitted(true);
        setTimeout(() => setStep('certificate'), 1500);
    };

    const handleDownloadCertificate = async () => {
        const element = document.getElementById('certificate-download');
        if (!element) return;

        setIsDownloading(true);
        
        // Create a clone for capture to avoid clipping issues from scrollable parents
        const clone = element.cloneNode(true);
        Object.assign(clone.style, {
            position: 'absolute',
            top: '-10000px',
            left: '0',
            width: `${element.offsetWidth}px`,
            height: 'auto',
            zIndex: '-9999',
            visibility: 'visible',
            background: '#ffffff'
        });
        document.body.appendChild(clone);
        
        try {
            // Wait for clone to be ready
            await new Promise(resolve => setTimeout(resolve, 200));

            const canvas = await html2canvas(clone, {
                scale: 3,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
                width: clone.offsetWidth,
                height: clone.offsetHeight
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (clone.offsetHeight * pdfWidth) / clone.offsetWidth;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Certificate_${course.title.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            document.body.removeChild(clone);
            setIsDownloading(false);
        }
    };

    return (
        <div className="course-player-page">
            <div className="player-navbar">
                <button className="back-btn" onClick={() => navigate('/courses')}>
                    <ChevronLeft size={20} /> Back to Courses
                </button>
                <div className="course-title-nav">
                    <h2>{course.title}</h2>
                    <span className="badge">Lesson {course.lessons.findIndex(l => l.id === currentLesson.id) + 1} of {course.lessons.length}</span>
                </div>
            </div>

            <div className="player-container">
                <div className="main-content">
                    <AnimatePresence mode="wait">
                        {step === 'video' && (
                            <motion.div
                                key="video"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="video-area"
                            >
                                <div className="video-placeholder glass-card">
                                    <Play size={64} className="play-pulse" />
                                    <h3>Playing: {currentLesson.title}</h3>
                                    <p>Simulated Video Stream...</p>
                                </div>
                                <div className="video-controls">
                                    <button className="btn btn-primary" onClick={handleLessonComplete}>
                                        Mark as Complete & Next <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'quiz' && (
                            <motion.div
                                key="quiz"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="quiz-area glass-card"
                            >
                                <div className="quiz-header">
                                    <FileText size={32} color="var(--secondary)" />
                                    <h2>Final Assessment</h2>
                                    <p>Test your knowledge to earn your certificate.</p>
                                </div>

                                <div className="quiz-body">
                                    {course.quiz.map((q, qIndex) => (
                                        <div key={qIndex} className="quiz-q">
                                            <h4>{qIndex + 1}. {q.question}</h4>
                                            <div className="options-grid">
                                                {q.options.map((opt, oIndex) => (
                                                    <button
                                                        key={oIndex}
                                                        className={`option-btn ${quizAnswers[qIndex] === oIndex ? 'selected' : ''}`}
                                                        onClick={() => setQuizAnswers({ ...quizAnswers, [qIndex]: oIndex })}
                                                        disabled={quizSubmitted}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    className={`btn btn-primary submit-quiz ${quizSubmitted ? 'loading' : ''}`}
                                    onClick={handleQuizSubmit}
                                    disabled={Object.keys(quizAnswers).length < course.quiz.length}
                                >
                                    {quizSubmitted ? 'Validating...' : 'Submit Assessment'}
                                </button>
                            </motion.div>
                        )}

                        {step === 'certificate' && (
                            <motion.div
                                key="certificate"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="certificate-area"
                            >
                                <div id="certificate-download" className="cert-preview glass-card">
                                    <div className="cert-border">
                                        <div className="cert-inner">
                                            <Award size={80} className="cert-icon" />
                                            <h1>Certificate of Excellence</h1>
                                            <p className="cert-subtext">This is to certify that</p>
                                            <h2 className="user-name-highlight">{user?.name || 'Guest Student'}</h2>
                                            <p className="cert-text">has successfully completed the comprehensive course on</p>
                                            <h3>{course.title}</h3>
                                            <div className="cert-footer">
                                                <div className="sign-box">
                                                    <div className="sign">PRAGATHISH S</div>
                                                    <p>CEO OF ALUMINI</p>
                                                </div>
                                                <div className="date-box">
                                                    <p>Date: {new Date().toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="cert-actions">
                                    <button
                                        className={`btn btn-primary ${isDownloading ? 'loading' : ''}`}
                                        onClick={handleDownloadCertificate}
                                        disabled={isDownloading}
                                    >
                                        <Download size={18} /> {isDownloading ? 'Generating PDF...' : 'Download Certificate PDF'}
                                    </button>
                                    <button className="btn btn-outline" onClick={() => navigate('/courses')}>
                                        Browse More Courses
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="player-sidebar glass-card">
                    <h3>Curriculum</h3>
                    <div className="lesson-list">
                        {course.lessons.map((lesson, i) => (
                            <button
                                key={lesson.id}
                                className={`lesson-item ${currentLesson.id === lesson.id ? 'active' : ''} ${lesson.id < currentLesson.id || step !== 'video' ? 'completed' : ''}`}
                                onClick={() => step === 'video' && setCurrentLesson(lesson)}
                            >
                                <div className="lesson-status">
                                    {(lesson.id < currentLesson.id || step !== 'video') ? <CheckCircle size={18} /> : <Play size={18} />}
                                </div>
                                <div className="lesson-info">
                                    <p className="l-title">{lesson.title}</p>
                                    <span className="l-dur">{lesson.duration}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursePlayer;
