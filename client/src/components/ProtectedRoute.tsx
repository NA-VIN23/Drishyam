import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTE_ACCESS, type RoleKey } from '../data/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: RoleKey[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f9fafb',
        color: '#f8fafc',
        fontFamily: 'Outfit, sans-serif'
      }}>
        {/* Glowing aviation radar loading ring */}
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: '3px solid rgba(0, 210, 255, 0.1)',
          borderTopColor: '#0891b2',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <p style={{ color: '#94a3b8', fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Establishing Uplink...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const routeRoles = allowedRoles ?? ROUTE_ACCESS['/dashboard'];
  if (routeRoles.length > 0 && user && !routeRoles.includes(user.roleKey as RoleKey)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
