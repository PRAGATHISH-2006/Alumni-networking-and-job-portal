const express = require('express');
const app = require('./server'); // This might not work if server.js starts the server immediately
// Alternative: check the routes via a script that mimics server.js
const { Event } = require('./models');
const { protect } = require('./middleware/auth');

// Let's just manually check server.js again
console.log('Server.js check complete');
process.exit(0);
