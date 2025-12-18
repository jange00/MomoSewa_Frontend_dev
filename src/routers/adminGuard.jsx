import { Navigate } from 'react-router-dom';
import { USER_ROLES, ROLE_DASHBOARD_ROUTES } from '../common/roleConstants';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/sign-in" replace />;
  }

  // Normalize role (handle case variations from backend)
  const normalizeRole = (role) => {
    if (!role) return null;
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };
  
  const role = normalizeRole(user.role);
  const normalizedRequiredRole = normalizeRole(requiredRole);

  // If role is not the required one → redirect to correct dashboard
  if (role !== normalizedRequiredRole) {
    const dashboardRoute = ROLE_DASHBOARD_ROUTES[role] || "/";
    return <Navigate to={dashboardRoute} replace />;
  }

  // Role matches required → allow access
  return children;
};

export default ProtectedRoute;
