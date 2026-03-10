import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Users, Video, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Events.css';

const featuredEvents = [
    { id: 'f1', title: "Annual Alumni Homecoming 2026", type: "Meetup", date: "2026-12-15T18:00:00", location: "LPU Main Campus, Punjab", description: "The biggest gathering of the year! Reconnect with faculty and friends.", attendees: [1, 2, 3, 4, 5] },
    { id: 'f2', title: "Tech Talk: Scaling to 100M Users", type: "Webinar", date: "2026-04-05T19:30:00", location: "Zoom (Virtual)", description: "Join our distinguished alumni from Netflix and Meta for an exclusive tech deep-dive.", attendees: [1, 2, 3] },
    { id: 'f3', title: "Global Networking Mixer", type: "Social", date: "2026-05-20T20:00:00", location: "New York City / London / Dubai", description: "Simultaneous mixers across major global hubs. Find your local chapter.", attendees: [1, 2] }
];

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/events');
                const backendEvents = Array.isArray(data) ? data : [];
                setEvents([...featuredEvents, ...backendEvents]);
            } catch (error) {
                console.error('Fetch events error:', error);
                setEvents(featuredEvents);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleRegister = async (eventId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            await axios.post(`http://localhost:5000/api/events/${eventId}/register`);
            alert('Registered successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to register');
        }
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
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} onRegister={() => handleRegister(event.id)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const EventCard = ({ event, onRegister }) => (
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
            <button className="btn btn-primary" onClick={onRegister}>Register</button>
        </div>
    </motion.div>
);

export default Events;
