import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface AdminRouteProps {
  children?: React.ReactNode;
  allowedRoles?: Array<'SUPER_ADMIN' | 'CENTER_MANAGER' | 'TEACHER' | 'STUDENT'>;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  allowedRoles = ['SUPER_ADMIN', 'CENTER_MANAGER', 'TEACHER'] 
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If user role is not allowed for this route
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/courses" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

