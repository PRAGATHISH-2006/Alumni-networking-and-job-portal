-- Alumni Portal - Supabase/PostgreSQL Initialization Script

-- 1. Create ENUM Types
DO $$ BEGIN
    CREATE TYPE "enum_Users_role" AS ENUM('admin', 'alumni', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "enum_Jobs_type" AS ENUM('Full-time', 'Part-time', 'Internship', 'Contract');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "enum_Events_type" AS ENUM('Webinar', 'Meetup', 'Workshop', 'Conference');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "enum_Mentorships_status" AS ENUM('Pending', 'Accepted', 'Rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "enum_Donations_status" AS ENUM('Pending', 'Completed', 'Failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "enum_Feedbacks_status" AS ENUM('New', 'Reviewed', 'Resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "enum_jobapplicants_status" AS ENUM('Pending', 'Accepted', 'Rejected', 'Interview Scheduled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "enum_jobapplicants_interviewType" AS ENUM('Online', 'Offline');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Tables

CREATE TABLE IF NOT EXISTS "Users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "role" "enum_Users_role" DEFAULT 'student',
    "bio" TEXT,
    "location" VARCHAR(255),
    "skills" JSONB DEFAULT '[]',
    "isApproved" BOOLEAN DEFAULT false,
    "batch" VARCHAR(255),
    "department" VARCHAR(255),
    "company" VARCHAR(255),
    "position" VARCHAR(255),
    "experience" TEXT,
    "interests" JSONB DEFAULT '[]',
    "institution" VARCHAR(255) DEFAULT 'Lovely Professional University',
    "links" JSONB DEFAULT '[]',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Jobs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "company" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "type" "enum_Jobs_type" DEFAULT 'Full-time',
    "description" TEXT NOT NULL,
    "salary" VARCHAR(255),
    "postedBy" UUID REFERENCES "Users"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Events" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMPTZ NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "type" "enum_Events_type" DEFAULT 'Webinar',
    "imageUrl" VARCHAR(255),
    "price" DECIMAL(10, 2) DEFAULT 0,
    "organizerId" UUID REFERENCES "Users"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "EventAttendees" (
    "jobStatus" VARCHAR(255),
    "company" VARCHAR(255),
    "regNo" VARCHAR(255),
    "college" VARCHAR(255),
    "batch" VARCHAR(255),
    "dept" VARCHAR(255),
    "dietary" VARCHAR(255),
    "interests" TEXT,
    "paymentMethod" VARCHAR(255),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "EventId" UUID REFERENCES "Events"("id") ON DELETE CASCADE,
    "UserId" UUID REFERENCES "Users"("id") ON DELETE CASCADE,
    PRIMARY KEY ("EventId", "UserId")
);

CREATE TABLE IF NOT EXISTS "jobapplicants" (
    "id" SERIAL PRIMARY KEY,
    "resumePath" VARCHAR(255),
    "details" TEXT,
    "status" "enum_jobapplicants_status" DEFAULT 'Pending',
    "interviewDate" TIMESTAMPTZ,
    "interviewType" "enum_jobapplicants_interviewType",
    "adminMessage" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "JobId" UUID REFERENCES "Jobs"("id") ON DELETE CASCADE,
    "UserId" UUID REFERENCES "Users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Mentorships" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "status" "enum_Mentorships_status" DEFAULT 'Pending',
    "message" TEXT,
    "topic" VARCHAR(255),
    "mentorId" UUID REFERENCES "Users"("id") ON DELETE SET NULL,
    "studentId" UUID REFERENCES "Users"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Messages" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN DEFAULT false,
    "imageUrl" VARCHAR(255),
    "senderId" UUID REFERENCES "Users"("id") ON DELETE SET NULL,
    "receiverId" UUID REFERENCES "Users"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Donations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "fundType" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(10, 2) NOT NULL,
    "paymentMethod" VARCHAR(255) DEFAULT 'card',
    "status" "enum_Donations_status" DEFAULT 'Completed',
    "receiptId" VARCHAR(255) UNIQUE,
    "donorId" UUID REFERENCES "Users"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Stories" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "batch" VARCHAR(255),
    "role" VARCHAR(255),
    "quote" TEXT NOT NULL,
    "achievement" TEXT NOT NULL,
    "isPublished" BOOLEAN DEFAULT false,
    "userId" UUID REFERENCES "Users"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Feedbacks" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "status" "enum_Feedbacks_status" DEFAULT 'New',
    "adminResponse" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Initial Admin User (Password is 'admin123')
INSERT INTO "Users" ("id", "name", "email", "password", "role", "isApproved")
VALUES ('0a4f552b-40d1-a0bf-6105-f48e6540ce81', 'System Admin', 'admin@college.edu', '$2a$12$L7pY.G9R.k8R8.X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8S', 'admin', true)
ON CONFLICT (email) DO NOTHING;
