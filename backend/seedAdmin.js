const { User } = require('./models');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');

const seedAdmin = async () => {
    try {
        await connectDB();
        await sequelize.authenticate();
        
        const existingAdmin = await User.findOne({ where: { email: 'admin@gmail.com' } });
        if (!existingAdmin) {
            await User.create({
                name: 'System Admin',
                email: 'admin@gmail.com',
                password: 'admin123',
                role: 'admin',
                isApproved: true
            });
            console.log('Default admin account created successfully.');
        } else {
            console.log('Default admin account already exists.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
