import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Directory from './pages/Directory';
import Jobs from './pages/Jobs';
import Events from './pages/Events';
import Mentorship from './pages/Mentorship';
import Admin from './pages/Admin';
import Faculty from './pages/Faculty';
import Donations from './pages/Donations';
import Stories from './pages/Stories';
import Feedback from './pages/Feedback';
import News from './pages/News';
import Awards from './pages/Awards';
import Courses from './pages/Courses';
import Support from './pages/Support';
import Magazine from './pages/Magazine';
import Volunteer from './pages/Volunteer';
import FAQ from './pages/FAQ';
import CoursePlayer from './pages/CoursePlayer';
import EventRegister from './pages/EventRegister';
import Profile from './pages/Profile';
import AlumniChat from './pages/AlumniChat';
import { AuthProvider, useAuth } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isAuthPath = location.pathname === '/login' || location.pathname === '/register';
  const isAdminPath = location.pathname.startsWith('/admin');
  const isUnapproved = user && user.role !== 'admin' && !user.isApproved;
  const hideSidebar = isAdminPath || user?.role === 'admin' || isAuthPath;

  if (loading) return null; // Or a loading spinner

  // If logged in, show the full application layout
  return (
    <div className="layout-root">
      {!isAuthPath && <Navbar />}
      <div className="main-wrapper">
        {!hideSidebar && <Sidebar />}
        <main className={`content-area ${hideSidebar ? 'full-width' : ''}`}>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            
            <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
            
            {/* All other routes are restricted if unapproved */}
            {!isUnapproved ? (
              <>
                <Route path="/directory" element={<Directory />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/events" element={<Events />} />
                <Route path="/mentorship" element={<Mentorship />} />
                <Route path="/alumni-chat" element={<AlumniChat />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/faculty" element={<Faculty />} />
                <Route path="/donate" element={<Donations />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/news" element={<News />} />
                <Route path="/awards" element={<Awards />} />
                <Route path="/awards/nominations" element={<Awards mode="nominations" />} />
                <Route path="/alumni/elite" element={<Awards mode="elite" />} />
                <Route path="/alumni/notable" element={<Awards mode="notable" />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/course/:id/play" element={<CoursePlayer />} />
                <Route path="/event/:id/register" element={<EventRegister />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:userId" element={<Profile />} />
              </>
            ) : (
              // If unapproved, any attempt to access restricted routes redirects to home (which shows pending status)
              <Route path="*" element={<Home />} />
            )}
            
            <Route path="/support" element={<Support />} />
            <Route path="/magazine" element={<Magazine />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
