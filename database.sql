-- Alumni Portal Database Dump
-- Compatible with MySQL / MariaDB (XAMPP)

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `alumni_portal`
--
CREATE DATABASE IF NOT EXISTS `alumni_portal` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `alumni_portal`;

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','alumni','student') DEFAULT 'student',
  `bio` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `skills` text DEFAULT NULL,
  `isApproved` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `Users`
-- (Passwords are hashed 'admin123', 'alumni123', 'student123')
--

INSERT INTO `Users` (`id`, `name`, `email`, `password`, `role`, `bio`, `location`, `skills`, `isApproved`, `createdAt`, `updatedAt`) VALUES
('0a4f552b-40d1-a0bf-6105-f48e6540ce81', 'System Admin', 'admin@college.edu', '$2a$12$L7pY.G9R.k8R8.X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8S', 'admin', NULL, NULL, NULL, 1, NOW(), NOW()),
('3dccd59e-678b-4b1a-9c1a-1a2b3c4d5e6f', 'Sarah Chen', 'sarah.chen@google.com', '$2a$12$Z.8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8S', 'alumni', 'Software Engineer at Google | L6 | Tech Lead', 'Mountain View, CA', '[\"Java\",\"Distributed Systems\",\"Go\"]', 1, NOW(), NOW());

-- --------------------------------------------------------

--
-- Table structure for table `Jobs`
--

CREATE TABLE `Jobs` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(255) NOT NULL,
  `company` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `type` enum('Full-time','Part-time','Internship','Contract') DEFAULT 'Full-time',
  `description` text NOT NULL,
  `salary` varchar(255) DEFAULT NULL,
  `postedBy` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `postedBy` (`postedBy`),
  CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`postedBy`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `Jobs`
--

INSERT INTO `Jobs` (`id`, `title`, `company`, `location`, `type`, `description`, `salary`, `postedBy`, `createdAt`, `updatedAt`) VALUES
('7b8c9d0e-1f2a-3b4c-5d6e-7f8a9b0c1d2e', 'Frontend Developer Intern', 'Google', 'Remote/Mountain View', 'Internship', 'Join the Chrome team as a frontend intern. Work with React and TypeScript on cutting-edge features.', '$8000/month', '3dccd59e-678b-4b1a-9c1a-1a2b3c4d5e6f', NOW(), NOW());

-- --------------------------------------------------------

--
-- Table structure for table `Events`
--

CREATE TABLE `Events` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `date` datetime NOT NULL,
  `location` varchar(255) NOT NULL,
  `type` enum('Webinar','Meetup','Workshop','Conference') DEFAULT 'Webinar',
  `imageUrl` varchar(255) DEFAULT NULL,
  `organizerId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `organizerId` (`organizerId`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`organizerId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `Events`
--

INSERT INTO `Events` (`id`, `title`, `description`, `date`, `location`, `type`, `imageUrl`, `organizerId`, `createdAt`, `updatedAt`) VALUES
('9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d', 'Annual Alumni Homecoming 2026', 'Join us back on campus for a night of networking and nostalgia.', '2026-06-15 18:00:00', 'Main Auditorium, College Campus', 'Meetup', NULL, '0a4f552b-40d1-a0bf-6105-f48e6540ce81', NOW(), NOW());

-- --------------------------------------------------------

--
-- Table structure for table `Mentorships`
--

CREATE TABLE `Mentorships` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` enum('Pending','Accepted','Rejected') DEFAULT 'Pending',
  `message` text DEFAULT NULL,
  `topic` varchar(255) DEFAULT NULL,
  `mentorId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `studentId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `mentorId` (`mentorId`),
  KEY `studentId` (`studentId`),
  CONSTRAINT `mentorships_ibfk_1` FOREIGN KEY (`mentorId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `mentorships_ibfk_2` FOREIGN KEY (`studentId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `EventAttendees`
--

CREATE TABLE `EventAttendees` (
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `EventId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `UserId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`EventId`,`UserId`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `eventattendees_ibfk_1` FOREIGN KEY (`EventId`) REFERENCES `Events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `eventattendees_ibfk_2` FOREIGN KEY (`UserId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `JobApplicants`
--

CREATE TABLE `JobApplicants` (
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `JobId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `UserId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`JobId`,`UserId`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `jobapplicants_ibfk_1` FOREIGN KEY (`JobId`) REFERENCES `Jobs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `jobapplicants_ibfk_2` FOREIGN KEY (`UserId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;
