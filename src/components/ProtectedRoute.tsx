import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireBusinessOwner?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  requireBusinessOwner = false 
}: ProtectedRouteProps) => {
  const { user, loading, isAdmin, isBusinessOwner } = useAuth();

  // avoid redirect while auth state is initializing
  if (loading) return <div style={{padding:20}}>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireBusinessOwner && !isBusinessOwner) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};