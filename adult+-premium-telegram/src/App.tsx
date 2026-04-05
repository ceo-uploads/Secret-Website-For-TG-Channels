import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Home } from './pages/Home';
import { Channels } from './pages/Channels';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AdminPortal } from './pages/AdminPortal';
import { BottomNav } from './components/BottomNav';
import { FloatingTelegram } from './components/FloatingTelegram';
import { AnimatePresence } from 'motion/react';

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isAdmin = new URLSearchParams(location.search).get('admin') === 'true';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (isAdmin) {
    return <AdminPortal />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20 font-sans selection:bg-purple-500/30">
      <AnimatePresence mode="wait">
        <Routes location={location}>
          <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
          <Route path="/channels" element={user ? <Channels /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
      
      {user && <BottomNav />}
      <FloatingTelegram />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
