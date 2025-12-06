import { Navigate } from 'react-router-dom';
import { USER_ROLES, ROLE_DASHBOARD_ROUTES } from '../common/roleConstants';

const ProtectedRoute = ({ children, requiredRole }) => {
  const role = localStorage.getItem("role");

  // If no role (not logged in), redirect to login
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  // Convert requiredRole to array for easier checking
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

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

