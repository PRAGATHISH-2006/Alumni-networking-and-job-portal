import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import API from '../api/axios';
=======
import axios from 'axios';
>>>>>>> c1c6cd0974127645dd41ee07bb95326593fd51e6
import { Calendar, MapPin, Users, Video, Clock, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Events.css';
const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Safety Guard
    if (authLoading) {
        return (
            <div className="loading-screen">
                <Loader className="animate-spin" size={48} />
            </div>
        );
    }

    useEffect(() => {
        const fetchEvents = async () => {
            try {
<<<<<<< HEAD
                const { data } = await API.get('/api/events');
=======
                const { data } = await axios.get('http://localhost:5000/api/events');
>>>>>>> c1c6cd0974127645dd41ee07bb95326593fd51e6
                setEvents(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Fetch events error:', error);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleRegister = (eventId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        navigate(`/event/${eventId}/register`);
    };

    return (
        <div className="events-page">
            <div className="container">
                <div className="events-header">
                    <h1>Upcoming <span className="gradient-text">Events</span></h1>
                    <p>Join webinars, workshops, and meetups to stay connected.</p>
                </div>

                {loading ? (
                    <div className="loading-state">Loading events...</div>
                ) : (
                    <div className="events-grid">
                        {events.map((event) => {
                            const isRegistered = event.attendees?.some(att => att.id === user?.id);
                            return <EventCard 
                                key={event.id} 
                                event={event} 
                                isRegistered={isRegistered}
                                onRegister={() => handleRegister(event.id)} 
                            />;
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const EventCard = ({ event, onRegister, isRegistered }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className="glass-card event-card"
    >
        <div className="event-badge">{event.type}</div>
        <h3>{event.title}</h3>
        <p className="event-desc">{event.description}</p>

        <div className="event-info">
            <div className="info-item">
                <Calendar size={18} />
                <span>{event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}</span>
            </div>
            <div className="info-item">
                <Clock size={18} />
                <span>{event.date ? new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}</span>
            </div>
            <div className="info-item">
                {event.type === 'Webinar' ? <Video size={18} /> : <MapPin size={18} />}
                <span>{event.location || 'Remote'}</span>
            </div>
        </div>

        <div className="event-footer">
            <div className="attendees">
                <Users size={16} />
                <span>{(event.attendees || []).length} attending</span>
            </div>
            <button 
                className={`btn ${isRegistered ? 'btn-outline disabled' : 'btn-primary'}`} 
                onClick={!isRegistered ? onRegister : undefined}
                disabled={isRegistered}
                style={isRegistered ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
            >
                {isRegistered ? 'Already Registered' : 'Register'}
            </button>
        </div>
    </motion.div>
);

export default Events;
