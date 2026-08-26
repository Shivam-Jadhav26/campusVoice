import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const getRolePath = (role) => {
  const paths = { 
    student: '/student/dashboard', 
    teacher: '/teacher/dashboard', 
    tg: '/tg/dashboard', 
    class_incharge: '/class-incharge/dashboard', 
    hod: '/hod/dashboard', 
    admin: '/admin/dashboard' 
  };
  return paths[role] || '/login';
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={getRolePath(user?.role)} replace />;
  }
  
  return children;
};

export default ProtectedRoute;
