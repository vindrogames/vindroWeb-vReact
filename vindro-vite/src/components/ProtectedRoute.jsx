import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth/AuthContext';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content if authenticated
  return children;
}
