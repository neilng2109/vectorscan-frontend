import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import QueryPage from './QueryPage';
import ProtectedRoute from './ProtectedRoute';

function App() {
  // If you need to pass handleLoginSuccess to Login, keep it:
  const handleLoginSuccess = () => {
    // You can trigger any additional logic here if needed
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