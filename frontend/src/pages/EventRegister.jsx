import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
    Calendar,
    User,
    Briefcase,
    CheckCircle2,
    Download,
    ArrowRight,
    ArrowLeft,
    Ticket,
    MapPin,
    Clock,
    Share2,
    QrCode,
    CreditCard,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './EventRegister.css';

const EventRegister = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        jobStatus: 'Working', // 'Working', 'Not Working', 'Student'
        currentRole: '',
        company: '',
        regNo: '',
        college: '',
        batch: user?.batch || '',
        dept: user?.dept || '',
        dietary: 'None',
        interests: '',
        paymentMethod: 'card'
    });

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await API.get(`/api/events/id/${id}`, { withCredentials: true });
                setEvent(res.data);
                
                // Check if already registered
                if (user && res.data.attendees?.some(att => att.id === user.id)) {
                    setErrorMsg('You are already registered for this event');
                }
            } catch (error) {
                console.error('Error fetching event:', error);
                setErrorMsg(error.response?.data?.message || error.message || 'Failed to load event');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, user]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cardData, setCardData] = useState({
        number: '',
        expiry: '',
        cvv: ''
    });
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [timeLeft, setTimeLeft] = useState(5);
    const [isDownloading, setIsDownloading] = useState({ ticket: false, receipt: false });
    // Synchronous ref guard — prevents double-submit regardless of React's async state
    const submittedRef = React.useRef(false);

    const steps = [
        { id: 1, title: "Status & Profile", icon: <User size={20} /> },
        { id: 2, title: "Preferences", icon: <Briefcase size={20} /> },
        { id: 3, title: "Payment", icon: <CreditCard size={20} /> },
        { id: 4, title: "Confirm", icon: <CheckCircle2 size={20} /> }
    ];

    useEffect(() => {
        let timer;
        if (currentStep === 3 && formData.paymentMethod === 'gpay' && !isConfirmed) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [currentStep, formData.paymentMethod, isConfirmed]);

    const handleNext = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
        else if (currentStep === 3 && formData.paymentMethod === 'card') handleSubmit();
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        // Use ref (synchronous) to prevent any double-submission race condition
        if (submittedRef.current || isConfirmed) return;
        submittedRef.current = true;
        setIsSubmitting(true);
        try {
            await API.post(`/api/events/register/${id}`, formData, { withCredentials: true });
            setIsSubmitting(false);
            setIsConfirmed(true);
            setCurrentStep(4);
        } catch (error) {
            console.error('Registration Error:', error);
            const msg = error.response?.data?.message || error.message || 'Server error';
            // Only show already-registered alert if we haven't already confirmed (i.e. a true duplicate attempt)
            if (msg.toLowerCase().includes('already registered') && !isConfirmed) {
                alert('You are already registered for this event.');
                navigate('/events');
                return;
            }
            // For any other error, reset the guard so user can try again
            submittedRef.current = false;
            setIsSubmitting(false);
            alert('Registration failed: ' + msg);
        }
    };

    const handleDownloadPDF = async (targetId, fileName) => {
        const element = document.getElementById(targetId);
        if (!element) return;

        const type = targetId.includes('ticket') ? 'ticket' : 'receipt';
        setIsDownloading(prev => ({ ...prev, [type]: true }));

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
            background: targetId.includes('receipt') ? '#ffffff' : 'transparent'
        });
        document.body.appendChild(clone);

        try {
            // Wait for clone to be ready
            await new Promise(resolve => setTimeout(resolve, 200));

            const canvas = await html2canvas(clone, {
                scale: 3,
                useCORS: true,
                backgroundColor: targetId.includes('receipt') ? "#ffffff" : null,
                logging: false,
                width: clone.offsetWidth,
                height: clone.offsetHeight
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (clone.offsetHeight * pdfWidth) / clone.offsetWidth;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${fileName}.pdf`);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            document.body.removeChild(clone);
            setIsDownloading(prev => ({ ...prev, [type]: false }));
        }
    };

    if (loading) return <div className="loading-state">Loading event details...</div>;
    if (errorMsg) return (
        <div className="error-state" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem', 
            padding: '2rem',
            textAlign: 'center'
        }}>
            <p>{errorMsg}</p>
            <button className="btn btn-primary" style={{ margin: '0 auto' }} onClick={() => navigate('/events')}>Back to Events</button>
        </div>
    );
    if (!event) return <div className="error-state">Event not found.</div>;

    if (isConfirmed) {
// ...
        return (
            <div className="registration-success-page">
                <div className="download-area">
                    {/* Visual Ticket */}
                    <motion.div
                        id="ticket-download"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ticket-container glass-card"
                    >
                        <div className="ticket-header">
                            <div className="ticket-badge">Official Alumni Ticket</div>
                            <Ticket size={40} className="ticket-icon" />
                        </div>

                        <div className="ticket-main">
                            <div className="ticket-left">
                                <h1>{event.title}</h1>
                                <div className="ticket-info-grid">
                                    <div className="info-item"><Calendar size={16} /><span>{event.date ? new Date(event.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'TBD'}</span></div>
                                    <div className="info-item"><Clock size={16} /><span>{event.time}</span></div>
                                    <div className="info-item"><MapPin size={16} /><span>{event.location}</span></div>
                                </div>
                                <div className="attendee-info">
                                    <p>Attendee: <strong>{user?.name}</strong></p>
                                    <p>Registration Status: <strong>{formData.jobStatus}</strong></p>
                                </div>
                            </div>
                            <div className="ticket-right">
                                <div className="qr-sim"><div className="qr-box"></div><p>PROCEED TO ENTRY</p></div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Visual Receipt (Hidden visually but available for download) */}
                    <div className="receipt-wrapper" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                        <div id="receipt-download" className="receipt-card">
                            <div className="receipt-header">
                                <ShieldCheck size={48} color="var(--primary)" />
                                <h2>Payment Confirmation</h2>
                                <p>Transaction Successfully Processed</p>
                            </div>
                            <div className="receipt-details">
                                <div className="detail-row"><span>Event:</span> <strong>{event.title}</strong></div>
                                <div className="detail-row"><span>Attendee:</span> <strong>{user?.name}</strong></div>
                                <div className="detail-row"><span>Amount Paid:</span> <strong className="amount">₹{parseFloat(event.price || 0).toLocaleString()}</strong></div>
                                <div className="detail-row"><span>Method:</span> <strong>{formData.paymentMethod.toUpperCase()}</strong></div>
                                <div className="detail-row"><span>Date:</span> <strong>{new Date().toLocaleDateString()}</strong></div>
                                <div className="detail-row"><span>Transaction ID:</span> <strong>TXN{Math.floor(Math.random() * 1000000)}</strong></div>
                            </div>
                            <div className="receipt-footer">
                                <p>Thank you for your commitment to the Alumni Community.</p>
                                <div className="receipt-stamp">PAID</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="success-actions">
                    <button
                        className={`btn btn-primary ${isDownloading.ticket ? 'loading' : ''}`}
                        onClick={() => handleDownloadPDF('ticket-download', 'Event_Ticket')}
                        disabled={isDownloading.ticket}
                    >
                        <Download size={18} /> {isDownloading.ticket ? 'Generating PDF...' : 'Download Ticket PDF'}
                    </button>
                    <button
                        className={`btn btn-primary ${isDownloading.receipt ? 'loading' : ''}`}
                        style={{ background: 'var(--secondary)' }}
                        onClick={() => handleDownloadPDF('receipt-download', 'Payment_Receipt')}
                        disabled={isDownloading.receipt}
                    >
                        <Download size={18} /> {isDownloading.receipt ? 'Generating PDF...' : 'Payment Proof PDF'}
                    </button>
                    <button className="btn btn-outline" onClick={() => navigate('/events')}>Back to Events</button>
                </div>
            </div>
        );
    }

    return (
        <div className="event-register-page">
            <div className="register-header">
                <button className="back-link" onClick={() => navigate('/events')}>
                    <ArrowLeft size={18} /> Cancel Registration
                </button>
                <h1>Register for <span className="gradient-text">{event.title}</span></h1>
            </div>

            <div className="register-stepper">
                {steps.map((s) => (
                    <div key={s.id} className={`step-item ${currentStep === s.id ? 'active' : ''} ${currentStep > s.id ? 'done' : ''}`}>
                        <div className="step-point">{s.icon}</div>
                        <span className="step-label">{s.title}</span>
                    </div>
                ))}
            </div>

            <div className="register-card glass-card">
                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2>Please tell us about your current status</h2>
                            <div className="status-selector">
                                {['Working', 'Not Working', 'Student'].map(status => (
                                    <button
                                        key={status}
                                        className={`status-btn ${formData.jobStatus === status ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, jobStatus: status })}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>

                            {formData.jobStatus === 'Working' && (
                                <div className="step-form mt-4">
                                    <div className="input-group">
                                        <label>Designation / Role</label>
                                        <input type="text" placeholder="e.g. Senior Architect" value={formData.currentRole} onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Current Company</label>
                                        <input type="text" placeholder="e.g. Google India" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                                    </div>
                                </div>
                            )}

                            {formData.jobStatus === 'Student' && (
                                <div className="step-form mt-4">
                                    <div className="form-row">
                                        <div className="input-group"><label>Registration Number</label><input type="text" placeholder="e.g. 12214342" value={formData.regNo} onChange={(e) => setFormData({ ...formData, regNo: e.target.value })} /></div>
                                        <div className="input-group"><label>Expected Batch</label><input type="text" placeholder="e.g. 2026" value={formData.batch} onChange={(e) => setFormData({ ...formData, batch: e.target.value })} /></div>
                                    </div>
                                    <div className="input-group"><label>College / University Name</label><input type="text" placeholder="e.g. Lovely Professional University" value={formData.college} onChange={(e) => setFormData({ ...formData, college: e.target.value })} /></div>
                                </div>
                            )}

                            {formData.jobStatus === 'Not Working' && (
                                <div className="mt-4 p-4 glass-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    <p className="text-muted">You are all set! You can proceed to the next step to finalize your preferences.</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2>Event Preferences</h2>
                            <div className="input-group">
                                <label>Dietary Requirements</label>
                                <select 
                                    value={formData.dietary} 
                                    onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                                    style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    <option value="None" style={{ background: '#1e293b', color: '#e2e8f0' }}>None (Standard)</option>
                                    <option value="Veg" style={{ background: '#1e293b', color: '#e2e8f0' }}>Veg</option>
                                    <option value="Non-Veg" style={{ background: '#1e293b', color: '#e2e8f0' }}>Non-Veg</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Additional Details / Special Requests</label>
                                <textarea rows="4" placeholder="Mention any other specifics you'd like us to know..." value={formData.interests} onChange={(e) => setFormData({ ...formData, interests: e.target.value })} />
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 3 && (
                        <motion.div key="3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2>Secure Payment Selection</h2>
                            <p className="mb-4 text-muted">A nominal commitment fee of ₹{event.price || 0} is required for this event.</p>
                            <div className="payment-tabs mb-4">
                                <button className={`pay-tab ${formData.paymentMethod === 'card' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}>Credit / Debit Card</button>
                                <button className={`pay-tab ${formData.paymentMethod === 'gpay' ? 'active' : ''}`} onClick={() => { setFormData({ ...formData, paymentMethod: 'gpay' }); setTimeLeft(5); }}>GPay / UPI</button>
                            </div>

                            {formData.paymentMethod === 'card' ? (
                                <div className="card-form">
                                    <div className="input-group">
                                        <label>Card Number</label>
                                        <input
                                            type="text"
                                            placeholder="4242 4242 4242 4242"
                                            maxLength="19"
                                            value={cardData.number}
                                            onChange={(e) => setCardData({...cardData, number: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="input-group">
                                            <label>Expiry Date</label>
                                            <input 
                                                type="text" 
                                                placeholder="MM/YY" 
                                                value={cardData.expiry}
                                                onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>CVV Number</label>
                                            <input 
                                                type="password" 
                                                placeholder="***" 
                                                maxLength="3" 
                                                value={cardData.cvv}
                                                onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs opacity-50">Please enter your card details to finalize the payment.</p>
                                </div>
                            ) : (
                                <div className="gpay-qr">
                                    <div className="qr-container"><QrCode size={120} color="black" /></div>
                                    <p className="countdown">SIMULATING TRANSACTION: Auto-completing in {timeLeft}s...</p>
                                    <div className="progress-bar-mini" style={{ width: `${(timeLeft / 5) * 100}%`, height: '4px', background: 'var(--secondary)', margin: '1rem auto', borderRadius: '2px' }}></div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="register-actions mt-auto">
                    {currentStep < 4 && currentStep > 1 && (
                        <button className="btn btn-outline" onClick={handleBack} disabled={isSubmitting}>
                            Back
                        </button>
                    )}
                    {!(currentStep === 3 && formData.paymentMethod === 'gpay') && (
                        <button
                            className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                            onClick={handleNext}
                            disabled={
                                isSubmitting || 
                                (formData.jobStatus === 'Working' && currentStep === 1 && !formData.company) || 
                                (formData.jobStatus === 'Student' && currentStep === 1 && !formData.college) ||
                                (currentStep === 3 && formData.paymentMethod === 'card' && (!cardData.number || !cardData.expiry || !cardData.cvv))
                            }
                        >
                            {isSubmitting ? 'Finalizing...' : currentStep === 3 ? `Confirm & Pay ₹${event.price || 0}` : 'Continue'} <ArrowRight size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventRegister;
