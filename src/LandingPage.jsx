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
      const response = await axios.post('http://localhost:5000/login', {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full bg-gray-900"></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl">
          {/* Main Container */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-12 text-center relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <img 
                    src="/vectorscan-logo.png" 
                    alt="VectorScan Logo" 
                    className="h-16 w-16 mr-4 rounded-full bg-white/20 p-2" 
                  />
                  <div>
                    <h1 className="text-5xl font-bold text-white tracking-tight">
                      Vector<span className="text-blue-200">Scan</span>
                    </h1>
                    <div className="h-1 w-24 bg-blue-300 mx-auto mt-2 rounded-full"></div>
                  </div>
                </div>
                <p className="text-xl text-blue-100 font-light max-w-2xl mx-auto leading-relaxed">
                  Advanced AI-Powered Maritime Fault Diagnosis System
                </p>
                <div className="flex justify-center space-x-8 mt-8 text-blue-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold">410+</div>
                    <div className="text-sm opacity-80">Fault Vectors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">AI</div>
                    <div className="text-sm opacity-80">Powered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm opacity-80">Available</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left Side - Information */}
              <div className="p-12 bg-gradient-to-br from-gray-50 to-white">
                <div className="space-y-8">
                  {/* Hero Image */}
                  <div className="relative">
                    <img 
                      src="/ship.jpg" 
                      alt="Maritime Vessel" 
                      className="w-full h-64 object-cover rounded-2xl shadow-lg" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="text-sm font-medium opacity-90">Real-time Maritime Analysis</div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Revolutionizing Maritime Maintenance
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      VectorScan leverages cutting-edge AI technology to provide instant, 
                      accurate fault diagnosis for maritime vessels. Minimize downtime, 
                      enhance efficiency, and ensure operational excellence.
                    </p>
                    
                    {/* Features */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700 font-medium">Instant Diagnosis</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700 font-medium">AI-Powered Analysis</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-700 font-medium">Historical Data</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-700 font-medium">Expert Recommendations</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Login Form */}
              <div className="p-12 bg-white flex items-center">
                <div className="w-full max-w-md mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h3>
                    <p className="text-gray-600">Sign in to access your fault diagnosis dashboard</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-800"
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-800"
                        placeholder="Enter your password"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                          </svg>
                          Signing In...
                        </>
                      ) : (
                        <>Sign In to Dashboard</>
                      )}
                    </button>

                    {error && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                        <p className="text-red-700 text-sm font-medium">{error}</p>
                      </div>
                    )}
                  </form>

                  {/* Demo Credentials */}
                  <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-600 font-medium mb-2">Demo Credentials:</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>• engineer_iona / pass123</div>
                      <div>• engineer_wonder / pass456</div>
                      <div>• admin / admin123</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-white/60">
            <p className="text-sm">
              © 2024 VectorScan Maritime Solutions. Powered by AI & Machine Learning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;