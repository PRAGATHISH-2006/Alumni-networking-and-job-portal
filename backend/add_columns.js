const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        await client.query('ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "resumeUrl" VARCHAR(255);');
        console.log('Added resumeUrl to Users table');
        
        // Also ensure Events has all columns
        await client.query('ALTER TABLE "Events" ADD COLUMN IF NOT EXISTS "status" VARCHAR(255);');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
