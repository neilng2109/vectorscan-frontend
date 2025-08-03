import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <div className="min-h-screen bg-gradient-ocean font-maritime">
      {/* Enhanced Navigation Header */}
      <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-maritime-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Enhanced Logo */}
            <div className="flex items-center group">
              <div className="w-12 h-12 bg-gradient-maritime rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-all duration-300 animate-float">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-ocean-900">
                  Vector<span className="text-maritime-600">Scan</span>
                </h1>
                <p className="text-xs lg:text-sm text-ocean-600 font-medium">Maritime Intelligence</p>
              </div>
            </div>
            
            {/* Desktop Navigation Actions */}
            <div className="hidden lg:flex items-center space-x-6">
              <img 
                src="/ship.jpg" 
                alt="Maritime Vessel" 
                className="w-16 h-10 object-cover rounded-lg shadow-md opacity-90 hover:opacity-100 transition-opacity duration-300" 
              />
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-maritime-100 text-maritime-800">
                  🌊 Live System
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ Online
                </span>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-ocean-600 hover:text-maritime-600 hover:bg-maritime-50 transition-colors duration-300"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-maritime-200">
              <div className="flex flex-col space-y-4">
                <img 
                  src="/ship.jpg" 
                  alt="Maritime Vessel" 
                  className="w-full h-32 object-cover rounded-lg shadow-md" 
                />
                <div className="flex flex-col space-y-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-maritime-100 text-maritime-800 w-fit">
                    🌊 Live System
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                    ✅ Online
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-maritime-50 via-white to-ocean-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230ea5e9' fill-opacity='0.4'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zM10 50c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Hero Content */}
            <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
              <div className="space-y-4 lg:space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-maritime-100 text-maritime-800 text-sm font-medium mb-4 lg:mb-6">
                  <span className="w-2 h-2 bg-maritime-500 rounded-full mr-2 animate-pulse"></span>
                  Next-Generation Maritime AI
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-ocean-900 leading-tight">
                  Advanced Maritime
                  <span className="block text-maritime-600">Intelligence Platform</span>
                </h1>
                
                <p className="text-lg lg:text-xl text-ocean-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Revolutionize your maritime operations with AI-driven diagnostics, instant fault detection, and predictive maintenance powered by cutting-edge machine learning.
                </p>
              </div>

              {/* Enhanced Statistics */}
              <div className="grid grid-cols-3 gap-4 lg:gap-6">
                <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-lg border border-maritime-200 hover:shadow-xl transition-all duration-300 group">
                  <div className="text-2xl lg:text-3xl font-bold text-maritime-600 mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-300">410+</div>
                  <div className="text-xs lg:text-sm font-medium text-ocean-600">Fault Vectors</div>
                </div>
                <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 group">
                  <div className="text-2xl lg:text-3xl font-bold text-green-600 mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-300">AI</div>
                  <div className="text-xs lg:text-sm font-medium text-ocean-600">Powered</div>
                </div>
                <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300 group">
                  <div className="text-2xl lg:text-3xl font-bold text-purple-600 mb-1 lg:mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
                  <div className="text-xs lg:text-sm font-medium text-ocean-600">Available</div>
                </div>
              </div>

              {/* Enhanced Features - Hidden on mobile, shown on tablet+ */}
              <div className="hidden md:block space-y-6 lg:space-y-8">
                <div className="flex items-start group">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-br from-maritime-500 to-maritime-600 rounded-xl lg:rounded-2xl flex items-center justify-center mr-4 lg:mr-6 shadow-lg group-hover:shadow-xl transition-all duration-300 animate-wave">
                    <span className="text-white text-lg lg:text-xl">⚡</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg lg:text-xl font-bold text-ocean-900 mb-2 lg:mb-3">Instant Diagnosis</h3>
                    <p className="text-sm lg:text-base text-ocean-600 leading-relaxed">Get comprehensive fault analysis in seconds, not hours. Our AI processes complex maritime data instantly with 99.7% accuracy.</p>
                  </div>
                </div>
                
                <div className="flex items-start group">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl lg:rounded-2xl flex items-center justify-center mr-4 lg:mr-6 shadow-lg group-hover:shadow-xl transition-all duration-300 animate-wave" style={{animationDelay: '0.5s'}}>
                    <span className="text-white text-lg lg:text-xl">🧠</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg lg:text-xl font-bold text-ocean-900 mb-2 lg:mb-3">AI Intelligence</h3>
                    <p className="text-sm lg:text-base text-ocean-600 leading-relaxed">Machine learning algorithms trained on 50,000+ maritime fault patterns provide expert-level insights and recommendations.</p>
                  </div>
                </div>
                
                <div className="flex items-start group">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl lg:rounded-2xl flex items-center justify-center mr-4 lg:mr-6 shadow-lg group-hover:shadow-xl transition-all duration-300 animate-wave" style={{animationDelay: '1s'}}>
                    <span className="text-white text-lg lg:text-xl">📈</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg lg:text-xl font-bold text-ocean-900 mb-2 lg:mb-3">Predictive Analytics</h3>
                    <p className="text-sm lg:text-base text-ocean-600 leading-relaxed">Prevent costly breakdowns with predictive maintenance recommendations based on historical data and real-time monitoring.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Login Form */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border border-maritime-200 p-6 lg:p-10 relative overflow-hidden">
              {/* Form Background Pattern */}
              <div className="absolute top-0 right-0 w-24 lg:w-32 h-24 lg:h-32 bg-gradient-maritime opacity-10 rounded-full -mr-12 lg:-mr-16 -mt-12 lg:-mt-16"></div>
              <div className="absolute bottom-0 left-0 w-20 lg:w-24 h-20 lg:h-24 bg-gradient-to-br from-purple-400 to-maritime-400 opacity-10 rounded-full -ml-10 lg:-ml-12 -mb-10 lg:-mb-12"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-8 lg:mb-10">
                  <h2 className="text-2xl lg:text-3xl font-bold text-ocean-900 mb-2 lg:mb-3">Welcome Aboard</h2>
                  <p className="text-sm lg:text-base text-ocean-600">Access your maritime intelligence dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 lg:space-y-8">
                  <div className="space-y-4 lg:space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-ocean-700 mb-2 lg:mb-3">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 lg:px-5 py-3 lg:py-4 border-2 border-ocean-200 rounded-lg lg:rounded-xl focus:ring-4 focus:ring-maritime-500/20 focus:border-maritime-500 transition-all duration-300 text-ocean-900 placeholder-ocean-400 bg-white/80"
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ocean-700 mb-2 lg:mb-3">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 lg:px-5 py-3 lg:py-4 border-2 border-ocean-200 rounded-lg lg:rounded-xl focus:ring-4 focus:ring-maritime-500/20 focus:border-maritime-500 transition-all duration-300 text-ocean-900 placeholder-ocean-400 bg-white/80"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <div className="bg-coral-50 border-2 border-coral-200 text-coral-700 px-4 lg:px-5 py-3 lg:py-4 rounded-lg lg:rounded-xl text-sm font-medium animate-pulse">
                      {error}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-maritime hover:shadow-xl text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-lg lg:rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base lg:text-lg group"
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
                        <span className="group-hover:mr-4 transition-all duration-300">Access Dashboard</span>
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                {/* Enhanced Demo Credentials */}
                <div className="mt-8 lg:mt-10 p-4 lg:p-6 bg-gradient-to-r from-ocean-50 to-maritime-50 rounded-xl lg:rounded-2xl border border-ocean-200">
                  <h4 className="text-sm font-bold text-ocean-700 mb-3 lg:mb-4 text-center flex items-center justify-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Demo Credentials
                  </h4>
                  <div className="space-y-2 lg:space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-ocean-600 font-medium">Username:</span>
                      <code className="bg-white px-2 lg:px-3 py-1 lg:py-1.5 rounded-md lg:rounded-lg text-ocean-800 font-mono border border-ocean-200 shadow-sm">captain</code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-ocean-600 font-medium">Password:</span>
                      <code className="bg-white px-2 lg:px-3 py-1 lg:py-1.5 rounded-md lg:rounded-lg text-ocean-800 font-mono border border-ocean-200 shadow-sm">demo123</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-ocean-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-maritime-900/50 to-ocean-900"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4 lg:mb-6">
              <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-maritime rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 lg:w-6 h-5 lg:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-lg lg:text-xl font-bold">VectorScan Maritime Solutions</span>
            </div>
            <p className="text-ocean-300 mb-3 lg:mb-4 text-sm lg:text-base">
              © 2024 VectorScan Maritime Solutions. AI-Powered Diagnostics for the Future of Maritime Operations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs lg:text-sm text-ocean-400">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                System Status: Operational
              </span>
              <span className="hidden sm:inline">•</span>
              <span>API Version 2.1</span>
              <span className="hidden sm:inline">•</span>
              <span>Uptime: 99.9%</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;