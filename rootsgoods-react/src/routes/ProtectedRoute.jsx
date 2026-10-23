import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { currentUser, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser?.role)) {
    // If worker tried to access farmer route or vice versa, redirect to their home
    if (currentUser?.kind === 'worker') {
      return <Navigate to="/worker/tasks" replace />;
    }
    if (currentUser?.role === 'VET') {
      return <Navigate to="/vet/reports" replace />;
    }
    if (currentUser?.role === 'ADMIN') {
      return <Navigate to="/admin/accounts" replace />;
    }
    if (currentUser?.role === 'MILL') {
      return <Navigate to="/supplier/mill" replace />;
    }
    if (currentUser?.role === 'MEDS') {
      return <Navigate to="/supplier/medicine" replace />;
    }
    return <Navigate to="/farmer/today" replace />;
  }

  return <Outlet />;
};
