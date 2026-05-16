const { User } = require('./models');
const { connectDB, sequelize } = require('./config/db');

const approveAllStudents = async () => {
    try {
        await connectDB();
        await sequelize.authenticate();
        
        console.log('Force approving all student accounts...');
        
        const [results, metadata] = await sequelize.query(
            "UPDATE \"Users\" SET \"isApproved\" = true WHERE role = 'student'"
        );
        
        // Metadata might vary by dialect, let's just check the DB again
        const count = await User.count({ where: { role: 'student', isApproved: false } });
        console.log(`Remaining unapproved students: ${count}`);
        
        if (count === 0) {
            console.log('All students are now approved.');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

approveAllStudents();
