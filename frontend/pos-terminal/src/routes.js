import React from 'react';
import { Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Dashboard from './pages/Dashboard';
import POSPage from './pages/pos/POSPage';
import InventoryPage from './pages/inventory/InventoryPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Orders pages
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetails from './pages/orders/OrderDetails';

// Define routes
const routes = [
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'pos', element: <POSPage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { 
        path: 'orders', 
        children: [
          { index: true, element: <OrdersPage /> },
          { path: ':id', element: <OrderDetails /> }
        ]
      },
      { path: '*', element: <NotFound /> }
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />
  }
];

export default routes;