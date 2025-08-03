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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-xl">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                  Vector<span className="text-blue-400">Scan</span>
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mt-1"></div>
              </div>
            </div>
            <p className="text-xl text-blue-100 font-light mb-2">
              🚢 Advanced Maritime Intelligence Platform
            </p>
            <p className="text-sm text-blue-200 max-w-2xl mx-auto leading-relaxed opacity-90">
              Harness the power of AI-driven diagnostics to revolutionize your maritime operations with instant fault detection and predictive maintenance.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-0 bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
            
            {/* Left Side - Content */}
            <div className="p-6 lg:p-8">
              
              {/* Statistics */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <div className="text-xl font-bold text-blue-400 mb-1">410+</div>
                  <div className="text-xs text-blue-200 opacity-80">🔍 Fault Vectors</div>
                </div>
                <div className="text-center bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <div className="text-xl font-bold text-green-400 mb-1">AI</div>
                  <div className="text-xs text-green-200 opacity-80">🤖 Powered</div>
                </div>
                <div className="text-center bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <div className="text-xl font-bold text-purple-400 mb-1">24/7</div>
                  <div className="text-xs text-purple-200 opacity-80">⚡ Available</div>
                </div>
              </div>

              {/* Key Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-white text-xs">⚡</span>
                  </span>
                  Instant Diagnosis
                </h3>
                <p className="text-blue-200 text-sm leading-relaxed mb-4">
                  Get comprehensive fault analysis in seconds, not hours. Our AI processes complex maritime data instantly.
                </p>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <div className="flex items-center mb-2">
                      <span className="w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 rounded flex items-center justify-center mr-2">
                        <span className="text-white text-xs">🧠</span>
                      </span>
                      <h4 className="text-sm font-semibold text-white">AI Intelligence</h4>
                    </div>
                    <p className="text-xs text-green-200 opacity-90">Machine learning algorithms trained on maritime fault patterns provide expert-level insights.</p>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <div className="flex items-center mb-2">
                      <span className="w-5 h-5 bg-gradient-to-br from-purple-400 to-purple-600 rounded flex items-center justify-center mr-2">
                        <span className="text-white text-xs">📈</span>
                      </span>
                      <h4 className="text-sm font-semibold text-white">Predictive Analytics</h4>
                    </div>
                    <p className="text-xs text-purple-200 opacity-90">Prevent costly breakdowns with predictive maintenance recommendations based on historical data.</p>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <div className="flex items-center mb-2">
                      <span className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded flex items-center justify-center mr-2">
                        <span className="text-white text-xs">🛠️</span>
                      </span>
                      <h4 className="text-sm font-semibold text-white">Expert Recommendations</h4>
                    </div>
                    <p className="text-xs text-yellow-200 opacity-90">Receive detailed repair instructions and maintenance schedules from maritime engineering experts.</p>
                  </div>
                </div>

                {/* Tiny Ship Accent */}
                <div className="flex items-center justify-center mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-white/10">
                    <div className="relative w-4 h-3 mr-2 flex-shrink-0">
                      <img 
                        src="/ship.jpg" 
                        alt="Maritime Vessel" 
                        className="w-full h-full object-cover rounded opacity-40" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded"></div>
                    </div>
                    <div className="text-blue-200">
                      <div className="text-xs font-medium">Real-time Analysis</div>
                      <div className="text-xs opacity-60">Advanced Diagnostics</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="bg-white/5 backdrop-blur-sm p-6 lg:p-8 border-l border-white/10">
              <div className="max-w-sm mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome Aboard</h2>
                  <p className="text-blue-200 text-sm">Access your maritime intelligence dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-200 mb-2">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-200 mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  
                  {error && (
                    <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-200 px-3 py-2 rounded-xl text-sm">
                      {error}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Access Dashboard
                      </>
                    )}
                  </button>
                </form>

                {/* Demo Credentials */}
                <div className="mt-6 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <h4 className="text-sm font-semibold text-blue-200 mb-2 text-center">Demo Credentials</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300">Username:</span>
                      <code className="bg-black/30 px-2 py-1 rounded text-green-300 font-mono">captain</code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300">Password:</span>
                      <code className="bg-black/30 px-2 py-1 rounded text-green-300 font-mono">demo123</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-blue-300 text-sm opacity-70">
          © 2024 VectorScan Maritime Solutions. AI-Powered Diagnostics.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;