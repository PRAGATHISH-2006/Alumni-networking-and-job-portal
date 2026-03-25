require('dotenv').config();
const { sequelize } = require('./config/db');
const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function resetPasswords() {
    try {
        await sequelize.authenticate();
        console.log('DB connected\n');

        // Show all users
        const users = await User.findAll({ attributes: ['id', 'email', 'role', 'isApproved', 'name'] });
        console.log('=== ALL USERS ===');
        users.forEach(u => {
            const j = u.toJSON();
            console.log(`  [${j.role}] ${j.email} | name: ${j.name} | approved: ${j.isApproved}`);
        });

        // Reset admin password
        const admin = await User.findOne({ where: { role: 'admin' } });
        if (admin) {
            const hashed = await bcrypt.hash('Admin@123', 12);
            await sequelize.query('UPDATE "Users" SET password = :password WHERE email = :email', {
                replacements: { password: hashed, email: admin.email }
            });
            console.log(`\n✅ Admin password reset to "Admin@123"`);
            console.log(`   Email: ${admin.email}`);
        } else {
            // Create admin if doesn't exist
            console.log('\nNo admin found, creating one...');
            await User.create({
                name: 'System Admin',
                email: 'admin@alumni.com',
                password: 'Admin@123',
                role: 'admin',
                isApproved: true
            });
            console.log('✅ Admin created: admin@alumni.com / Admin@123');
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

resetPasswords();
