const { User } = require('./models');
const { connectDB, sequelize } = require('./config/db');

const checkUser = async () => {
    try {
        await connectDB();
        await sequelize.authenticate();
        
        const user = await User.findOne({
            where: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('name')),
                'pragathish s'
            )
        });
        
        if (user) {
            console.log(`User Found: ${user.name}`);
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`Approved: ${user.isApproved}`);
        } else {
            console.log('User NOT Found');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUser();
