<div align="center">
  <img src="https://img.icons8.com/color/96/000000/network--v1.png" alt="Logo"/>
  
  # 🎓 Alumni Networking and Job Portal
  
  **A powerful platform bridging the gap between alumni, students, and institutions.**
  
  [![Live Demo](https://img.shields.io/badge/Live_Demo-Available-success?style=for-the-badge&logo=vercel)](https://alumni-networking-and-job-portal.vercel.app/)
  [![Tech Stack](https://img.shields.io/badge/Tech_Stack-React_Express_SQL-blue?style=for-the-badge)](#-tech-stack)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#-license)

  <p align="center">
    <a href="#-about-the-project">About</a> •
    <a href="#-key-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-project-structure">Structure</a>
  </p>
</div>

---

## 🌟 About the Project

The **Alumni Networking and Job Portal** is a comprehensive full-stack application designed to foster meaningful connections between university alumni and current students. It serves as a central hub for professional networking, mentorship, event discovery, and career advancement.

By leveraging a robust backend architecture and an interactive frontend, this platform empowers institutions to maintain active and engaging alumni communities while providing students with invaluable resources for their professional growth.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| 🧑‍🎓 **User Profiles & Networking** | Comprehensive profiles for Alumni, Students, and Admins. Connect and network efficiently. |
| 💼 **Job Portal** | Dedicated job board where alumni can post openings and students can apply for opportunities. |
| 🤝 **Mentorship Program** | Facilitates mentorship connections between experienced alumni and current students. |
| 📅 **Event Management** | Browse, create, and RSVP to upcoming university or alumni events and reunions. |
| 📖 **Success Stories** | Share and read inspiring success stories from notable alumni members. |
| 💬 **Messaging System** | Direct messaging feature to facilitate communication within the community. |
| 💰 **Donations & Fundraising** | Secure module for alumni to contribute to institutional funds and campaigns. |
| 📊 **Admin Dashboard** | Powerful administrative controls to manage users, content, and platform settings. |

---

## 🛠️ Tech Stack

### Frontend
*   **React** - UI Library
*   **Vite** - Build Tool
*   **React Router** - Navigation
*   **Framer Motion** - Animations & Transitions
*   **Lucide React** - Beautiful Icons
*   **Axios** - API Client

### Backend
*   **Node.js & Express** - Server Environment & Framework
*   **Sequelize** - Modern ORM for Node.js
*   **PostgreSQL / Supabase** - Primary Relational Database
*   **MySQL** - Relational Database (Alternative/Local)
*   **JWT & bcryptjs** - Authentication & Security
*   **Multer** - File Upload Handling

---

## 🚀 Live Demo

Experience the platform live:
👉 **[Alumni Networking and Job Portal](https://alumni-networking-and-job-portal.vercel.app/)**

---

## 💻 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [Supabase Account](https://supabase.com/) (Optional, for PostgreSQL database) or [MySQL Server](https://dev.mysql.com/downloads/mysql/) (for local database)

### Installation Steps

1.  **Clone the repository** (if applicable):
    ```bash
    git clone https://github.com/your-username/Alumni-networking-and-job-portal.git
    cd Alumni-networking-and-job-portal
    ```

2.  **Database Setup**:
    *   **Option A: PostgreSQL / Supabase (Recommended)**:
        *   Create a new project on [Supabase](https://supabase.com/).
        *   Execute the SQL queries in `supabase_setup.sql` in the Supabase SQL editor to set up tables.
        *   Copy the database URL/Connection String and set it as `DATABASE_URL` in `backend/.env`.
    *   **Option B: Local MySQL**:
        *   Create a new MySQL database for the project.
        *   Update the database configuration variables (`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`) in `backend/.env`.
        *   (Optional) Run the provided `database.sql` script to initialize the schema.

3.  **Backend Setup**:
    ```bash
    cd backend
    npm install
    # Set up your .env file here based on requirements
    npm run dev
    ```

4.  **Frontend Setup**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

5.  **Access the Application**:
    Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite).

---

## 📂 Project Structure

```text
Alumni-networking-and-job-portal/
├── backend/                  # Express server, controllers, models, routes
│   ├── config/               # Database configuration
│   ├── controllers/          # Business logic
│   ├── models/               # Sequelize models (User, Job, Event, etc.)
│   ├── routes/               # API endpoints
│   └── server.js             # Entry point
│
├── frontend/                 # React application (Vite)
│   ├── src/                  # React components, pages, context
│   ├── public/               # Static assets
│   └── vite.config.js        # Vite configuration
│
└── README.md                 # Project documentation
```

---

<div align="center">
  <i>Developed with ❤️ for building stronger alumni communities.</i>
</div>
