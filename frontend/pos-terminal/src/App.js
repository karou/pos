import React from 'react';
import Router from './router/Router';
import ErrorBoundary from './components/common/ErrorBoundary';

// Context providers
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';

// Import global styles
import './App.css';
import './styles/Components.css';
import './styles/Cart.css';
import './styles/Products.css';
import './styles/Checkout.css';
import './styles/Notifications.css';
import './styles/Layout.css';
import './styles/Pages.css';
import './styles/Dashboard.css';
import './styles/Login.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <ProductProvider>
              <CartProvider>
                <div className="App">
                  <Router />
                </div>
              </CartProvider>
            </ProductProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;