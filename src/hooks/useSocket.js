// useSocket Hook
// Provides Socket.IO connection management in React components

import { useEffect, useRef, useState } from 'react';
import {
  initializeSocket,
  getSocket,
  disconnectSocket,
  reconnectSocket,
  subscribeToNotifications,
  subscribeToOrderUpdates,
} from '../socket/socketClient';
import { useAuth } from './useAuth';

export const useSocket = (options = {}) => {
  const { autoConnect = true, onNotification, onOrderUpdate } = options;
  const { isAuthenticated, accessToken } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const notificationUnsubscribeRef = useRef(null);
  const orderUpdateUnsubscribeRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (!autoConnect || !isAuthenticated || !accessToken) {
      return;
    }

    // Check if socket already exists and is connected
    const existingSocket = getSocket();
    if (existingSocket && existingSocket.connected) {
      setIsConnected(true);
      // Set up subscriptions on existing socket
      if (onNotification) {
        notificationUnsubscribeRef.current = subscribeToNotifications(onNotification);
      }
      if (onOrderUpdate) {
        orderUpdateUnsubscribeRef.current = subscribeToOrderUpdates(onOrderUpdate);
      }
      return;
    }

    const socket = initializeSocket(accessToken);

    if (!socket) {
      return;
    }

    // Set up connection status listeners
    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Set up notification subscription
    if (onNotification) {
      notificationUnsubscribeRef.current = subscribeToNotifications(onNotification);
    }

    // Set up order update subscription
    if (onOrderUpdate) {
      orderUpdateUnsubscribeRef.current = subscribeToOrderUpdates(onOrderUpdate);
    }

    // Cleanup on unmount or dependency change
    return () => {
      // Remove event listeners
      if (socket) {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      }
      
      // Unsubscribe from notifications and order updates
      if (notificationUnsubscribeRef.current) {
        notificationUnsubscribeRef.current();
        notificationUnsubscribeRef.current = null;
      }
      if (orderUpdateUnsubscribeRef.current) {
        orderUpdateUnsubscribeRef.current();
        orderUpdateUnsubscribeRef.current = null;
      }
      
      // Don't disconnect socket here - let it be managed globally
      setIsConnected(false);
    };
  }, [autoConnect, isAuthenticated, accessToken, onNotification, onOrderUpdate]);

  // Reconnect when token changes (e.g., after refresh)
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const socket = getSocket();
      if (!socket || !socket.connected) {
        // Only initialize if not already connected
        initializeSocket(accessToken);
      } else if (socket.auth?.token !== accessToken) {
        // If socket exists but token changed, reconnect with new token
        reconnectSocket(accessToken);
      }
    } else if (!isAuthenticated) {
      // Disconnect if user is not authenticated
      disconnectSocket();
      setIsConnected(false);
    }
  }, [accessToken, isAuthenticated]);

  return {
    isConnected,
    socket: getSocket(),
  };
};
