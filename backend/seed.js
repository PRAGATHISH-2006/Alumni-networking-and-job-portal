const { User, Job, Event } = require('./models');
const { sequelize } = require('./config/db');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        await sequelize.sync({ force: true });
        console.log('Database synced for seeding...');

        // 1. Create 10 Users (1 Admin, 6 Alumni, 3 Students)
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@gmail.com',
            password: 'admin123@',
            role: 'admin',
            isApproved: true
        });

        const alumniPassword = 'alumni123';
        const studentPassword = 'student123';

        const alumniData = [
            { name: 'Sarah Chen', email: 'sarah.chen@google.com', company: 'Google', bio: 'Tech Lead @ Google', loc: 'Mountain View', skills: ['React', 'Go', 'K8s'] },
            { name: 'Michael Ross', email: 'mross@tesla.com', company: 'Tesla', bio: 'Senior PM @ Tesla', loc: 'Austin', skills: ['Product', 'AI', 'Autopilot'] },
            { name: 'Elena Gomez', email: 'elena.g@meta.com', company: 'Meta', bio: 'Staff Engineer @ Meta', loc: 'Menlo Park', skills: ['System Design', 'C++', 'PyTorch'] },
            { name: 'David Kim', email: 'davidk@amazon.com', company: 'Amazon', bio: 'SDE III @ AWS', loc: 'Seattle', skills: ['AWS', 'Java', 'DynamoDB'] },
            { name: 'Priya Sharma', email: 'priya.s@netflix.com', company: 'Netflix', bio: 'Senior UI Engineer @ Netflix', loc: 'Los Gatos', skills: ['CSS', 'React', 'TypeScript'] },
            { name: 'James Wilson', email: 'jwilson@apple.com', company: 'Apple', bio: 'Hardware Architect @ Apple', loc: 'Cupertino', skills: ['Swift', 'Architecture', 'M3 Chip'] }
        ];

        const createdAlumni = [];
        for (const a of alumniData) {
            const user = await User.create({
                name: a.name,
                email: a.email,
                password: alumniPassword,
                role: 'alumni',
                bio: a.bio,
                location: a.loc,
                skills: a.skills,
                isApproved: true
            });
            createdAlumni.push(user);
        }

        const studentData = [
            { name: 'Alex Rivera', email: 'arivera@student.edu', bio: 'CS Junior | Web Dev Enthusiast', loc: 'New York', skills: ['HTML', 'CSS', 'JS'] },
            { name: 'Jordan Lee', email: 'jlee@student.edu', bio: 'Sophomore | Data Science Lead', loc: 'Boston', skills: ['Python', 'SQL', 'R'] },
            { name: 'Maya Patel', email: 'mpatel@student.edu', bio: 'Final Year CS | Blockchain Researcher', loc: 'Chicago', skills: ['Solidity', 'Rust', 'Linux'] }
        ];

        for (const s of studentData) {
            await User.create({
                name: s.name,
                email: s.email,
                password: studentPassword,
                role: 'student',
                bio: s.bio,
                location: s.loc,
                skills: s.skills,
                isApproved: true
            });
        }
        console.log('10 Users seeded!');

        const { Donation, Feedback, Story, Mentorship } = require('./models');

        // 2. Create 10 Donations
        const donationData = [
            { ft: 'Scholarship Fund', amt: 5000, donor: createdAlumni[0] },
            { ft: 'Infrastructure Dev', amt: 15000, donor: createdAlumni[1] },
            { ft: 'R&D Grants', amt: 25000, donor: createdAlumni[2] },
            { ft: 'Event Sponsorship', amt: 8000, donor: createdAlumni[3] },
            { ft: 'Scholarship Fund', amt: 2000, donor: createdAlumni[4] }
        ];

        for (const d of donationData) {
            await Donation.create({
                donorId: d.donor.id,
                fundType: d.ft,
                amount: d.amt,
                status: 'Completed',
                receiptId: `REC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
            });
        }
        console.log('Donations seeded!');

        // 3. Create 5 Feedback
        await Feedback.create({ name: 'Alex Rivera', email: 'arivera@student.edu', type: 'Bug Report', message: 'The sidebar overlaps on mobile devices.', status: 'New' });
        await Feedback.create({ name: 'Jordan Lee', email: 'jlee@student.edu', type: 'Feature Request', message: 'Would love a dark mode toggle.', status: 'New' });
        await Feedback.create({ name: 'Sarah Chen', email: 'sarah.chen@google.com', type: 'General', message: 'The portal looks amazing!', status: 'Reviewed' });
        console.log('Feedback seeded!');

        // 4. Create 3 Success Stories
        await Story.create({ userId: createdAlumni[0].id, name: 'Sarah Chen', batch: '2018', role: 'Tech Lead @ Google', quote: 'The networking here changed my life.', achievement: 'Founded DevConnect.', isPublished: true });
        await Story.create({ userId: createdAlumni[1].id, name: 'Michael Ross', batch: '2015', role: 'Senior PM @ Tesla', quote: 'Our alumni network is my biggest asset.', achievement: 'Designed Model 3 Infotainment.', isPublished: true });
        console.log('Stories seeded!');

        // 2. Create 10 Jobs
        const jobData = [
            { title: 'Frontend Intern', company: 'Google', loc: 'Remote', type: 'Internship', sal: '$8k/mo', desc: 'Work on Chrome UI with React.', author: createdAlumni[0] },
            { title: 'SDE II', company: 'Tesla', loc: 'Austin', type: 'Full-time', sal: '$180k', desc: 'Embedded systems for autonomous driving.', author: createdAlumni[1] },
            { title: 'Full Stack Engineer', company: 'Meta', loc: 'Menlo Park', type: 'Full-time', sal: '$210k', desc: 'Scaling social infrastructure with React and GraphQL.', author: createdAlumni[2] },
            { title: 'Cloud Architect', company: 'AWS', loc: 'Seattle', type: 'Full-time', sal: '$190k', desc: 'Designing resilient cloud solutions.', author: createdAlumni[3] },
            { title: 'UI Architect', company: 'Netflix', loc: 'Remote', type: 'Full-time', sal: '$250k', desc: 'High-performance UI components for streaming.', author: createdAlumni[4] },
            { title: 'Deep Learning Intern', company: 'NVIDIA', loc: 'Santa Clara', type: 'Internship', sal: '$9k/mo', desc: 'Training LLMs on H100 GPU clusters.', author: createdAlumni[0] },
            { title: 'Backend Dev', company: 'Spotify', loc: 'Stockholm', type: 'Full-time', sal: '$140k', desc: 'Scala and Java backend for music recommendation.', author: createdAlumni[5] },
            { title: 'Cybersecurity Analyst', company: 'Microsoft', loc: 'Redmond', type: 'Full-time', sal: '$165k', desc: 'Protecting Azure infrastructure from threats.', author: createdAlumni[3] },
            { title: 'Product Designer', company: 'Airbnb', loc: 'San Francisco', type: 'Contract', sal: '$150/hr', desc: 'Designing the next generation of travel experiences.', author: createdAlumni[1] },
            { title: 'Mobile Dev (Swift)', company: 'DoorDash', loc: 'New York', type: 'Full-time', sal: '$160k', desc: 'Flutter and Swift app development.', author: createdAlumni[2] }
        ];

        for (const j of jobData) {
            await Job.create({
                title: j.title,
                company: j.company,
                location: j.loc,
                type: j.type,
                description: j.desc,
                salary: j.sal,
                postedBy: j.author.id
            });
        }
        console.log('10 Jobs seeded!');

        // 3. Create 10 Events
        const eventData = [
            { title: 'Alumni Homecoming 2026', type: 'Meetup', loc: 'Main Campus', desc: 'Reunite with your batchmates!', author: admin },
            { title: 'Big Tech Interview Prep', type: 'Webinar', loc: 'Zoom', desc: 'Sarah Chen shares Google interview secrets.', author: createdAlumni[0] },
            { title: 'AI in 2026 Workshop', type: 'Workshop', loc: 'Menlo Park', desc: 'Elena Gomez leads a deep dive into PyTorch.', author: createdAlumni[2] },
            { title: 'Career Paths in AWS', type: 'Webinar', loc: 'YouTube Live', desc: 'David Kim discusses cloud career trajectories.', author: createdAlumni[3] },
            { title: 'Building Scalable UI', type: 'Workshop', loc: 'Netflix HQ', desc: 'Advanced CSS and React patterns workshop.', author: createdAlumni[4] },
            { title: 'Product Management 101', type: 'Webinar', loc: 'Teams', desc: 'Tesla PM Michael Ross on hardware products.', author: createdAlumni[1] },
            { title: 'SwiftUI Masterclass', type: 'Workshop', loc: 'Apple Park', desc: 'James Wilson on low-level hardware optimizations.', author: createdAlumni[5] },
            { title: 'Cybersecurity Summit', type: 'Conference', loc: 'Convention Center', desc: 'Networking with security professionals.', author: admin },
            { title: 'Startups 101: Pivot & Scale', type: 'Meetup', loc: 'Co-working Space', desc: 'Alumni founders share their struggles.', author: createdAlumni[0] },
            { title: 'LPU Tech Fest 2026', type: 'Conference', loc: 'Science Block', desc: 'The biggest annual tech event on campus.', author: admin }
        ];

        for (const e of eventData) {
            await Event.create({
                title: e.title,
                description: e.desc,
                date: new Date(Date.now() + Math.random() * 1000000000), // Random future date
                location: e.loc,
                type: e.type,
                organizerId: e.author.id
            });
        }
        console.log('10 Events seeded!');

        console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
        process.exit();

    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
