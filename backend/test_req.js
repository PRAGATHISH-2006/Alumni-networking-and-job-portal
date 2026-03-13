try {
    console.log('Testing authRoutes...');
    require('./routes/authRoutes');
    console.log('Testing userRoutes...');
    require('./routes/userRoutes');
    console.log('Testing jobRoutes...');
    require('./routes/jobRoutes');
    console.log('Testing eventRoutes...');
    require('./routes/eventRoutes');
    console.log('Testing mentorshipRoutes...');
    require('./routes/mentorshipRoutes');
    console.log('Testing adminRoutes...');
    require('./routes/adminRoutes');
    console.log('Testing messageRoutes...');
    require('./routes/messageRoutes');
    console.log('All routes loaded successfully!');
} catch (error) {
    console.error('Failed at:', error.message);
    console.error(error.stack);
}
