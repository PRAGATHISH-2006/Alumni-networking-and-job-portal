const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');

const app = express();

// Middleware
app.use(express.json());
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/mentorship', require('./routes/mentorshipRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api', require('./routes/miscRoutes'));

app.get('/', (req, res) => {
    res.send('Alumni Portal API is running (MySQL)...');
});

// Sync Database & Start Server
const PORT = process.env.PORT || 5000;

// Sync Database (Only in dev to prevent Vercel timeouts)
if (process.env.NODE_ENV !== 'production') {
    sequelize.sync({ alter: false })
        .then(() => {
            console.log('Database synced');
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        })
        .catch(err => {
            console.error('Database sync error:', err);
        });
} else {
    // Just authenticate in production
    sequelize.authenticate()
        .then(() => console.log('PostgreSQL Connected'))
        .catch(err => console.error('DB Connection Error:', err));
}

module.exports = app;
