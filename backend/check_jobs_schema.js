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
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Jobs'
        `);
        console.log('Columns in Jobs table:');
        res.rows.forEach(row => console.log(`- ${row.column_name}`));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
