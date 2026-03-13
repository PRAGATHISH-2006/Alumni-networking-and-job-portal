const { User } = require('./models');
const { sequelize } = require('./config/db');

async function checkAdmins() {
    try {
        await sequelize.authenticate();
        const admins = await User.findAll({ where: { role: 'admin' }, attributes: ['email', 'name', 'password'] });
        console.log('--- ADMIN USERS ---');
        admins.forEach(a => {
            console.log(`Name: ${a.name}, Email: ${a.email}`);
        });
        if (admins.length === 0) console.log('No admins found!');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkAdmins();
