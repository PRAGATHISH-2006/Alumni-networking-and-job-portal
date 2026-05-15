const { User } = require('./models');

async function test() {
    try {
        // Try to fetch a user
        console.log('Fetching user...');
        const user = await User.findOne({ where: { role: 'admin' } });
        console.log('User fetched.');
        
        // This implicitly calls the get() methods on skills, interests, links
        const rawJson = user.toJSON();
        console.log('toJSON successful:', rawJson.skills);
    } catch (e) {
        console.error('Error:', e.message);
        console.error(e.stack);
    }
}
test();
