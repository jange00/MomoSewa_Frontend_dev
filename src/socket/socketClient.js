// Socket.IO Client
// Handles real-time WebSocket connections for notifications

import { io } from 'socket.io-client';
import { WS_URL } from '../api/config';
import { getAccessToken } from '../utils/tokenManager';

let socket = null;

export const initializeSocket = (accessToken = null) => {
  const token = accessToken || getAccessToken();

  if (!token) {
    console.warn('No access token available for socket connection');
    return null;
  }

  // If socket already exists and is connected with the same token, return it
  if (socket && socket.connected && socket.auth?.token === token) {
    console.log('Socket already connected:', socket.id);
    return socket;
  }

  // If socket exists but is disconnected or token changed, clean it up
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  // Create new socket connection
  socket = io(WS_URL, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    auth: {
      token: token,
    },
    // Prevent multiple connections
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  // Connection event handlers (only set once per socket instance)
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    // Remove all event listeners before disconnecting
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};


export const reconnectSocket = (accessToken) => {
  disconnectSocket();
  return initializeSocket(accessToken);
};


export const subscribeToNotifications = (callback) => {
  if (!socket) {
    console.warn('Socket not initialized');
    return () => {};
  }

  socket.on('notification', (data) => {
    callback(data);
  });

  // Return unsubscribe function
  return () => {
    if (socket) {
      socket.off('notification', callback);
    }
  };
};


export const subscribeToOrderUpdates = (callback) => {
  if (!socket) {
    console.warn('Socket not initialized');
    return () => {};
  }

  socket.on('orderUpdate', (data) => {
    callback(data);
  });

  // Return unsubscribe function
  return () => {
    if (socket) {
      socket.off('orderUpdate', callback);
    }
  };
};


export const emitEvent = (event, data) => {
  if (!socket || !socket.connected) {
    console.warn('Socket not connected');
    return;
  }

  socket.emit(event, data);
};
