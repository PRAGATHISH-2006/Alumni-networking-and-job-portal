const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

client.connect().then(() => client.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'Users\';'))
    .then(res => { 
        console.log('Columns:', res.rows.map(r => r.column_name).join(', '));
        client.end(); 
    }).catch(e => {
        console.error(e);
        client.end();
    });
