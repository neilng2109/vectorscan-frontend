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
        <div className="w-full max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center mr-4 shadow-2xl">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <h1 className="text-6xl font-bold text-white tracking-tight">
                  Vector<span className="text-blue-400">Scan</span>
                </h1>
                <div className="h-1 w-32 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mt-2"></div>
              </div>
            </div>
            <p className="text-2xl text-blue-100 font-light mb-4">
              🚢 Advanced Maritime Intelligence Platform
            </p>
            <p className="text-lg text-blue-200 max-w-3xl mx-auto leading-relaxed">
              Harness the power of <span className="text-blue-300 font-semibold">AI-driven diagnostics</span> to revolutionize your maritime operations with <span className="text-green-300 font-semibold">instant fault detection</span> and <span className="text-purple-300 font-semibold">predictive maintenance</span>.
            </p>
          </div>

          {/* Main Container */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="grid lg:grid-cols-3 gap-0">
              
              {/* Left Side - Features & Stats */}
              <div className="lg:col-span-2 p-8 lg:p-12">
                {/* Statistics Cards */}
                <div className="grid grid-cols-3 gap-6 mb-10">
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-105 text-center">
                    <div className="text-3xl mb-3">🔍</div>
                    <div className="text-3xl font-bold text-white mb-1">410+</div>
                    <div className="text-sm text-blue-200 opacity-90">Fault Vectors</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-sm rounded-2xl p-6 border border-green-400/20 hover:border-green-400/40 transition-all duration-300 hover:scale-105 text-center">
                    <div className="text-3xl mb-3">🤖</div>
                    <div className="text-3xl font-bold text-white mb-1">AI</div>
                    <div className="text-sm text-green-200 opacity-90">Powered</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-105 text-center">
                    <div className="text-3xl mb-3">⚡</div>
                    <div className="text-3xl font-bold text-white mb-1">24/7</div>
                    <div className="text-sm text-purple-200 opacity-90">Available</div>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-blue-400/30 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                        <span className="text-white text-xl">🚀</span>
                      </div>
                      <h3 className="text-xl font-bold text-white">Instant Diagnosis</h3>
                    </div>
                    <p className="text-blue-200 leading-relaxed">Get comprehensive fault analysis in seconds, not hours. Our AI processes complex maritime data instantly.</p>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-green-400/30 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mr-4">
                        <span className="text-white text-xl">🧠</span>
                      </div>
                      <h3 className="text-xl font-bold text-white">AI Intelligence</h3>
                    </div>
                    <p className="text-green-200 leading-relaxed">Machine learning algorithms trained on maritime fault patterns provide expert-level insights.</p>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-400/30 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                        <span className="text-white text-xl">📈</span>
                      </div>
                      <h3 className="text-xl font-bold text-white">Predictive Analytics</h3>
                    </div>
                    <p className="text-purple-200 leading-relaxed">Prevent costly breakdowns with predictive maintenance recommendations based on historical data.</p>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-yellow-400/30 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                        <span className="text-white text-xl">🛠️</span>
                      </div>
                      <h3 className="text-xl font-bold text-white">Expert Recommendations</h3>
                    </div>
                    <p className="text-yellow-200 leading-relaxed">Receive detailed repair instructions and maintenance schedules from maritime engineering experts.</p>
                  </div>
                </div>

                {/* Ship Image - Small Accent */}
                <div className="flex items-center justify-center">
                  <div className="relative w-24 h-16 mr-4">
                    <img 
                      src="/ship.jpg" 
                      alt="Maritime Vessel" 
                      className="w-full h-full object-cover rounded-lg shadow-lg opacity-80" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                  </div>
                  <div className="text-blue-200">
                    <div className="text-sm font-semibold">Real-time Maritime Analysis</div>
                    <div className="text-xs opacity-80">Advanced Vessel Diagnostics</div>
                  </div>
                </div>
              </div>

              {/* Right Side - Login Form */}
              <div className="bg-white/5 backdrop-blur-sm p-8 lg:p-12 border-l border-white/10">
                <div className="max-w-sm mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-3">Welcome Aboard</h2>
                    <p className="text-blue-200">Access your maritime intelligence dashboard</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-blue-200 mb-3">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-blue-200 mb-3">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                    
                    {error && (
                      <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm">
                        {error}
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl flex items-center justify-center"
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
                        <>
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Access Dashboard
                        </>
                      )}
                    </button>
                  </form>

                  {/* Demo Credentials */}
                  <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <h4 className="text-sm font-bold text-blue-200 mb-4 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                      </svg>
                      Demo Credentials
                    </h4>
                    <div className="space-y-2 text-sm text-blue-300">
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="font-mono">admin</span>
                        <span className="text-blue-400">/</span>
                        <span className="font-mono">admin123</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="font-mono text-xs">engineer_iona</span>
                        <span className="text-blue-400">/</span>
                        <span className="font-mono">pass123</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="font-mono text-xs">engineer_wonder</span>
                        <span className="text-blue-400">/</span>
                        <span className="font-mono">pass456</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-blue-300 text-sm opacity-70">
          © 2024 VectorScan Maritime Solutions. Powered by AI & Machine Learning.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;