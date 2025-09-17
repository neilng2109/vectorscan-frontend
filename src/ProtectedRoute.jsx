import React from 'react';
import { Navigate } from 'react-router-dom';

function isAuthenticated() {
  const token = localStorage.getItem('token');
  // Optionally: decode token and check expiration here!
  return !!token;
}

export default function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}