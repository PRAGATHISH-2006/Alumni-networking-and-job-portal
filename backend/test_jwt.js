const jwt = require('jsonwebtoken');

try {
    const token = jwt.sign({ id: 1 }, undefined, { expiresIn: '30d' });
    console.log('Token created:', token);
} catch (e) {
    console.error('Expected error:', e.message);
}
