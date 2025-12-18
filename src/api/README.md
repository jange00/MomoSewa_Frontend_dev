# API Connection Setup

This directory contains the API connection infrastructure for the MomoSewa frontend application.

## Structure

```
src/
├── api/
│   ├── config.js          # API configuration and endpoints
│   ├── client.js          # Axios client with interceptors
│   └── README.md          # This file
├── services/
│   └── authService.js     # Authentication service
├── hooks/
│   ├── useAuth.js         # Authentication hook
│   ├── useApi.js          # API hooks (useGet, usePost, etc.)
│   └── useSocket.js       # Socket.IO hook
├── utils/
│   └── tokenManager.js    # Token storage utilities
├── socket/
│   └── socketClient.js    # Socket.IO client
└── types/
    └── api.js             # API types and constants
```

## Environment Variables

Create a `.env` file in the root directory with:

```env
VITE_API_BASE_URL=http://localhost:5001/api/v1
VITE_WS_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

## Usage Examples

### Authentication

```javascript
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const { login, loading, isAuthenticated, user } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login({
        email: 'user@example.com',
        password: 'password123'
      });
      // User is now logged in
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    // Your login form
  );
}
```

### Making API Calls

```javascript
import { useGet, usePost } from '../hooks/useApi';
import { API_ENDPOINTS } from '../api/config';

function ProductsPage() {
  // GET request
  const { data, isLoading, error } = useGet(
    'products',
    API_ENDPOINTS.PRODUCTS
  );

  // POST request
  const createProduct = usePost(
    'products',
    API_ENDPOINTS.PRODUCTS
  );

  const handleCreate = async () => {
    try {
      await createProduct.mutateAsync({
        name: 'Product Name',
        price: 100,
        // ... other fields
      });
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  return (
    // Your component JSX
  );
}
```

### Socket.IO Notifications

```javascript
import { useSocket } from '../hooks/useSocket';

function Dashboard() {
  const handleNotification = (data) => {
    console.log('New notification:', data);
    // Show notification to user
  };

  const { isConnected } = useSocket({
    onNotification: handleNotification,
  });

  return (
    <div>
      {isConnected ? 'Connected' : 'Disconnected'}
      {/* Your dashboard content */}
    </div>
  );
}
```

### Direct API Calls

```javascript
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/config';

// Make a direct API call
const fetchUserProfile = async () => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.USERS}/profile`);
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
};
```

## Features

- ✅ Automatic token injection in requests
- ✅ Automatic token refresh on 401 errors
- ✅ Token storage management
- ✅ Error handling and formatting
- ✅ React Query integration
- ✅ Socket.IO real-time notifications
- ✅ Type definitions and constants

## Authentication Flow

1. User logs in → `login()` stores tokens and user data
2. All API requests automatically include access token
3. If token expires (401), interceptor refreshes it automatically
4. If refresh fails, user is logged out and redirected to login

## Token Management

- Access tokens are stored in `sessionStorage`
- Refresh tokens are stored in `sessionStorage`
- Tokens are automatically cleared on logout
- Tokens are automatically attached to requests

## Error Handling

All API errors are automatically formatted and can be displayed to users. The `handleApiError` function provides:
- Error message
- Detailed error information (if available)
- HTTP status code
- Success flag
