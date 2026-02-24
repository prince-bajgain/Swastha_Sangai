import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
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
import { useContext } from 'react';
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
        <Route
          path="/login"
          element={<LoginPage />}
        />
        <Route
          path="/"
          element={<LandingPage />}
        />
        <Route
          path="/email-verify"
          element={<EmailVerify />}
        />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />
        <Route path='/home' element={<HomePage />}>
          <Route path="fitness-profile" element={<FitnessProfile />} />
          <Route path='/home/dashboard' element={<Dashboard />}>
            <Route path='/home/dashboard/main' element={<DashboardMain />} />
            <Route path='/home/dashboard/friends' element={<FriendsMain />} />
            <Route path='/home/dashboard/donate' element={<DonateMain />} />
          </Route>
        </Route>
      </Routes>
    </>

  )
}

export default App
