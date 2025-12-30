import { Navigate } from 'react-router-dom';
import { USER_ROLES, ROLE_DASHBOARD_ROUTES } from '../common/roleConstants';
import { useAuth } from '../hooks/useAuth';
import { Skeleton } from '../ui/skeletons';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5">
        <div className="text-center space-y-4">
          <Skeleton variant="avatar" className="w-16 h-16 mx-auto" />
          <Skeleton variant="heading" className="w-32 mx-auto" />
          <Skeleton variant="text" className="w-48 mx-auto" />
        </div>
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
