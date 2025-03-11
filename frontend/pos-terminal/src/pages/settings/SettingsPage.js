import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general'); // general, users, store, receipts, system
  
  // Sample store settings
  const [storeSettings, setStoreSettings] = useState({
    name: 'Bubble Tea Shop',
    address: '123 Main Street',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
    phone: '555-123-4567',
    email: 'info@bubbletea.example',
    taxRate: 7.0
  });
  
  // Sample receipt settings
  const [receiptSettings, setReceiptSettings] = useState({
    showLogo: true,
    showAddress: true,
    showPhone: true,
    headerText: 'Thank you for your order!',
    footerText: 'Please come again!',
    includeTaxDetails: true,
    showOrderNumber: true
  });
  
  // Sample users
  const users = [
    { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'Administrator' },
    { id: 2, name: 'Manager User', email: 'manager@example.com', role: 'Manager' },
    { id: 3, name: 'Cashier 1', email: 'cashier1@example.com', role: 'Cashier' },
    { id: 4, name: 'Cashier 2', email: 'cashier2@example.com', role: 'Cashier' }
  ];
  
  // Sample system settings
  const [systemSettings, setSystemSettings] = useState({
    language: 'English',
    theme: 'Light',
    enableOfflineMode: true,
    autoSyncInterval: 5, // minutes
    sessionTimeout: 30, // minutes
    enableNotifications: true
  });
  
  // Handle input change for store settings
  const handleStoreSettingChange = (e) => {
    const { name, value } = e.target;
    setStoreSettings({
      ...storeSettings,
      [name]: value
    });
  };
  
  // Handle checkbox change for receipt settings
  const handleReceiptSettingChange = (e) => {
    const { name, checked, value, type } = e.target;
    setReceiptSettings({
      ...receiptSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle system setting change
  const handleSystemSettingChange = (e) => {
    const { name, value, checked, type } = e.target;
    setSystemSettings({
      ...systemSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Settings</h1>
        <div className="user-info">
          <span>{user?.name || 'User'}</span>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Dashboard
          </button>
        </div>
      </header>
      
      <div className="page-content settings-content">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            <button 
              className={activeTab === 'general' ? 'active' : ''}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button 
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
            <button 
              className={activeTab === 'store' ? 'active' : ''}
              onClick={() => setActiveTab('store')}
            >
              Store
            </button>
            <button 
              className={activeTab === 'receipts' ? 'active' : ''}
              onClick={() => setActiveTab('receipts')}
            >
              Receipts
            </button>
            <button 
              className={activeTab === 'system' ? 'active' : ''}
              onClick={() => setActiveTab('system')}
            >
              System
            </button>
          </nav>
        </div>
        
        <div className="settings-main">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2>General Settings</h2>
              
              <div className="settings-form">
                <div className="form-section">
                  <h3>Application Information</h3>
                  <div className="info-item">
                    <span className="info-label">Version:</span>
                    <span className="info-value">1.0.0</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Last Updated:</span>
                    <span className="info-value">March 11, 2025</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Database Status:</span>
                    <span className="info-value success">Connected</span>
                  </div>
                </div>
                
                <div className="form-section">
                  <h3>Quick Actions</h3>
                  <div className="action-buttons">
                    <button className="action-button">Sync Data</button>
                    <button className="action-button">Backup Database</button>
                    <button className="action-button">Check for Updates</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'users' && (
            <div className="settings-section">
              <h2>User Management</h2>
              
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          <button className="action-button small">Edit</button>
                          <button className="action-button small danger">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="form-actions">
                <button className="primary-button">Add New User</button>
              </div>
            </div>
          )}
          
          {activeTab === 'store' && (
            <div className="settings-section">
              <h2>Store Settings</h2>
              
              <div className="settings-form">
                <div className="form-group">
                  <label htmlFor="name">Store Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={storeSettings.name}
                    onChange={handleStoreSettingChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={storeSettings.address}
                    onChange={handleStoreSettingChange}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={storeSettings.city}
                      onChange={handleStoreSettingChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={storeSettings.state}
                      onChange={handleStoreSettingChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="zipCode">Zip Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={storeSettings.zipCode}
                      onChange={handleStoreSettingChange}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={storeSettings.phone}
                      onChange={handleStoreSettingChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={storeSettings.email}
                      onChange={handleStoreSettingChange}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="taxRate">Tax Rate (%)</label>
                  <input
                    type="number"
                    id="taxRate"
                    name="taxRate"
                    value={storeSettings.taxRate}
                    onChange={handleStoreSettingChange}
                    step="0.1"
                    min="0"
                  />
                </div>
                
                <div className="form-actions">
                  <button className="primary-button">Save Changes</button>
                  <button className="secondary-button">Cancel</button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'receipts' && (
            <div className="settings-section">
              <h2>Receipt Settings</h2>
              
              <div className="settings-form">
                <div className="form-group checkbox">
                  <input
                    type="checkbox"
                    id="showLogo"
                    name="showLogo"
                    checked={receiptSettings.showLogo}
                    onChange={handleReceiptSettingChange}
                  />
                  <label htmlFor="showLogo">Show Logo on Receipt</label>
                </div>
                
                <div className="form-group checkbox">
                  <input
                    type="checkbox"
                    id="showAddress"
                    name="showAddress"
                    checked={receiptSettings.showAddress}
                    onChange={handleReceiptSettingChange}
                  />
                  <label htmlFor="showAddress">Show Address on Receipt</label>
                </div>
                
                <div className="form-group checkbox">
                  <input
                    type="checkbox"
                    id="showPhone"
                    name="showPhone"
                    checked={receiptSettings.showPhone}
                    onChange={handleReceiptSettingChange}
                  />
                  <label htmlFor="showPhone">Show Phone Number on Receipt</label>
                </div>
                
                <div className="form-group">
                  <label htmlFor="headerText">Receipt Header Text</label>
                  <input
                    type="text"
                    id="headerText"
                    name="headerText"
                    value={receiptSettings.headerText}
                    onChange={handleReceiptSettingChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="footerText">Receipt Footer Text</label>
                  <input
                    type="text"
                    id="footerText"
                    name="footerText"
                    value={receiptSettings.footerText}
                    onChange={handleReceiptSettingChange}
                  />
                </div>
                
                <div className="form-group checkbox">
                  <input
                    type="checkbox"
                    id="includeTaxDetails"
                    name="includeTaxDetails"
                    checked={receiptSettings.includeTaxDetails}
                    onChange={handleReceiptSettingChange}
                  />
                  <label htmlFor="includeTaxDetails">Include Tax Details</label>
                </div>
                
                <div className="form-group checkbox">
                  <input
                    type="checkbox"
                    id="showOrderNumber"
                    name="showOrderNumber"
                    checked={receiptSettings.showOrderNumber}
                    onChange={handleReceiptSettingChange}
                  />
                  <label htmlFor="showOrderNumber">Show Order Number</label>
                </div>
                
                <div className="form-actions">
                  <button className="primary-button">Save Changes</button>
                  <button className="secondary-button">Cancel</button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'system' && (
            <div className="settings-section">
              <h2>System Settings</h2>
              
              <div className="settings-form">
                <div className="form-group">
                  <label htmlFor="language">Language</label>
                  <select
                    id="language"
                    name="language"
                    value={systemSettings.language}
                    onChange={handleSystemSettingChange}
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="Chinese">Chinese</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="theme">Theme</label>
                  <select
                    id="theme"
                    name="theme"
                    value={systemSettings.theme}
                    onChange={handleSystemSettingChange}
                  >
                    <option value="Light">Light</option>
                    <option value="Dark">Dark</option>
                    <option value="System">System</option>
                  </select>
                </div>
                
                <div className="form-group checkbox">
                  <input
                    type="checkbox"
                    id="enableOfflineMode"
                    name="enableOfflineMode"
                    checked={systemSettings.enableOfflineMode}
                    onChange={handleSystemSettingChange}
                  />
                  <label htmlFor="enableOfflineMode">Enable Offline Mode</label>
                </div>
                
                <div className="form-group">
                  <label htmlFor="autoSyncInterval">Auto Sync Interval (minutes)</label>
                  <input
                    type="number"
                    id="autoSyncInterval"
                    name="autoSyncInterval"
                    value={systemSettings.autoSyncInterval}
                    onChange={handleSystemSettingChange}
                    min="1"
                    max="60"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    id="sessionTimeout"
                    name="sessionTimeout"
                    value={systemSettings.sessionTimeout}
                    onChange={handleSystemSettingChange}
                    min="5"
                    max="120"
                  />
                </div>
                
                <div className="form-group checkbox">
                  <input
                    type="checkbox"
                    id="enableNotifications"
                    name="enableNotifications"
                    checked={systemSettings.enableNotifications}
                    onChange={handleSystemSettingChange}
                  />
                  <label htmlFor="enableNotifications">Enable Notifications</label>
                </div>
                
                <div className="form-actions">
                  <button className="primary-button">Save Changes</button>
                  <button className="secondary-button">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;