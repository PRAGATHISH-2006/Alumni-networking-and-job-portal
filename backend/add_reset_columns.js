const { sequelize } = require('./config/db');

const migrate = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected. Adding columns...');

        const queryInterface = sequelize.getQueryInterface();
        
        // Add resetPasswordToken
        try {
            await queryInterface.addColumn('Users', 'resetPasswordToken', {
                type: require('sequelize').DataTypes.STRING,
                allowNull: true
            });
            console.log('Added resetPasswordToken column');
        } catch (e) {
            console.log('resetPasswordToken column might already exist or table name is different:', e.message);
        }

        // Add resetPasswordExpire
        try {
            await queryInterface.addColumn('Users', 'resetPasswordExpire', {
                type: require('sequelize').DataTypes.DATE,
                allowNull: true
            });
            console.log('Added resetPasswordExpire column');
        } catch (e) {
            console.log('resetPasswordExpire column might already exist or table name is different:', e.message);
        }

        console.log('Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
