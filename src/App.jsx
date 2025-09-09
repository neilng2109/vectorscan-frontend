import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';       // Ensure this path is correct
import QueryPage from './pages/QueryPage'; // Ensure this path is correct

function App() {
  // Initialize state by checking for a token in localStorage. `!!` converts the result to a boolean.
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <Router>
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
    </Router>
  );
}

export default App;