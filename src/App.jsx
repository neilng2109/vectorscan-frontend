import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import QueryPage from './QueryPage';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/query" element={<QueryPage />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;