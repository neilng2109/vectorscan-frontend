import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login({ onLoginSuccess }) { // <-- Accept the prop here
  // ... your other states (username, password, etc.)
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://api.vectorscan.io/login', { username, password });
      localStorage.setItem('token', response.data.token);
      
      onLoginSuccess(); // <-- Call this function to update the App's state
      
      navigate('/query');
    } catch (err) {    console.error('Login error:', err.response ? err.response.data : err.message);
    setError('Login failed. Check credentials or contact support.');
  }
};
  

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-['Inter']">
      <header className="max-w-5xl bg-blue-900 text-white p-4 rounded-t-lg flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <img src="vectorscan-logo.png" alt="VectorScan Logo" className="h-16 w-auto" onError={() => console.log('Failed to load logo')} />
          <h1 className="text-2xl font-bold">VectorScan Troubleshooting Platform</h1>
        </div>
        <div className="text-lg">Integrated with CBM Systems</div>
      </header>
      <main className="max-w-md bg-white p-6 rounded-lg shadow-lg">
        <form onSubmit={handleLogin} className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">Login</h2>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Login
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      </main>
      <footer className="w-full max-w-5xl bg-gray-200 p-4 rounded-b-lg mt-4 text-center text-gray-600">
        VectorScan v1.0 | Contact: support@vectorscan.io | Updated: {new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris', timeZoneName: 'short' }).replace(',', '')}
      </footer>
    </div>
  );
}

export default Login;