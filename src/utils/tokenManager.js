
 // Token Manager Utility
 // Handles storage and retrieval of authentication tokens
 

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';


export const setAccessToken = (token) => {
  try {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing access token:', error);
  }
};

export const getAccessToken = () => {
  try {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving access token:', error);
    return null;
  }
};

export const removeAccessToken = () => {
  try {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing access token:', error);
  }
};

export const setRefreshToken = (token) => {
  try {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing refresh token:', error);
  }
};

export const getRefreshToken = () => {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving refresh token:', error);
    return null;
  }
};

export const removeRefreshToken = () => {
  try {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing refresh token:', error);
  }
};

export const setUser = (user) => {
  try {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

export const getUser = () => {
  try {
    const userStr = sessionStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};

export const removeUser = () => {
  try {
    sessionStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error removing user data:', error);
  }
};

export const clearAuthData = () => {
  removeAccessToken();
  removeRefreshToken();
  removeUser();
};

export const isAuthenticated = () => {
  return !!getAccessToken();
};
