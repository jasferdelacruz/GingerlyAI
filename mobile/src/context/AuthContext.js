import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { authService } from '../services/authService';

// Initial state
const initialState = {
  user: null,
  tokens: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        tokens: null,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        tokens: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext(undefined);

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from storage
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'AUTH_START' });

      // Check for stored tokens
      const { value: accessToken } = await Preferences.get({ key: 'accessToken' });
      const { value: refreshToken } = await Preferences.get({ key: 'refreshToken' });
      const { value: userJson } = await Preferences.get({ key: 'user' });

      if (accessToken && refreshToken && userJson) {
        const user = JSON.parse(userJson);
        const tokens = { accessToken, refreshToken };

        // Set tokens in auth service
        authService.setTokens(tokens);

        // Verify token validity by fetching profile
        try {
          const profileResponse = await authService.getProfile();
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: profileResponse.user,
              tokens,
            },
          });
        } catch (error) {
          // Token might be expired, try refresh
          await refreshAuth();
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const storeAuthData = async (user, tokens) => {
    await Preferences.set({ key: 'accessToken', value: tokens.accessToken });
    await Preferences.set({ key: 'refreshToken', value: tokens.refreshToken });
    await Preferences.set({ key: 'user', value: JSON.stringify(user) });
  };

  const clearAuthData = async () => {
    await Preferences.remove({ key: 'accessToken' });
    await Preferences.remove({ key: 'refreshToken' });
    await Preferences.remove({ key: 'user' });
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await authService.login(email, password);
      
      await storeAuthData(response.user, response.tokens);
      authService.setTokens(response.tokens);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          tokens: response.tokens,
        },
      });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message || 'Login failed',
      });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await authService.register(userData);
      
      await storeAuthData(response.user, response.tokens);
      authService.setTokens(response.tokens);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          tokens: response.tokens,
        },
      });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message || 'Registration failed',
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (state.tokens?.refreshToken) {
        await authService.logout(state.tokens.refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await clearAuthData();
      authService.clearTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      
      // Update stored user data
      await Preferences.set({ key: 'user', value: JSON.stringify(response.user) });
      
      dispatch({ type: 'UPDATE_USER', payload: response.user });
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
      // Password change successful - user will need to re-login on other devices
    } catch (error) {
      throw new Error(error.message || 'Failed to change password');
    }
  };

  const refreshAuth = async () => {
    try {
      if (!state.tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken(state.tokens.refreshToken);
      
      const updatedTokens = {
        accessToken: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
      };

      await storeAuthData(state.user, updatedTokens);
      authService.setTokens(updatedTokens);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: state.user,
          tokens: updatedTokens,
        },
      });
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
