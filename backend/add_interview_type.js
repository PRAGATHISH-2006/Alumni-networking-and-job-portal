require('dotenv').config();
const { sequelize } = require('./config/db');

async function fix() {
    try {
        await sequelize.query("ALTER TABLE jobapplicants ADD COLUMN interviewType ENUM('Online', 'Offline') AFTER interviewDate");
        console.log('Column interviewType added successfully');
        process.exit(0);
    } catch (err) {
        if (err.message.includes('Duplicate column name')) {
            console.log('Column already exists');
            process.exit(0);
        }
        console.error('Fix failed:', err.message);
        process.exit(1);
    }
}

fix();
