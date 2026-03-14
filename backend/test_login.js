const { User } = require('./models');

async function test() {
    try {
        console.log('Testing User.findOne...');
        const user = await User.findOne({ where: { email: 'admin@college.edu' } });
        console.log('User found:', user ? user.email : 'not found');
        
        console.log('Testing User.create...');
        const newUser = await User.create({
            name: 'Test',
            email: 'test' + Date.now() + '@test.com',
            password: 'testpassword',
            skills: ['js', 'css'],
            interests: ['coding']
        });
        console.log('New user created successfully!');
    } catch (e) {
        console.error('Error in Sequelize query:', e.message);
        console.error(e);
    }
}
test();
