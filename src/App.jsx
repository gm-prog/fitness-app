import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import InfoPage from './components/InfoPage'
import Dashboard from './components/Dashboard'

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import apiClient from './lib/apiClient';

const ProtectedRoute = ({ children }) => {
  const token = apiClient.getToken();
  return token ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/info" 
          element={
            <ProtectedRoute>
              <InfoPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
