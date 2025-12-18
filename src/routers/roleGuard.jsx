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
    return <Navigate to="/login" replace />;
  }

  // Normalize role (handle case variations from backend)
  const normalizeRole = (role) => {
    if (!role) return null;
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };
  
  const role = normalizeRole(user.role);

  // Convert requiredRole to array for easier checking and normalize each
  const allowedRoles = Array.isArray(requiredRole) 
    ? requiredRole.map(normalizeRole)
    : [normalizeRole(requiredRole)];

  // Check if user's role is in the allowed roles
  const hasAccess = allowedRoles.includes(role);

  // If user doesn't have access, redirect to their dashboard
  if (!hasAccess) {
    const dashboardRoute = ROLE_DASHBOARD_ROUTES[role] || "/";
    return <Navigate to={dashboardRoute} replace />;
  }

  // User has access, render the protected content
  return children;
};

export default ProtectedRoute;

