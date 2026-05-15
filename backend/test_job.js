const { createJob } = require('./controllers/adminController');

async function testCreateJob() {
    // Mock req and res
    const req = {
        body: {
            title: 'DEVELOPER',
            company: 'TCS',
            location: 'DHARAPURAM',
            type: 'Full-time',
            salary: '100K',
            description: 'TCS'
        },
        user: {
            id: '0a4f552b-40d1-a0bf-6105-f48e6540ce81' // The admin user ID we created
        }
    };
    
    const res = {
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            if (this.statusCode === 500) {
                console.error('FAILED:', data);
            } else {
                console.log('SUCCESS:', data);
            }
        }
    };

    console.log('Attempting to create job...');
    await createJob(req, res);
}

testCreateJob();
