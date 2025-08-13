import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requiredRole = null,
  allowedRoles = null,
  allowAuthenticatedUsers = false 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth) {
    // Route requires authentication
    if (!isAuthenticated) {
      // Redirect to login page with return url
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access
    if (requiredRole && user?.role !== requiredRole) {
      // Redirect based on user role
      switch (user?.role) {
        case 'admin':
          return <Navigate to="/admin" replace />;
        case 'facility_owner':
          return <Navigate to="/facility-owner-dashboard" replace />;
        case 'player':
        default:
          return <Navigate to="/" replace />;
      }
    }

    // Check if user role is in allowed roles list
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
      // Redirect based on user role
      switch (user?.role) {
        case 'admin':
          return <Navigate to="/admin" replace />;
        case 'facility_owner':
          return <Navigate to="/facility-owner-dashboard" replace />;
        case 'player':
        default:
          return <Navigate to="/" replace />;
      }
    }
  } else {
    // Route is for non-authenticated users (like login/register)
    if (isAuthenticated && !allowAuthenticatedUsers) {
      // If user is authenticated, redirect based on their role
      switch (user?.role) {
        case 'admin':
          return <Navigate to="/admin" replace />;
        case 'facility_owner':
          return <Navigate to="/facility-owner-dashboard" replace />;
        case 'player':
        default:
          return <Navigate to="/" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;
