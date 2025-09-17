import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Login from './Login';
import QueryPage from './QueryPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const location = useLocation();

  useEffect(() => {
    function handleStorageChange() {
      setIsAuthenticated(!!localStorage.getItem('token'));
    }
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
  }, [location]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
      <Route
        path="/query"
        element={
          <ProtectedRoute>
            <QueryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <QueryPage />
          </ProtectedRoute>
        }
      />
      {/* Add more protected routes as needed */}
    </Routes>
  );
}

export default App;