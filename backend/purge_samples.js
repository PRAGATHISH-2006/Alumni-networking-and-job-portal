const { User, Job, Event, Donation, Mentorship, Story, Feedback, News, Awards, Course, Magazine } = require('./models');
const { sequelize } = require('./config/db');

async function purgeSamples() {
    console.log('--- STARTING SAMPLE DATA PURGE ---');
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Delete records from tables that depend on Users first
        console.log('Cleaning up dependent records...');
        await Job.destroy({ where: {}, truncate: { cascade: true } });
        await Story.destroy({ where: {}, truncate: { cascade: true } });
        await Donation.destroy({ where: {}, truncate: { cascade: true } });
        await Mentorship.destroy({ where: {}, truncate: { cascade: true } });
        await Feedback.destroy({ where: {}, truncate: { cascade: true } });
        await Event.destroy({ where: {}, truncate: { cascade: true } });

        // Delete users but KEEP admins
        console.log('Purging non-admin users...');
        const deletedCount = await User.destroy({
            where: {
                role: ['alumni', 'student']
            }
        });

        console.log(`Success: Purged ${deletedCount} users and their associated content.`);
        console.log('Admin accounts have been preserved.');
        
    } catch (error) {
        console.error('Purge Failed:', error);
    } finally {
        process.exit();
    }
}

purgeSamples();
