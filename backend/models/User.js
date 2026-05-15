const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'alumni', 'student'),
        defaultValue: 'student'
    },
    bio: {
        type: DataTypes.TEXT
    },
    location: {
        type: DataTypes.STRING
    },
    skills: {
        type: DataTypes.TEXT, // Store as JSON string or comma-separated
        get() {
            const rawValue = this.getDataValue('skills');
            try {
                return rawValue ? JSON.parse(rawValue) : [];
            } catch (e) {
                return [];
            }
        },
        set(value) {
            this.setDataValue('skills', JSON.stringify(value || []));
        }
    },
    resumeUrl: {
        type: DataTypes.STRING
    },
    company: {
        type: DataTypes.STRING
    },
    position: {
        type: DataTypes.STRING
    },
    batch: {
        type: DataTypes.STRING
    },
    department: {
        type: DataTypes.STRING
    },
    experience: {
        type: DataTypes.TEXT
    },
    interests: {
        type: DataTypes.TEXT,
        get() {
            const rawValue = this.getDataValue('interests');
            try {
                return rawValue ? JSON.parse(rawValue) : [];
            } catch (e) {
                return [];
            }
        },
        set(value) {
            this.setDataValue('interests', JSON.stringify(value || []));
        }
    },
    institution: {
        type: DataTypes.STRING,
        defaultValue: 'Lovely Professional University'
    },
    links: {
        type: DataTypes.TEXT,
        get() {
            const rawValue = this.getDataValue('links');
            try {
                return rawValue ? JSON.parse(rawValue) : [];
            } catch (e) {
                return [];
            }
        },
        set(value) {
            this.setDataValue('links', JSON.stringify(value || []));
        }
    },
    isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetPasswordExpire: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    hooks: {
        beforeSave: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 12);
            }
        }
    }
});

User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
