import { Navigate } from 'react-router-dom';

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token || isTokenExpired(token)) {
    // Clear token just in case
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
  return children;
}