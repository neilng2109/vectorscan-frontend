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
                  <h1 className="text-6xl font-bold text-white tracking-tight mb-4">
                    Vector<span className="text-blue-400">Scan</span>
                  </h1>
                  <div className="h-1 w-32 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mb-6"></div>
                  <p className="text-xl text-blue-100 font-light leading-relaxed">
                    Advanced AI-Powered Maritime Fault Diagnosis System
                  </p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="text-3xl font-bold text-white">410+</div>
                    <div className="text-sm text-blue-200 opacity-80">Fault Vectors</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="text-3xl font-bold text-white">AI</div>
                    <div className="text-sm text-blue-200 opacity-80">Powered</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="text-3xl font-bold text-white">24/7</div>
                    <div className="text-sm text-blue-200 opacity-80">Available</div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Key Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <span className="text-blue-100 font-medium">Instant Fault Diagnosis</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-blue-100 font-medium">AI-Powered Analysis</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                      <span className="text-blue-100 font-medium">Historical Data Integration</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <span className="text-blue-100 font-medium">Expert Recommendations</span>
                    </div>
                  </div>
                </div>

                {/* Ship Image - Properly Sized */}
                <div className="relative">
                  <img 
                    src="/ship.jpg" 
                    alt="Maritime Vessel" 
                    className="w-full h-32 object-cover rounded-xl shadow-lg opacity-80" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl"></div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <div className="text-xs font-medium opacity-90">Real-time Maritime Analysis</div>
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