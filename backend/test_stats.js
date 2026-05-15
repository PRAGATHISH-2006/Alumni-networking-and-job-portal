const { getDashboardStats } = require('./controllers/adminController');

// Mock request and response
const req = {};
const res = {
    json: (data) => console.log('Success:', data),
    status: (code) => ({
        json: (data) => console.error('Status', code, 'Error:', data)
    })
};

getDashboardStats(req, res);
