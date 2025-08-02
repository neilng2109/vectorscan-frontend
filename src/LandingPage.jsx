import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('https://api.vectorscan.io/login', {
        username,
        password,
      });
      localStorage.setItem('token', response.data.token);
      navigate('/query');
    } catch (err) {
      setError('Invalid credentials or server error');
      console.error('Login error:', err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-300 flex items-center justify-center font-sans">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-4xl">
        <header className="text-center mb-8">
          <img src="/vectorscan-logo.png" alt="VectorScan Logo" className="h-20 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-blue-800">VectorScan</h1>
          <p className="text-lg text-gray-600 mt-2">AI-Powered Maritime Fault Diagnosis</p>
        </header>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="w-full md:w-2/3">
            <img src="/ship.jpg" alt="Maritime Vessel" className="w-full h-48 object-cover rounded-lg shadow-md mb-4" />
            <p className="text-base text-gray-700">
              Welcome to VectorScan, the cutting-edge solution for maritime fault diagnosis. Leverage AI to minimize downtime and enhance vessel efficiency. Join us to revolutionize maritime maintenance!
            </p>
          </div>
          <form onSubmit={handleLogin} className="w-full md:w-1/3 space-y-4 bg-gray-50 p-6 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold text-blue-800">Login</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="e.g., admin"
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
                placeholder="e.g., admin123"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center text-base"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              ) : null}
              {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="text-sm text-gray-600 mt-4">
              <p>Demo Credentials:</p>
              <ul className="list-disc list-inside">
                <li>admin / admin123</li>
                <li>engineer_iona / pass123</li>
                <li>engineer_wonder / pass456</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;