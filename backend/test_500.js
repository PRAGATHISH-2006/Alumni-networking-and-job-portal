const { User } = require('./models');

async function test() {
    try {
        console.log('Testing User.findOne with undefined email...');
        const user = await User.findOne({ where: { email: undefined } });
        console.log('Found:', user);
    } catch (e) {
        console.error('Error with undefined:', e.message);
    }

    try {
        console.log('Testing generateToken with undefined secret...');
        const jwt = require('jsonwebtoken');
        jwt.sign({ id: 1 }, undefined, { expiresIn: '30d' });
    } catch (e) {
        console.error('Error with undefined secret:', e.message);
    }
}

test();
