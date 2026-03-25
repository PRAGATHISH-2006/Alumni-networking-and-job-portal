import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SplashScreen from './components/SplashScreen';
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
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';

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
  const navigate = useNavigate();
  const isAuthPath = location.pathname === '/login' || 
                     location.pathname === '/register' || 
                     location.pathname === '/forgot-password' || 
                     location.pathname.startsWith('/reset-password/');
  const isAdminPath = location.pathname.startsWith('/admin');
  const [showSplash, setShowSplash] = React.useState(true);
  const [splashDone, setSplashDone] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleSplashFinish = () => {
    setShowSplash(false);
    // Wait for exit animation to finish, then always show login page
    setTimeout(() => {
      setSplashDone(true);
      navigate('/login');
    }, 850);
  };

  const isUnapproved = user && user.role !== 'admin' && !user.isApproved;
  const hideSidebar = isAdminPath || user?.role === 'admin' || isAuthPath;

  if (!splashDone) {
    return (
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen key="splash" onFinish={handleSplashFinish} />
        )}
      </AnimatePresence>
    );
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #3b82f6', borderRadius: '50%' }}></div>
    </div>
  );

  return (
    <div className="layout-root">
      {!isAuthPath && <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />}
      <div className={`main-wrapper${isAuthPath ? ' auth-wrapper' : ''}`}>
        {!hideSidebar && (
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
          />
        )}
        <main className={`content-area ${hideSidebar ? 'full-width' : ''} ${isAuthPath ? 'auth-page-wrapper' : ''}`}>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" />} />
            <Route path="/reset-password/:token" element={!user ? <ResetPassword /> : <Navigate to="/" />} />
            
            <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
            
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
