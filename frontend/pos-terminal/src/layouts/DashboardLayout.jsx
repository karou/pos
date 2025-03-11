import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOfflineSync } from '../hooks/useOfflineSync';
import Notification from '../components/common/Notification';
import '../styles/Layout.css';

/**
 * Main dashboard layout with navigation and header
 */
const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isOnline, pendingSyncCount, isSyncing, sync } = useOfflineSync();
  
  // Check if user is authenticated, redirect to login if not
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  // Check if menu item is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Trigger sync
  const handleSync = async () => {
    try {
      await sync();
    } catch (error) {
      console.error('Sync error:', error);
    }
  };
  
  if (!user) {
    return null; // Return nothing until redirect happens
  }
  
  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h1 className="app-logo">POS System</h1>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        
        <div className="sidebar-content">
          <nav className="sidebar-nav">
            <ul className="nav-items">
              <li className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                  <span className="nav-icon">🏠</span>
                  <span className="nav-text">Dashboard</span>
                </a>
              </li>
              <li className={`nav-item ${isActive('/pos') ? 'active' : ''}`}>
                <a href="/pos" onClick={(e) => { e.preventDefault(); navigate('/pos'); }}>
                  <span className="nav-icon">🛒</span>
                  <span className="nav-text">POS Terminal</span>
                </a>
              </li>
              <li className={`nav-item ${isActive('/orders') ? 'active' : ''}`}>
                <a href="/orders" onClick={(e) => { e.preventDefault(); navigate('/orders'); }}>
                  <span className="nav-icon">📋</span>
                  <span className="nav-text">Orders</span>
                </a>
              </li>
              <li className={`nav-item ${isActive('/inventory') ? 'active' : ''}`}>
                <a href="/inventory" onClick={(e) => { e.preventDefault(); navigate('/inventory'); }}>
                  <span className="nav-icon">📦</span>
                  <span className="nav-text">Inventory</span>
                </a>
              </li>
              <li className={`nav-item ${isActive('/reports') ? 'active' : ''}`}>
                <a href="/reports" onClick={(e) => { e.preventDefault(); navigate('/reports'); }}>
                  <span className="nav-icon">📊</span>
                  <span className="nav-text">Reports</span>
                </a>
              </li>
              <li className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
                <a href="/settings" onClick={(e) => { e.preventDefault(); navigate('/settings'); }}>
                  <span className="nav-icon">⚙️</span>
                  <span className="nav-text">Settings</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="sidebar-footer">
          {!isOnline && (
            <div className="offline-indicator">
              <span className="offline-icon">📴</span>
              <span className="offline-text">Offline Mode</span>
            </div>
          )}
          
          {pendingSyncCount > 0 && (
            <button
              className="sync-button"
              onClick={handleSync}
              disabled={isSyncing || !isOnline}
            >
              {isSyncing ? 'Syncing...' : `Sync (${pendingSyncCount})`}
            </button>
          )}
          
          <div className="user-info">
            <div className="user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
          
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <header className="main-header">
          <div className="header-left">
            {/* Location info */}
            <div className="store-info">
              <h2>Main Store</h2>
              <span className="store-status">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          
          <div className="header-right">
            {/* Current date/time */}
            <div className="date-time">
              <CurrentDateTime />
            </div>
          </div>
        </header>
        
        <main className="content-wrapper">
          <Outlet />
        </main>
      </div>
      
      {/* Notifications */}
      <Notification />
    </div>
  );
};

// Current date/time component
const CurrentDateTime = () => {
  const [dateTime, setDateTime] = useState(new Date());
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };
  
  const formatTime = (date) => {
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return date.toLocaleTimeString(undefined, options);
  };
  
  return (
    <div>
      <div className="current-date">{formatDate(dateTime)}</div>
      <div className="current-time">{formatTime(dateTime)}</div>
    </div>
  );
};

export default DashboardLayout;