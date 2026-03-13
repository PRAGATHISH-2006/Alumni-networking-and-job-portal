const { getEventById } = require('./controllers/eventController');
const req = { params: { id: 'bba90b45-d43c-44bf-a9bc-8d3155c8ba4d' } };
const res = {
    json: (data) => console.log('Response JSON:', !!data),
    status: (code) => ({
        json: (data) => console.log('Response Status:', code, 'JSON:', data)
    })
};

getEventById(req, res).then(() => {
    console.log('Done');
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
