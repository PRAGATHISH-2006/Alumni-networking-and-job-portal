const { User, Job, Event } = require('./models');
const { sequelize } = require('./config/db');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        // Sync database (force: true will drop tables first - use with caution)
        // For seeding on top of existing data, use force: false
        await sequelize.sync({ force: true });
        console.log('Database synced for seeding...');

        // 1. Create Users
        const hashedAdminPassword = await bcrypt.hash('admin123', 12);
        const hashedAlumniPassword = await bcrypt.hash('alumni123', 12);
        const hashedStudentPassword = await bcrypt.hash('student123', 12);

        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@college.edu',
            password: hashedAdminPassword,
            role: 'admin',
            isApproved: true
        });

        const alumni1 = await User.create({
            name: 'Sarah Chen',
            email: 'sarah.chen@google.com',
            password: hashedAlumniPassword,
            role: 'alumni',
            bio: 'Software Engineer at Google | L6 | Tech Lead',
            location: 'Mountain View, CA',
            skills: ['Java', 'Distributed Systems', 'Go'],
            isApproved: true
        });

        const alumni2 = await User.create({
            name: 'Michael Ross',
            email: 'mross@tesla.com',
            password: hashedAlumniPassword,
            role: 'alumni',
            bio: 'Senior Product Manager at Tesla',
            location: 'Austin, TX',
            skills: ['Product Strategy', 'Automotive Tech', 'AI'],
            isApproved: true
        });

        const student1 = await User.create({
            name: 'Alex Rivera',
            email: 'arivera@student.edu',
            password: hashedStudentPassword,
            role: 'student',
            bio: 'CS Junior | Aspiring Web Developer',
            location: 'New York, NY',
            skills: ['React', 'Node.js'],
            isApproved: true
        });

        console.log('Users seeded!');

        // 2. Create Jobs
        await Job.create({
            title: 'Frontend Developer Intern',
            company: 'Google',
            location: 'Remote/Mountain View',
            type: 'Internship',
            description: 'Join the Chrome team as a frontend intern. Work with React and TypeScript on cutting-edge features.',
            salary: '$8000/month',
            postedBy: alumni1.id
        });

        await Job.create({
            title: 'Software Engineer (L4)',
            company: 'Tesla',
            location: 'Austin, TX',
            type: 'Full-time',
            description: 'Help us build the firmware for our next-generation autonomous vehicles.',
            salary: '$160k - $220k',
            postedBy: alumni2.id
        });

        await Job.create({
            title: 'Senior UX Designer',
            company: 'DesignFlow',
            location: 'San Francisco, CA',
            type: 'Full-time',
            description: 'Lead our UI/UX department for our SaaS product.',
            salary: '$140k+',
            postedBy: alumni1.id
        });

        console.log('Jobs seeded!');

        // 3. Create Events
        await Event.create({
            title: 'Annual Alumni Homecoming 2026',
            description: 'Join us back on campus for a night of networking and nostalgia.',
            date: new Date('2026-06-15T18:00:00'),
            location: 'Main Auditorium, College Campus',
            type: 'Meetup',
            organizerId: admin.id
        });

        await Event.create({
            title: 'Breaking into Big Tech',
            description: 'A webinar featuring Sarah Chen on how to land a job at Google.',
            date: new Date('2026-03-25T19:30:00'),
            location: 'Zoom (Online)',
            type: 'Webinar',
            organizerId: alumni1.id
        });

        await Event.create({
            title: 'Modern Product Management Workshop',
            description: 'Learn the principles of technical product management from Michael Ross.',
            date: new Date('2026-04-10T10:00:00'),
            location: 'Innovation Lab, Room 402',
            type: 'Workshop',
            organizerId: alumni2.id
        });

        console.log('Events seeded!');

        console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
        process.exit();

    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
