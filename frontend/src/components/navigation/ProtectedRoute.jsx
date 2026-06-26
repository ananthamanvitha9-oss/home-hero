import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../context/useAuth';

export function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to login but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If the user's role is not allowed, redirect to home page
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
