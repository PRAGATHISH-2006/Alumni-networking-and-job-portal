const { User, Job, Event } = require('./models');
const { sequelize } = require('./config/db');

async function check() {
    try {
        await sequelize.authenticate();
        const userCount = await User.count();
        const jobCount = await Job.count();
        const eventCount = await Event.count();
        console.log(`DIAGNOSTIC: Users: ${userCount}, Jobs: ${jobCount}, Events: ${eventCount}`);
        const allJobs = await Job.findAll();
        console.log('JOBS:', JSON.stringify(allJobs, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('DIAGNOSTIC ERROR:', err);
        process.exit(1);
    }
}
check();
