require('dotenv').config();
const { sequelize } = require('./config/db');

async function fix() {
    const sql = `
        CREATE TABLE IF NOT EXISTS jobapplicants (
            id INT AUTO_INCREMENT PRIMARY KEY,
            resumePath VARCHAR(255),
            details TEXT,
            status ENUM('Pending', 'Accepted', 'Rejected', 'Interview Scheduled') DEFAULT 'Pending',
            interviewDate DATETIME,
            adminMessage TEXT,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL,
            JobId INT,
            UserId INT,
            FOREIGN KEY (JobId) REFERENCES jobs(id) ON DELETE CASCADE,
            FOREIGN KEY (UserId) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    try {
        await sequelize.query(sql);
        console.log('Table jobapplicants created/verified successfully');
        process.exit(0);
    } catch (err) {
        console.error('Fix failed:', err.message);
        process.exit(1);
    }
}

fix();
