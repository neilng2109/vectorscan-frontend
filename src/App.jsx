import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Note: No BrowserRouter here
import Login from './Login';
import QueryPage from './QueryPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    // The <Router> has been removed from this file.
    // We only need the <Routes> component now.
    <Routes>
      <Route 
        path="/login" 
        element={<Login onLoginSuccess={handleLoginSuccess} />} 
      />
      
      <Route 
        path="/query" 
        element={isAuthenticated ? <QueryPage /> : <Navigate to="/login" />} 
      />
      
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/query" : "/login"} />} 
      />
    </Routes>
  );
}

export default App;
