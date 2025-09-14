import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// 1. Import our new, smart API client instead of the generic axios library.
import apiClient from './api';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 2. Use 'apiClient' for the request.
      const response = await apiClient.post('/login', { username, password });
      localStorage.setItem('token', response.data.token);
      
      onLoginSuccess();
      
      navigate('/query');
    } catch (err) {
      console.error('Login error:', err.response ? err.response.data : err.message);
      setError('Login failed. Please check your credentials.');
    }
  };

  // The JSX for your login form remains the same.
  // ... (rest of your component)
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-300 flex items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
            <header className="text-center mb-8">
                <img src="/vectorscan-logo.png" alt="VectorScan Logo" className="h-24 mx-auto mb-4" />
                <h1 className="text-4xl font-bold text-blue-800">VectorScan Login</h1>
            </header>
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 font-semibold text-base"
                >
                    Login
                </button>
                {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            </form>
        </div>
    </div>
  );
}

export default Login;
