const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL...');
        
        // Add isReferral column to Jobs table
        await client.query('ALTER TABLE "Jobs" ADD COLUMN IF NOT EXISTS "isReferral" BOOLEAN DEFAULT false;');
        console.log('Successfully added "isReferral" column to "Jobs" table.');
        
    } catch (err) {
        console.error('Error executing migration:', err);
    } finally {
        await client.end();
    }
}

run();
