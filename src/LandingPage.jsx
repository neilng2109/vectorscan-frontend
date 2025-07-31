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
      const response = await axios.post('http://localhost:5000/login', {  // Confirm backend URL
        username,
        password,
      }, { withCredentials: true });
      localStorage.setItem('token', response.data.token);
      navigate('/query');
    } catch (err) {
      setError('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-300 flex items-center justify-center font-sans">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-5xl transform transition-all duration-500 hover:shadow-blue-500/50">  // Increased max-w to 5xl
        <header className="text-center mb-8">
          <img src="/vectorscan-logo.png" alt="VectorScan Logo" className="h-32 mx-auto mb-6" />  // Slightly larger logo
          <h1 className="text-5xl font-bold text-white bg-blue-700 p-3 rounded-t-lg">VectorScan</h1>  // Larger font/padding
          <p className="text-2xl text-blue-100 mt-4">AI-Powered Maritime Fault Diagnosis</p>  // Larger text
        </header>
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">  // Flex-row on md+ for better side-by-side
          <div className="w-full md:w-2/3 pr-0 md:pr-6">
            <img src="/ship.jpg" alt="Maritime Vessel" className="w-full h-auto object-cover rounded-lg shadow-md mb-6" />  // Auto height for responsiveness
            <p className="text-lg text-gray-700">
              Welcome to VectorScan, the cutting-edge solution for maritime fault diagnosis. Leverage AI to minimize downtime and enhance vessel efficiency. Join us to revolutionize maritime maintenance!
            </p>
          </div>
          <form onSubmit={handleLogin} className="w-full md:w-1/3 space-y-6 bg-gray-50 p-8 rounded-lg shadow-inner">  // Increased space-y and padding for larger form
            <h2 className="text-2xl font-semibold text-blue-800">Login</h2>  // Larger heading
            <div>
              <label className="block text-base font-medium text-gray-700">Username</label>  // Larger text
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-lg"  // Larger padding/text
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-lg"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center text-lg"  // Larger padding/text
            >
              {loading ? (
                <svg className="animate-spin h-6 w-6 mr-2 text-white" viewBox="0 0 24 24">  // Larger spinner
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              ) : null}
              {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <p className="text-red-600 text-base">{error}</p>}  // Larger text
          </form>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;