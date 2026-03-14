const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.ibtvlkmztoelwxybbthx:Pragathish2006@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to Supabase PostgreSQL!');

        const sqlPath = path.join(__dirname, '..', 'supabase_setup.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing database setup script...');
        await client.query(sql);

        console.log('Successfully initialized the database!');
    } catch (err) {
        console.error('Error executing SQL:', err);
    } finally {
        await client.end();
    }
}

run();
