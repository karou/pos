import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useOfflineSync from '../../hooks/useOfflineSync';
import { getOfflineOrders } from '../../services/offline';
import { ordersAPI } from '../../services/api';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/**
 * Orders page for viewing and managing orders
 */
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [offlineOrders, setOfflineOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [error, setError] = useState(null);
  
  const { isOnline } = useOfflineSync();
  const navigate = useNavigate();
  
  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
    fetchOfflineOrders();
  }, [isOnline, statusFilter, dateFilter]);
  
  // Fetch orders from API
  const fetchOrders = async () => {
    if (!isOnline) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = {};
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      // Set date range based on filter
      if (dateFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        params.startDate = today.toISOString();
      } else if (dateFilter === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        params.startDate = yesterday.toISOString();
        params.endDate = today.toISOString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        params.startDate = weekAgo.toISOString();
      }
      
      const response = await ordersAPI.getOrders(params);
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch offline orders
  const fetchOfflineOrders = async () => {
    try {
      const orders = await getOfflineOrders();
      setOfflineOrders(orders);
    } catch (error) {
      console.error('Error fetching offline orders:', error);
    }
  };
  
  // Handle order click - navigate to order details
  const handleOrderClick = (orderId) => {
    navigate(`/orders/${orderId}`);
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'confirmed':
        return 'status-confirmed';
      case 'preparing':
        return 'status-preparing';
      case 'ready':
        return 'status-ready';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };
  
  // Render offline order message
  const renderOfflineOrderRow = (order, index) => (
    <tr key={`offline-${order.offlineId}`} className="offline-order-row">
      <td>{order.offlineId}</td>
      <td>{formatDate(order.createdAt)}</td>
      <td>{formatTime(order.createdAt)}</td>
      <td>
        <span className="status-badge status-offline">Offline</span>
      </td>
      <td>{order.customerName || 'N/A'}</td>
      <td>{order.items.length}</td>
      <td>{formatCurrency(order.total)}</td>
      <td>
        <button className="view-button disabled">
          Pending Sync
        </button>
      </td>
    </tr>
  );
  
  // Render online order row
  const renderOrderRow = (order) => (
    <tr key={order._id} onClick={() => handleOrderClick(order._id)} className="order-row">
      <td>{order.orderNumber}</td>
      <td>{formatDate(order.createdAt)}</td>
      <td>{formatTime(order.createdAt)}</td>
      <td>
        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
          {order.status}
        </span>
      </td>
      <td>{order.customerName || 'N/A'}</td>
      <td>{order.items.length}</td>
      <td>{formatCurrency(order.total)}</td>
      <td>
        <button className="view-button" onClick={(e) => {
          e.stopPropagation();
          handleOrderClick(order._id);
        }}>
          View
        </button>
      </td>
    </tr>
  );
  
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Orders</h1>
        <div className="header-actions">
          <button className="new-order-button" onClick={() => navigate('/pos')}>
            New Order
          </button>
        </div>
      </header>
      
      <div className="orders-filters">
        <div className="filter-group">
          <label htmlFor="statusFilter">Status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="dateFilter">Date:</label>
          <select
            id="dateFilter"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
        
        <button className="refresh-button" onClick={fetchOrders} disabled={!isOnline}>
          Refresh
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="orders-table-container">
        {isLoading ? (
          <div className="loading-container">
            <LoadingSpinner size="large" color="#4a6cfa" />
            <p>Loading orders...</p>
          </div>
        ) : (
          <>
            {!isOnline && (
              <div className="offline-message">
                <p>You are currently offline. Only offline orders are displayed.</p>
              </div>
            )}
            
            {orders.length === 0 && offlineOrders.length === 0 ? (
              <div className="no-orders-message">
                <p>No orders found. Create a new order to get started.</p>
                <button className="new-order-button" onClick={() => navigate('/pos')}>
                  New Order
                </button>
              </div>
            ) : (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Display offline orders first */}
                  {offlineOrders.map(renderOfflineOrderRow)}
                  
                  {/* Display online orders */}
                  {isOnline && orders.map(renderOrderRow)}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;