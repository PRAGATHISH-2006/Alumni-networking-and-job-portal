import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, CreditCard, ChevronRight, CheckCircle2, Download, QrCode, Timer, ShieldCheck, Wallet } from 'lucide-react';
import API from '../api/axios';
import './Donations.css';

const DonationSteps = {
    TYPE: 0,
    AMOUNT: 1,
    PAYMENT: 2,
    SUCCESS: 3
};

const fundTypes = [
    { id: 'scholarship', title: 'Scholarship Fund', icon: <Heart color="#f43f5e" />, desc: 'Help bright students with financial needs.' },
    { id: 'infra', title: 'Infrastructure Dev', icon: <ShieldCheck color="#3b82f6" />, desc: 'Build modern labs and libraries.' },
    { id: 'events', title: 'Event Sponsorship', icon: <Timer color="#eab308" />, desc: 'Support Alumni Homecoming & Tech Fests.' },
    { id: 'rnd', title: 'R&D Grants', icon: <Wallet color="#8b5cf6" />, desc: 'Fund research and innovation center.' }
];

const amounts = [1000, 5000, 10000, 25000, 50000];

const Donations = () => {
    const [step, setStep] = useState(DonationSteps.TYPE);
    const [selection, setSelection] = useState({
        type: null,
        amount: null,
        method: null
    });
    const [timeLeft, setTimeLeft] = useState(10);
    const [customAmount, setCustomAmount] = useState('');
    const [cardData, setCardData] = useState({
        number: '',
        expiry: '',
        cvv: ''
    });

    const handlePayment = async (method) => {
        try {
            await API.post('/api/donate', {
                fundType: selection.type.title,
                amount: Number(selection.amount),
                paymentMethod: method
            });
            setStep(DonationSteps.SUCCESS);
        } catch (e) {
            console.error('Payment Error:', e);
            alert('Payment failed. Please try again.');
        }
    };

    useEffect(() => {
        let timer;
        if (step === DonationSteps.PAYMENT && selection.method === 'gpay') {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handlePayment('gpay');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [step, selection.method]);

    const handleDownloadReceipt = () => {
        const receiptContent = `
            ALUMNI PORTAL RECEIPT
            ---------------------
            Receipt No: ALM-${Math.floor(Math.random() * 90000) + 10000}
            Date: ${new Date().toLocaleDateString()}
            
            Donor: ${localStorage.getItem('user_name') || 'Valued Alumnus'}
            Fund: ${selection.type.title}
            Amount: ₹${selection.amount}
            Status: PAID
            ---------------------
            Thank you for your contribution!
        `;
        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt_${selection.type.id}.txt`;
        a.click();
    };

    const renderStep = () => {
        switch (step) {
            case DonationSteps.TYPE:
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="step-container">
                        <h2>Choose Donation Type</h2>
                        <div className="fund-grid">
                            {fundTypes.map(fund => (
                                <div
                                    key={fund.id}
                                    className={`fund-card glass-card ${selection.type?.id === fund.id ? 'active' : ''}`}
                                    onClick={() => setSelection({ ...selection, type: fund })}
                                >
                                    <div className="fund-icon">{fund.icon}</div>
                                    <h3>{fund.title}</h3>
                                    <p>{fund.desc}</p>
                                </div>
                            ))}
                        </div>
                        <button
                            className="btn btn-primary next-btn"
                            disabled={!selection.type}
                            onClick={() => setStep(DonationSteps.AMOUNT)}
                        >
                            Next: Select Amount <ChevronRight size={18} />
                        </button>
                    </motion.div>
                );

            case DonationSteps.AMOUNT:
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="step-container">
                        <h2>Select Contribution Amount</h2>
                        <div className="amount-grid">
                            {amounts.map(amt => (
                                <div
                                    key={amt}
                                    className={`amount-pill ${selection.amount === amt ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelection({ ...selection, amount: amt });
                                        setCustomAmount('');
                                    }}
                                >
                                    ₹{amt.toLocaleString()}
                                </div>
                            ))}
                        </div>
                        <div className="input-group custom-amount">
                            <label>Or Enter Custom Amount (₹)</label>
                            <input
                                type="number"
                                placeholder="Enter amount"
                                value={customAmount}
                                onChange={(e) => {
                                    setCustomAmount(e.target.value);
                                    setSelection({ ...selection, amount: e.target.value });
                                }}
                            />
                        </div>
                        <div className="btn-group">
                            <button className="btn btn-outline" onClick={() => setStep(DonationSteps.TYPE)}>Back</button>
                            <button
                                className="btn btn-primary"
                                disabled={!selection.amount}
                                onClick={() => setStep(DonationSteps.PAYMENT)}
                            >
                                Next: Payment Method
                            </button>
                        </div>
                    </motion.div>
                );

            case DonationSteps.PAYMENT:
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="step-container">
                        <h2>Choose Payment Method</h2>
                        <div className="payment-options">
                            <div
                                className={`payment-card glass-card ${selection.method === 'card' ? 'active' : ''}`}
                                onClick={() => setSelection({ ...selection, method: 'card' })}
                            >
                                <CreditCard size={32} />
                                <span>Credit/Debit Card</span>
                            </div>
                            <div
                                className={`payment-card glass-card ${selection.method === 'gpay' ? 'active' : ''}`}
                                onClick={() => {
                                    setSelection({ ...selection, method: 'gpay' });
                                    setTimeLeft(10);
                                }}
                            >
                                <QrCode size={32} />
                                <span>GPay / UPI</span>
                            </div>
                        </div>

                        {selection.method === 'card' && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="card-mock-section">
                                <div className="input-group">
                                    <label>Card Number</label>
                                    <input 
                                        type="text" 
                                        placeholder="4242 4242 4242 4242" 
                                        value={cardData.number}
                                        onChange={(e) => setCardData({...cardData, number: e.target.value})}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="input-group">
                                        <label>Expiry</label>
                                        <input 
                                            type="text" 
                                            placeholder="12/28" 
                                            value={cardData.expiry}
                                            onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>CVV</label>
                                        <input 
                                            type="text" 
                                            placeholder="***" 
                                            value={cardData.cvv}
                                            onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <button 
                                    className="btn btn-primary full-width" 
                                    onClick={() => handlePayment('card')}
                                    disabled={!cardData.number || !cardData.expiry || !cardData.cvv}
                                >
                                    Complete Payment (₹{selection.amount})
                                </button>
                            </motion.div>
                        )}

                        {selection.method === 'gpay' && (
                            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="qr-section">
                                <div className="qr-container">
                                    <QrCode size={180} />
                                    <div className="qr-overlay">SIMULATED</div>
                                </div>
                                <div className="timer-badge">
                                    <Timer size={16} /> Auto-completing in {timeLeft}s
                                </div>
                                <p>Please scan this QR code using your GPay app</p>
                            </motion.div>
                        )}

                        <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => setStep(DonationSteps.AMOUNT)}>Back</button>
                    </motion.div>
                );

            case DonationSteps.SUCCESS:
                return (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="success-overlay"
                    >
                        <div className="success-lottie">
                            <CheckCircle2 size={100} color="#10b981" />
                        </div>
                        <h1>Donation Successful!</h1>
                        <p>Thank you for your generous contribution to <strong>{selection.type.title}</strong>.</p>
                        <div className="summary-card glass-card">
                            <div className="summary-item"><span>Amount:</span> <strong>₹{selection.amount}</strong></div>
                            <div className="summary-item"><span>Status:</span> <strong>Completed</strong></div>
                        </div>
                        <div className="final-actions">
                            <button className="btn btn-primary" onClick={handleDownloadReceipt}>
                                <Download size={18} /> Download Receipt
                            </button>
                            <button className="btn btn-outline" onClick={() => window.location.href = '/'}>
                                Back to Dashboard
                            </button>
                        </div>
                    </motion.div>
                );
            default: return null;
        }
    };

    return (
        <div className="donations-page">
            <header className="donations-header">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="gradient-text"
                >
                    Make a Donation
                </motion.h1>
                <p>Empower the next generation of students through your support.</p>
            </header>

            <div className="progress-bar-container">
                <div className="progress-track">
                    <motion.div
                        className="progress-fill"
                        animate={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
                <div className="progress-steps">
                    <span>Type</span>
                    <span>Amount</span>
                    <span>Payment</span>
                    <span>Done</span>
                </div>
            </div>

            <div className="donations-content">
                {renderStep()}
            </div>
        </div>
    );
};

export default Donations;
