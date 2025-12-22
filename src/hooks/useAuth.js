//  useAuth Hook
// Provides authentication state and methods

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAccessToken,
  getRefreshToken,
  getUser,
  isAuthenticated,
  clearAuthData,
} from '../utils/tokenManager';
import * as authService from '../services/authService';
import { initializeSocket, disconnectSocket, reconnectSocket } from '../socket/socketClient';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const navigate = useNavigate();

  // Initialize auth state and socket
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = getUser();
        const hasToken = isAuthenticated();

        if (storedUser && hasToken) {
          setUserState(storedUser);
          setIsAuth(true);
          // Initialize socket if user is already authenticated
          const token = getAccessToken();
          if (token) {
            initializeSocket(token);
          }
        } else {
          clearAuthData();
          setUserState(null);
          setIsAuth(false);
          disconnectSocket();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuthData();
        setUserState(null);
        setIsAuth(false);
        disconnectSocket();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
    
    // Cleanup on unmount
    return () => {
      // Only disconnect on logout
    };
  }, []);

  /**
   * Register a new user
   */
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      const result = await authService.register(userData);

      if (result.success) {
        // Check if this is a vendor that requires approval
        if (result.requiresApproval) {
          // Don't set auth state - vendor needs admin approval first
          setUserState(null);
          setIsAuth(false);
          // Clear any existing auth data
          clearAuthData();
          disconnectSocket();
          // Don't show toast here - let the VendorSignupPage handle it
          // This ensures the navigation happens correctly
          return result;
        }
        
        // For non-vendors or already-approved vendors, proceed with normal login
        setUserState(result.data.user);
        setIsAuth(true);
        // Initialize socket after successful registration
        const token = getAccessToken();
        if (token) {
          initializeSocket(token);
        }
        toast.success(result.message || 'Registration successful');
        return result;
      } else {
        toast.error(result.message || 'Registration failed');
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

 // Login user

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      const result = await authService.login(credentials);

      if (result.success) {
        setUserState(result.data.user);
        setIsAuth(true);
        // Initialize socket after successful login
        const token = getAccessToken();
        if (token) {
          initializeSocket(token);
        }
        toast.success(result.message || 'Login successful');
        return result;
      } else {
        toast.error(result.message || 'Login failed');
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

 // Logout user

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      // Disconnect socket before logout
      disconnectSocket();
      await authService.logout();
      setUserState(null);
      setIsAuth(false);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      // Even if API call fails, clear local state and disconnect socket
      disconnectSocket();
      setUserState(null);
      setIsAuth(false);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

 // Refresh access token
  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = getRefreshToken();
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const result = await authService.refreshAccessToken(refreshTokenValue);
      
      // Reconnect socket with new token
      if (result.success && result.data?.accessToken) {
        reconnectSocket(result.data.accessToken);
      }
      
      return result;
    } catch (error) {
      // If refresh fails, logout user and disconnect socket
      disconnectSocket();
      setUserState(null);
      setIsAuth(false);
      clearAuthData();
      navigate('/login');
      throw error;
    }
  }, [navigate]);

 // Update user state (after profile updates, etc.)

  const updateUser = useCallback((userData) => {
    setUserState(userData);
    const { setUser } = require('../utils/tokenManager');
    setUser(userData);
  }, []);

// Forgot password

  const forgotPassword = useCallback(async (data) => {
    try {
      setLoading(true);
      const result = await authService.forgotPassword(data);
      toast.success(result.message || 'Password reset email sent');
      return result;
    } catch (error) {
      toast.error(error.message || 'Failed to send password reset email');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (data) => {
    try {
      setLoading(true);
      const result = await authService.resetPassword(data);
      toast.success(result.message || 'Password reset successful');
      return result;
    } catch (error) {
      toast.error(error.message || 'Password reset failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

 // Verify email

  const verifyEmail = useCallback(async (data) => {
    try {
      setLoading(true);
      const result = await authService.verifyEmail(data);
      if (result.success && result.data?.user) {
        updateUser(result.data.user);
      }
      toast.success(result.message || 'Email verified successfully');
      return result;
    } catch (error) {
      toast.error(error.message || 'Email verification failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  // Verify phone
  
  const verifyPhone = useCallback(async (data) => {
    try {
      setLoading(true);
      const result = await authService.verifyPhone(data);
      if (result.success && result.data?.user) {
        updateUser(result.data.user);
      }
      toast.success(result.message || 'Phone verified successfully');
      return result;
    } catch (error) {
      toast.error(error.message || 'Phone verification failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  return {
    user,
    isAuthenticated: isAuth,
    loading,
    register,
    login,
    logout,
    refreshToken,
    updateUser,
    forgotPassword,
    resetPassword,
    verifyEmail,
    verifyPhone,
    accessToken: getAccessToken(),
    refreshTokenValue: getRefreshToken(),
  };
};
