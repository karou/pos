import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Sample sales data
const salesData = [
  { date: '2025-03-01', totalSales: 1250.75, orderCount: 85, avgOrderValue: 14.71 },
  { date: '2025-03-02', totalSales: 1345.50, orderCount: 92, avgOrderValue: 14.63 },
  { date: '2025-03-03', totalSales: 1089.25, orderCount: 73, avgOrderValue: 14.92 },
  { date: '2025-03-04', totalSales: 1156.00, orderCount: 79, avgOrderValue: 14.63 },
  { date: '2025-03-05', totalSales: 1425.30, orderCount: 95, avgOrderValue: 15.00 },
  { date: '2025-03-06', totalSales: 1562.75, orderCount: 101, avgOrderValue: 15.47 },
  { date: '2025-03-07', totalSales: 1887.50, orderCount: 125, avgOrderValue: 15.10 }
];

// Sample popular items
const popularItems = [
  { name: 'Classic Milk Tea', quantity: 278, revenue: 1251.00 },
  { name: 'Taro Milk Tea', quantity: 215, revenue: 1075.00 },
  { name: 'Brown Sugar Boba Tea', quantity: 187, revenue: 1028.50 },
  { name: 'Mango Green Tea', quantity: 156, revenue: 819.00 },
  { name: 'Matcha Latte', quantity: 142, revenue: 816.50 }
];

const ReportsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reportType, setReportType] = useState('sales'); // 'sales', 'products', 'customers'
  const [dateRange, setDateRange] = useState('week'); // 'day', 'week', 'month', 'year'
  
  // Calculate total sales and orders
  const totalSales = salesData.reduce((sum, day) => sum + day.totalSales, 0);
  const totalOrders = salesData.reduce((sum, day) => sum + day.orderCount, 0);
  const avgOrderValue = totalSales / totalOrders;
  
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Reports & Analytics</h1>
        <div className="user-info">
          <span>{user?.name || 'User'}</span>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Dashboard
          </button>
        </div>
      </header>
      
      <div className="page-content">
        <div className="reports-summary">
          <div className="summary-card">
            <h3>Total Sales</h3>
            <div className="summary-value">${totalSales.toFixed(2)}</div>
          </div>
          <div className="summary-card">
            <h3>Total Orders</h3>
            <div className="summary-value">{totalOrders}</div>
          </div>
          <div className="summary-card">
            <h3>Avg. Order Value</h3>
            <div className="summary-value">${avgOrderValue.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="reports-controls">
          <div className="report-types">
            <button 
              className={reportType === 'sales' ? 'active' : ''}
              onClick={() => setReportType('sales')}
            >
              Sales Report
            </button>
            <button 
              className={reportType === 'products' ? 'active' : ''}
              onClick={() => setReportType('products')}
            >
              Product Performance
            </button>
            <button 
              className={reportType === 'customers' ? 'active' : ''}
              onClick={() => setReportType('customers')}
            >
              Customer Insights
            </button>
          </div>
          
          <div className="date-range">
            <button 
              className={dateRange === 'day' ? 'active' : ''}
              onClick={() => setDateRange('day')}
            >
              Today
            </button>
            <button 
              className={dateRange === 'week' ? 'active' : ''}
              onClick={() => setDateRange('week')}
            >
              This Week
            </button>
            <button 
              className={dateRange === 'month' ? 'active' : ''}
              onClick={() => setDateRange('month')}
            >
              This Month
            </button>
            <button 
              className={dateRange === 'year' ? 'active' : ''}
              onClick={() => setDateRange('year')}
            >
              This Year
            </button>
          </div>
        </div>
        
        {reportType === 'sales' && (
          <div className="report-section">
            <h2>Sales Report - {getDateRangeText(dateRange)}</h2>
            
            <div className="chart-placeholder">
              <div className="chart-message">Bar chart showing daily sales would appear here</div>
            </div>
            
            <div className="report-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Total Sales</th>
                    <th>Orders</th>
                    <th>Avg. Order Value</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((day, index) => (
                    <tr key={index}>
                      <td>{formatDate(day.date)}</td>
                      <td>${day.totalSales.toFixed(2)}</td>
                      <td>{day.orderCount}</td>
                      <td>${day.avgOrderValue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {reportType === 'products' && (
          <div className="report-section">
            <h2>Product Performance - {getDateRangeText(dateRange)}</h2>
            
            <div className="chart-placeholder">
              <div className="chart-message">Pie chart showing product distribution would appear here</div>
            </div>
            
            <h3>Top Selling Products</h3>
            <div className="report-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {popularItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>${item.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {reportType === 'customers' && (
          <div className="report-section">
            <h2>Customer Insights - {getDateRangeText(dateRange)}</h2>
            
            <div className="placeholder-content">
              <p>Customer insights data is not available in this demo.</p>
              <p>In a full implementation, this section would show:</p>
              <ul>
                <li>New vs. returning customers</li>
                <li>Customer demographics</li>
                <li>Popular ordering times</li>
                <li>Customer loyalty statistics</li>
              </ul>
            </div>
          </div>
        )}
        
        <div className="report-actions">
          <button className="primary-button">Export Report</button>
          <button className="secondary-button">Print Report</button>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function getDateRangeText(range) {
  const today = new Date();
  switch (range) {
    case 'day':
      return formatDate(today.toISOString().split('T')[0]);
    case 'week':
      return 'Past 7 Days';
    case 'month':
      return `${today.toLocaleString('default', { month: 'long' })} ${today.getFullYear()}`;
    case 'year':
      return today.getFullYear().toString();
    default:
      return '';
  }
}

function formatDate(dateString) {
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

export default ReportsPage;