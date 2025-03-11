import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';

/**
 * Order details page
 */
const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  
  // Fetch order details on component mount
  useEffect(() => {
    fetchOrderDetails();
  }, [id]);
  
  // Fetch order details from API
  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const response = await ordersAPI.getOrder(id);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to fetch order details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    try {
      setIsUpdating(true);
      
      await ordersAPI.updateOrderStatus(id, newStatus, statusNote);
      
      showSuccess(`Order status updated to ${newStatus}`);
      
      // Refresh order details
      fetchOrderDetails();
      
      // Clear status note
      setStatusNote('');
    } catch (error) {
      console.error('Error updating order status:', error);
      showError('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Get next possible statuses based on current status
  const getNextStatuses = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
        return ['confirmed', 'cancelled'];
      case 'confirmed':
        return ['preparing', 'cancelled'];
      case 'preparing':
        return ['ready', 'cancelled'];
      case 'ready':
        return ['completed', 'cancelled'];
      case 'completed':
        return [];
      case 'cancelled':
        return [];
      default:
        return [];
    }
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
  
  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <LoadingSpinner size="large" color="#4a6cfa" />
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Order not found'}</p>
          <button className="back-button" onClick={() => navigate('/orders')}>
            Back to Orders
          </button>
        </div>
      </div>
    );
  }
  
  // Get next possible statuses
  const nextStatuses = getNextStatuses(order.status);
  
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Order Details</h1>
        <div className="header-actions">
          <button className="back-button" onClick={() => navigate('/orders')}>
            Back to Orders
          </button>
        </div>
      </header>
      
      <div className="order-details-container">
        <div className="order-header">
          <div className="order-info">
            <h2>Order #{order.orderNumber}</h2>
            <p className="order-date">{formatDateTime(order.createdAt)}</p>
            <p className="order-type">
              Type: <span className="order-type-value">{order.orderType}</span>
            </p>
            {order.tableNumber && (
              <p className="order-table">
                Table: <span className="order-table-value">{order.tableNumber}</span>
              </p>
            )}
          </div>
          
          <div className="order-status">
            <p>Status:</p>
            <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
              {order.status}
            </span>
            
            {nextStatuses.length > 0 && (
              <div className="status-actions">
                <p>Update Status:</p>
                <div className="status-buttons">
                  {nextStatuses.map((status) => (
                    <button
                      key={status}
                      className={`status-button ${getStatusBadgeClass(status)}`}
                      onClick={() => handleStatusUpdate(status)}
                      disabled={isUpdating}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                
                <div className="status-note">
                  <label htmlFor="statusNote">Note (optional):</label>
                  <input
                    type="text"
                    id="statusNote"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Add a note about this status change"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="order-body">
          <div className="order-items">
            <h3>Order Items</h3>
            <div className="items-list">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-info">
                    <div className="item-name">
                      <span className="item-quantity">{item.quantity}x</span> {item.name}
                    </div>
                    
                    {/* Show variations */}
                    {item.variations && item.variations.length > 0 && (
                      <div className="item-variations">
                        {item.variations.map((variation, vIndex) => (
                          <span key={vIndex} className="item-variation">
                            {variation.name}: {variation.value}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Show toppings */}
                    {item.toppings && item.toppings.length > 0 && (
                      <div className="item-toppings">
                        {item.toppings.map((topping, tIndex) => (
                          <span key={tIndex} className="item-topping">
                            + {topping.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="item-price">
                    {formatCurrency(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="order-summary">
            <h3>Order Summary</h3>
            
            <div className="summary-info">
              <div className="summary-line">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="summary-line">
                <span>Tax:</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="summary-line total-line">
                <span>Total:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
            
            <div className="payment-info">
              <h4>Payment Information</h4>
              
              {order.payments && order.payments.length > 0 ? (
                <div className="payment-details">
                  {order.payments.map((payment, index) => (
                    <div key={index} className="payment-item">
                      <div className="payment-method">
                        {payment.paymentMethod}
                      </div>
                      <div className="payment-amount">
                        {formatCurrency(payment.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-payment">No payment information available</p>
              )}
            </div>
          </div>
        </div>
        
        {order.specialInstructions && (
          <div className="special-instructions">
            <h3>Special Instructions</h3>
            <p>{order.specialInstructions}</p>
          </div>
        )}
        
        <div className="order-actions">
          <button className="print-button">
            Print Receipt
          </button>
          
          {order.status !== 'cancelled' && order.status !== 'completed' && (
            <button 
              className="cancel-button" 
              onClick={() => handleStatusUpdate('cancelled')}
              disabled={isUpdating}
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;