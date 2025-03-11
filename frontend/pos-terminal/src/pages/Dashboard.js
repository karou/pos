// src/pages/Dashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Navigation handlers
  const navigateTo = (path) => {
    navigate(path);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>POS System Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name || 'User'}</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>
      
      <main className="dashboard-content">
        <div className="menu-tiles">
          <div className="menu-tile" onClick={() => navigateTo('/pos')}>
            <div className="tile-icon">🛒</div>
            <h2>POS Terminal</h2>
            <p>Process sales and orders</p>
          </div>
          
          <div className="menu-tile" onClick={() => navigateTo('/inventory')}>
            <div className="tile-icon">📦</div>
            <h2>Inventory</h2>
            <p>Manage products and stock</p>
          </div>
          
          <div className="menu-tile" onClick={() => navigateTo('/reports')}>
            <div className="tile-icon">📊</div>
            <h2>Reports</h2>
            <p>View sales and analytics</p>
          </div>
          
          <div className="menu-tile" onClick={() => navigateTo('/settings')}>
            <div className="tile-icon">⚙️</div>
            <h2>Settings</h2>
            <p>Configure system settings</p>
          </div>
        </div>
      </main>
      
      <footer className="dashboard-footer">
        <p>POS System Version 1.0.0</p>
      </footer>
    </div>
  );
};

export default Dashboard;