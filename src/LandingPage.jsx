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
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl">
          {/* Main Container with Glass Morphism */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            
            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-0 min-h-[600px]">
              
              {/* Left Side - Branding & Info */}
              <div className="p-12 flex flex-col justify-center space-y-8">
                {/* Logo & Title */}
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-6">
                    {/* Logo Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-5xl font-bold text-white tracking-tight">
                        Vector<span className="text-blue-400">Scan</span>
                      </h1>
                      <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mt-1"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-2xl font-semibold text-white">
                      🚢 Maritime Intelligence Platform
                    </p>
                    <p className="text-lg text-blue-100 leading-relaxed">
                      Harness the power of <span className="text-blue-300 font-semibold">AI-driven diagnostics</span> to revolutionize your maritime operations with <span className="text-green-300 font-semibold">instant fault detection</span> and <span className="text-purple-300 font-semibold">predictive maintenance</span>.
                    </p>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm rounded-xl p-4 border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-105">
                    <div className="text-2xl mb-2">🔍</div>
                    <div className="text-2xl font-bold text-white">410+</div>
                    <div className="text-xs text-blue-200 opacity-90">Fault Vectors</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-sm rounded-xl p-4 border border-green-400/20 hover:border-green-400/40 transition-all duration-300 hover:scale-105">
                    <div className="text-2xl mb-2">🤖</div>
                    <div className="text-2xl font-bold text-white">AI</div>
                    <div className="text-xs text-green-200 opacity-90">Powered</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-sm rounded-xl p-4 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-105">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="text-2xl font-bold text-white">24/7</div>
                    <div className="text-xs text-purple-200 opacity-90">Available</div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="text-2xl mr-3">⚙️</span>
                    Powerful Capabilities
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-4 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">🚀</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">Instant Diagnosis</div>
                        <div className="text-blue-200 text-sm opacity-90">Get results in seconds, not hours</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-green-400/20 hover:border-green-400/40 transition-all duration-300">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">🧠</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">AI Intelligence</div>
                        <div className="text-green-200 text-sm opacity-90">Machine learning powered insights</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">📈</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">Predictive Analytics</div>
                        <div className="text-purple-200 text-sm opacity-90">Prevent issues before they occur</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ship Image - Small Accent */}
                <div className="flex items-center justify-center lg:justify-start">
                  <div className="relative w-20 h-12 mr-4">
                    <img 
                      src="/ship.jpg" 
                      alt="Maritime Vessel" 
                      className="w-full h-full object-cover rounded-lg shadow-md opacity-70" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-lg"></div>
                  </div>
                  <div className="text-blue-200">
                    <div className="text-sm font-medium">Real-time Analysis</div>
                    <div className="text-xs opacity-80">Maritime Operations</div>
                  </div>
                </div>
              </div>

              {/* Right Side - Login Form */}
              <div className="bg-white/5 backdrop-blur-sm p-12 flex flex-col justify-center border-l border-white/10">
                <div className="max-w-sm mx-auto w-full">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-blue-200">Sign in to access your fault diagnosis dashboard</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
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
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {loading ? 'Signing In...' : 'Sign In to Dashboard'}
                    </button>
                  </form>

                  {/* Demo Credentials */}
                  <div className="mt-8 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <h4 className="text-sm font-semibold text-blue-200 mb-3">Demo Credentials:</h4>
                    <div className="space-y-2 text-xs text-blue-300">
                      <div>• engineer_iona / pass123</div>
                      <div>• engineer_wonder / pass456</div>
                      <div>• admin / admin123</div>
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
          © 2024 VectorScan Maritime Solutions. Powered by AI & Machine Learning.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;