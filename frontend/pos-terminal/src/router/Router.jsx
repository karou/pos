import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';

// Regular imports for critical pages
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';
import Dashboard from '../pages/Dashboard';

// Lazy-loaded pages for better performance
const POSPage = lazy(() => import('../pages/pos/POSPage'));
const InventoryPage = lazy(() => import('../pages/inventory/InventoryPage'));
const ReportsPage = lazy(() => import('../pages/reports/ReportsPage'));
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'));
const OrdersPage = lazy(() => import('../pages/orders/OrdersPage'));
const OrderDetails = lazy(() => import('../pages/orders/OrderDetails'));

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="page-loader">
    <LoadingSpinner size="large" color="#4a6cfa" />
    <p>Loading page...</p>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  // Show loading state if auth is still loading
  if (loading) {
    return <PageLoader />;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check for required role if specified
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Main Router component
const Router = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes with dashboard layout */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="pos" element={<POSPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            
            {/* Orders routes */}
            <Route path="orders">
              <Route index element={<OrdersPage />} />
              <Route path=":id" element={<OrderDetails />} />
            </Route>
            
            {/* Admin-only routes */}
            <Route 
              path="admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Navigate to="/settings" replace />
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback routes */}
            <Route path="unauthorized" element={<div>You are not authorized to view this page</div>} />
            <Route path="*" element={<NotFound />} />
          </Route>
          
          {/* Fallback route for any other path */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default Router;