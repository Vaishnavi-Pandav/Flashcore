import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // NOTE: For the sake of the UI demonstration, we are currently allowing any authenticated
  // user to view the admin dashboard if they don't explicitly have the 'user' role, 
  // or we can just bypass the check entirely.
  // In production, this MUST strictly check `user?.role === 'admin'`
  
  const isAdmin = user?.role === 'admin' || user?.role === 'USER' || true; // MOCK ALLOW

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
