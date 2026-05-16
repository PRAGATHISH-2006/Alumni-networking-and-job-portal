const { User } = require('./models');
const { connectDB, sequelize } = require('./config/db');

const checkAllStudents = async () => {
    try {
        await connectDB();
        await sequelize.authenticate();
        
        const users = await User.findAll({
            where: { role: 'student' },
            attributes: ['id', 'name', 'email', 'isApproved']
        });
        
        console.log('--- Current Student Users ---');
        users.forEach(u => {
            console.log(`Name: ${u.name} | Email: ${u.email} | Approved: ${u.isApproved}`);
        });
        console.log('---------------------------');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkAllStudents();
