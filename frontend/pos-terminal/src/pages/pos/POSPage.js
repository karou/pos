import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import POSTerminal from '../../components/pos/POSTerminal';
import useOfflineSync from '../../hooks/useOfflineSync';
import { useNotification } from '../../context/NotificationContext';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import Button from '../../components/common/Button';

// Import styles
import '../../styles/POS.css';

/**
 * POS page component
 */
const POSPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOnline, pendingSyncCount, sync, lastSyncTime } = useOfflineSync();
  const { showInfo, showSuccess, showError } = useNotification();
  
  // Check for pending offline orders and notify user
  useEffect(() => {
    if (isOnline && pendingSyncCount > 0) {
      showInfo(`You have ${pendingSyncCount} pending offline transactions. Click to sync now.`, {
        title: 'Offline Data Available',
        autoHideDuration: 0, // Don't auto-hide
        onClick: handleSync
      });
    }
  }, [isOnline, pendingSyncCount]);
  
  // Handle sync button click
  const handleSync = async () => {
    try {
      const result = await sync();
      if (result.synced > 0) {
        showSuccess(`Successfully synced ${result.synced} transactions`, { autoHideDuration: 3000 });
      }
      if (result.errors > 0) {
        showError(`Failed to sync ${result.errors} transactions. Please try again later.`, { autoHideDuration: 5000 });
      }
    } catch (error) {
      showError('Failed to sync data. Please try again later.');
    }
  };
  
  // Handle error in POS Terminal
  const handlePOSError = (error) => {
    console.error('POS Terminal error:', error);
    showError('An error occurred in the POS Terminal. It has been reset.');
  };
  
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>POS Terminal</h1>
        <div className="header-actions">
          {isOnline && pendingSyncCount > 0 && (
            <Button
              variant="warning"
              size="small"
              onClick={handleSync}
            >
              Sync ({pendingSyncCount})
            </Button>
          )}
          <Button
            variant="secondary"
            size="small"
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </Button>
        </div>
      </header>
      
      <ErrorBoundary
        errorMessage="Something went wrong with the POS Terminal."
        resetButtonText="Reset POS Terminal"
        onError={handlePOSError}
        showDetails={process.env.NODE_ENV === 'development'}
      >
        <POSTerminal />
      </ErrorBoundary>
    </div>
  );
};

export default POSPage;