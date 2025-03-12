import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoutes from './ProtectedRoutes';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';
import Home from './pages/Home';
import HistoricalConsumptionPage from './pages/HistoricalConsumptionPage';
import AdminChat from './pages/chat/AdminChat';
import ClientChat from './pages/chat/ClientChat';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/historical-consumption" element={<HistoricalConsumptionPage />} />
        <Route path="/" element={<Home />} />
        <Route path='/adminChat' element={<AdminChat />} />
        <Route path='/clientChat' element={<ClientChat />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
