const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config();

async function fixAdminPassword() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        // Generate a real bcrypt hash for 'admin123'
        const correctHash = await bcrypt.hash('admin123', 12);
        console.log('Generated new hash for admin123:', correctHash);
        
        // Update the admin user in the database
        const result = await client.query(
            'UPDATE "Users" SET password = $1 WHERE email = $2',
            [correctHash, 'admin@college.edu']
        );
        
        console.log('Database updated. Rows affected:', result.rowCount);
        
    } catch (e) {
        console.error('Error updating admin password:', e);
    } finally {
        await client.end();
    }
}

fixAdminPassword();
