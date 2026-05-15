const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function test() {
    try {
        const user = await User.findOne({ where: { email: 'admin@college.edu' } });
        console.log('User password field:', user.password);
        const match = await user.comparePassword('admin123');
        console.log('Password match:', match);
    } catch (e) {
        console.error('Error in login test:', e.message);
        console.error(e);
    }
}
test();
