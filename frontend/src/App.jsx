import { useEffect, useState, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import './app.css';
import EmailVerify from './pages/EmailVerify';
import ResetPassword from './pages/ResetPassword';
import { ToastContainer } from 'react-toastify';
import HomePage from './pages/HomePage';
import FitnessProfile from './pages/FitnessProfile';
import Dashboard from './pages/Dashboard';
import DashboardMain from './pages/DashboardMain';
import FriendsMain from './pages/FriendsMain';
import DonateMain from './pages/DonateMain';
import CommentSection from './components/CommentSection';
import { SocketContext } from './context/SocketContext';
import { AuthContext } from './context/AuthContext';

const App = () => {
  const socket = useContext(SocketContext);
  const { userData } = useContext(AuthContext);

  useEffect(() => {
    if (socket && userData?.id) {
      socket.emit("register", userData.id);
    }
  }, [socket, userData]);

  return (
    <>
      <ToastContainer />
      <Routes>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* FIX FOR /dashboard */}
        <Route path="/dashboard" element={<Navigate to="/home/dashboard" />} />

        <Route path="/home" element={<HomePage />}>
          <Route path="fitness-profile" element={<FitnessProfile />} />

          <Route path="dashboard" element={<Dashboard />}>
            <Route index element={<DashboardMain />} />
            <Route path="main" element={<DashboardMain />} />
            <Route path="friends" element={<FriendsMain />} />
            <Route path="donate" element={<DonateMain />} />
            <Route path="comments" element={<CommentSection />} />
          </Route>

        </Route>

      </Routes>
    </>
  );
};

export default App;