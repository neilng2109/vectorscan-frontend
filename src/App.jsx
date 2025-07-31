// Updated for Vite deployment
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage.jsx';
import QueryPage from './QueryPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/query" element={<QueryPage />} />
    </Routes>
  );
}

export default App;