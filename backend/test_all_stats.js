const controllers = require('./controllers/adminController');

async function testAll() {
    const req = { params: {} };
    const res = {
        json: () => {},
        status: (code) => ({
            json: (data) => console.error(`Error ${code}:`, data)
        })
    };

    console.log('Testing all GET endpoints...');
    for (const [name, fn] of Object.entries(controllers)) {
        if (typeof fn === 'function' && name.startsWith('get')) {
            try {
                process.stdout.write(`Testing ${name}... `);
                await fn(req, res);
                console.log('OK');
            } catch (e) {
                console.log('FAILED', e.message);
            }
        }
    }
}
testAll();
