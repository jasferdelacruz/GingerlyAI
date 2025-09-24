import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Network } from '@capacitor/network';
import { syncService } from '../services/syncService';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  isOnline: true,
  isLoading: false,
  lastSyncTime: null,
  syncStatus: 'idle',
  syncProgress: 0,
  error: null,
  notifications: [],
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        isOnline: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SYNC_START':
      return {
        ...state,
        syncStatus: 'syncing',
        syncProgress: 0,
        error: null,
      };
    case 'SYNC_PROGRESS':
      return {
        ...state,
        syncProgress: action.payload,
      };
    case 'SYNC_SUCCESS':
      return {
        ...state,
        syncStatus: 'success',
        syncProgress: 100,
        lastSyncTime: action.payload,
        error: null,
      };
    case 'SYNC_ERROR':
      return {
        ...state,
        syncStatus: 'error',
        error: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };
    default:
      return state;
  }
};

// Create context
const AppContext = createContext(undefined);

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Network status monitoring
  useEffect(() => {
    const setupNetworkMonitoring = async () => {
      // Get initial network status
      const status = await Network.getStatus();
      dispatch({ type: 'SET_ONLINE_STATUS', payload: status.connected });

      // Listen for network changes
      const networkListener = Network.addListener('networkStatusChange', (status) => {
        dispatch({ type: 'SET_ONLINE_STATUS', payload: status.connected });
        
        // Auto-sync when coming back online
        if (status.connected && isAuthenticated) {
          setTimeout(() => {
            syncData();
          }, 1000); // Small delay to ensure connection is stable
        }
      });

      return () => {
        networkListener.remove();
      };
    };

    setupNetworkMonitoring();
  }, [isAuthenticated]);

  // Auto-sync on app start when authenticated
  useEffect(() => {
    if (isAuthenticated && state.isOnline) {
      syncData();
    }
  }, [isAuthenticated]);

  const syncData = async () => {
    if (!state.isOnline || !isAuthenticated) {
      return;
    }

    try {
      dispatch({ type: 'SYNC_START' });

      // Sync predictions
      dispatch({ type: 'SYNC_PROGRESS', payload: 25 });
      await syncService.syncPredictions();

      // Sync remedies
      dispatch({ type: 'SYNC_PROGRESS', payload: 50 });
      await syncService.syncRemedies();

      // Check for model updates
      dispatch({ type: 'SYNC_PROGRESS', payload: 75 });
      await syncService.checkModelUpdates();

      // Complete
      dispatch({ type: 'SYNC_PROGRESS', payload: 100 });
      dispatch({ type: 'SYNC_SUCCESS', payload: new Date() });

      addNotification({
        type: 'success',
        title: 'Sync Complete',
        message: 'Your data has been synchronized successfully.',
      });
    } catch (error) {
      console.error('Sync error:', error);
      dispatch({ type: 'SYNC_ERROR', payload: error.message || 'Sync failed' });
      
      addNotification({
        type: 'error',
        title: 'Sync Failed',
        message: error.message || 'Failed to synchronize data.',
      });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });

    // Auto-remove success notifications after 5 seconds
    if (notification.type === 'success') {
      setTimeout(() => {
        markNotificationRead(newNotification.id);
      }, 5000);
    }
  };

  const markNotificationRead = (id) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const contextValue = {
    ...state,
    syncData,
    clearError,
    addNotification,
    markNotificationRead,
    clearNotifications,
    setLoading,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook for using app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
