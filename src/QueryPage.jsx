import React, { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';

const QueryPage = () => {
  const [faultDescription, setFaultDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login first');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('https://api.vectorscan.io/query', {
        fault_description: faultDescription,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data.error) {
        setError(response.data.error);
      } else {
        setResult(parseResult(response.data.result));
      }
    } catch (err) {
      console.error('Query error:', err);
      setError(err.response?.data?.error || 'Failed to submit query');
    } finally {
      setLoading(false);
    }
  };

  const parseResult = (text) => {
    const sections = { diagnosis: '', cause: '', resolution: '', similarFaults: '', status: '' };
    const lines = text.split('\n');
    let currentSection = '';
    lines.forEach((line) => {
      if (line.startsWith('**Diagnosis:**')) currentSection = 'diagnosis';
      else if (line.startsWith('**Cause:**')) currentSection = 'cause';
      else if (line.startsWith('**Resolution:**')) currentSection = 'resolution';
      else if (line.startsWith('**Similar Past Faults:**')) currentSection = 'similarFaults';
      else if (line.startsWith('**Status:**')) currentSection = 'status';
      else if (currentSection) sections[currentSection] += line + '\n';
    });
    return sections;
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('VectorScan Fault Diagnosis', 10, 20);
    doc.setFontSize(12);
    let yPosition = 40;
    
    if (result.diagnosis.trim()) {
      doc.text('DIAGNOSIS:', 10, yPosition);
      yPosition += 10;
      const diagnosisLines = doc.splitTextToSize(result.diagnosis.trim(), 180);
      doc.text(diagnosisLines, 10, yPosition);
      yPosition += diagnosisLines.length * 5 + 15;
    }
    
    if (result.cause.trim()) {
      doc.text('ROOT CAUSE:', 10, yPosition);
      yPosition += 10;
      const causeLines = doc.splitTextToSize(result.cause.trim(), 180);
      doc.text(causeLines, 10, yPosition);
      yPosition += causeLines.length * 5 + 15;
    }
    
    if (result.resolution.trim()) {
      doc.text('RECOMMENDED SOLUTION:', 10, yPosition);
      yPosition += 10;
      const resolutionLines = doc.splitTextToSize(result.resolution.trim(), 180);
      doc.text(resolutionLines, 10, yPosition);
      yPosition += resolutionLines.length * 5 + 15;
    }
    
    doc.save('vectorscan-diagnosis-report.pdf');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-ocean font-maritime">
      {/* Enhanced Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-maritime-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center group cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-12 h-12 bg-gradient-maritime rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-all duration-300 animate-float">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-ocean-900">
                  Vector<span className="text-maritime-600">Scan</span>
                </h1>
                <p className="text-xs lg:text-sm text-ocean-600 font-medium">Diagnosis Dashboard</p>
              </div>
            </div>
            
            {/* Desktop Navigation Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  System Online
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-maritime-100 text-maritime-800">
                  🔬 AI Ready
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-ocean-600 hover:bg-ocean-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
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
            <div className="md:hidden py-4 border-t border-maritime-200">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    System Online
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-maritime-100 text-maritime-800 w-fit">
                    🔬 AI Ready
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-ocean-600 hover:bg-ocean-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center w-fit"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header Section */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-maritime-100 text-maritime-800 text-sm font-medium mb-4 lg:mb-6">
            <span className="w-2 h-2 bg-maritime-500 rounded-full mr-2 animate-pulse"></span>
            AI-Powered Maritime Fault Analysis
          </div>
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-ocean-900 mb-3 lg:mb-4">
            Fault Diagnosis <span className="text-maritime-600">Center</span>
          </h1>
          <p className="text-lg lg:text-xl text-ocean-600 max-w-2xl mx-auto">
            Describe your maritime issue and get instant AI-powered diagnosis with actionable solutions
          </p>
        </div>

        {/* Query Form */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border border-maritime-200 p-6 lg:p-8 xl:p-10 mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center mb-6 lg:mb-8">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-br from-maritime-500 to-maritime-600 rounded-xl lg:rounded-2xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg">
                <svg className="w-5 lg:w-6 h-5 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-ocean-900">Submit Fault Query</h2>
                <p className="text-sm lg:text-base text-ocean-600">Provide detailed information for accurate analysis</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <div>
              <label className="block text-sm font-semibold text-ocean-700 mb-2 lg:mb-3">
                Fault Description <span className="text-coral-500">*</span>
              </label>
              <textarea
                value={faultDescription}
                onChange={(e) => setFaultDescription(e.target.value)}
                className="w-full px-4 lg:px-5 py-3 lg:py-4 border-2 border-ocean-200 rounded-lg lg:rounded-xl focus:ring-4 focus:ring-maritime-500/20 focus:border-maritime-500 transition-all duration-300 text-ocean-900 placeholder-ocean-400 bg-white/80 resize-none"
                placeholder="e.g., Main engine overheating with temperature reaching 95°C, unusual vibrations in propeller shaft during forward thrust, hydraulic system pressure drop from 150 to 90 PSI..."
                rows="4"
                required
              />
              <div className="mt-3 flex items-start text-sm text-ocean-600">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-maritime-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Include symptoms, measurements, conditions, and any relevant context for better analysis
              </div>
            </div>

            {error && (
              <div className="bg-coral-50 border-2 border-coral-200 text-coral-700 px-4 lg:px-5 py-3 lg:py-4 rounded-lg lg:rounded-xl text-sm font-medium flex items-start animate-pulse">
                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !faultDescription.trim()}
              className="w-full bg-gradient-maritime hover:shadow-xl text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-lg lg:rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base lg:text-lg group"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>AI Analyzing Fault...</span>
                </>
              ) : (
                <>
                  <span className="group-hover:mr-4 transition-all duration-300">Get AI Diagnosis</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border border-maritime-200 p-6 lg:p-8 xl:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8">
              <div className="flex items-center mb-4 lg:mb-0">
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl lg:rounded-2xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg">
                  <svg className="w-5 lg:w-6 h-5 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-ocean-900">AI Diagnosis Complete</h2>
                  <p className="text-sm lg:text-base text-ocean-600">Analysis generated in real-time</p>
                </div>
              </div>
              <button
                onClick={handleDownloadPDF}
                className="bg-gradient-to-r from-purple-500 to-violet-600 hover:shadow-lg text-white font-semibold py-2 lg:py-3 px-4 lg:px-6 rounded-lg lg:rounded-xl transition-all duration-300 flex items-center group text-sm lg:text-base"
              >
                <svg className="w-4 lg:w-5 h-4 lg:h-5 mr-2 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download Report
              </button>
            </div>

            <div className="grid gap-4 lg:gap-6">
              {/* Diagnosis */}
              {result.diagnosis && (
                <div className="bg-gradient-to-br from-maritime-50 to-maritime-100 rounded-xl lg:rounded-2xl p-4 lg:p-6 border-2 border-maritime-200">
                  <div className="flex items-center mb-3 lg:mb-4">
                    <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-maritime rounded-lg flex items-center justify-center mr-3 shadow-md">
                      <span className="text-white text-base lg:text-lg">🔍</span>
                    </div>
                    <h3 className="text-lg lg:text-xl font-bold text-ocean-900">Primary Diagnosis</h3>
                  </div>
                  <p className="text-sm lg:text-base text-ocean-700 leading-relaxed">{result.diagnosis.trim()}</p>
                </div>
              )}

              {/* Cause */}
              {result.cause && (
                <div className="bg-gradient-to-br from-coral-50 to-red-100 rounded-xl lg:rounded-2xl p-4 lg:p-6 border-2 border-coral-200">
                  <div className="flex items-center mb-3 lg:mb-4">
                    <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-br from-coral-500 to-red-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                      <span className="text-white text-base lg:text-lg">⚠️</span>
                    </div>
                    <h3 className="text-lg lg:text-xl font-bold text-ocean-900">Root Cause Analysis</h3>
                  </div>
                  <p className="text-sm lg:text-base text-ocean-700 leading-relaxed">{result.cause.trim()}</p>
                </div>
              )}

              {/* Resolution */}
              {result.resolution && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl lg:rounded-2xl p-4 lg:p-6 border-2 border-green-200">
                  <div className="flex items-center mb-3 lg:mb-4">
                    <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                      <span className="text-white text-base lg:text-lg">🔧</span>
                    </div>
                    <h3 className="text-lg lg:text-xl font-bold text-ocean-900">Recommended Solution</h3>
                  </div>
                  <p className="text-sm lg:text-base text-ocean-700 leading-relaxed">{result.resolution.trim()}</p>
                </div>
              )}

              {/* Similar Faults */}
              {result.similarFaults && (
                <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl lg:rounded-2xl p-4 lg:p-6 border-2 border-purple-200">
                  <div className="flex items-center mb-3 lg:mb-4">
                    <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                      <span className="text-white text-base lg:text-lg">📈</span>
                    </div>
                    <h3 className="text-lg lg:text-xl font-bold text-ocean-900">Historical Analysis</h3>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3 lg:p-4 border border-purple-200">
                    <pre className="text-xs lg:text-sm text-ocean-700 leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto">{result.similarFaults.trim()}</pre>
                  </div>
                </div>
              )}

              {/* Status */}
              {result.status && (
                <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl lg:rounded-2xl p-4 lg:p-6 border-2 border-yellow-200">
                  <div className="flex items-center mb-3 lg:mb-4">
                    <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                      <span className="text-white text-base lg:text-lg">📊</span>
                    </div>
                    <h3 className="text-lg lg:text-xl font-bold text-ocean-900">Status & Priority Assessment</h3>
                  </div>
                  <p className="text-sm lg:text-base text-ocean-700 leading-relaxed">{result.status.trim()}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-ocean-900 text-white mt-12 lg:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3 lg:mb-4">
              <div className="w-6 lg:w-8 h-6 lg:h-8 bg-gradient-maritime rounded-lg flex items-center justify-center mr-2 lg:mr-3">
                <svg className="w-4 lg:w-5 h-4 lg:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-base lg:text-lg font-bold">VectorScan Maritime Solutions</span>
            </div>
            <p className="text-ocean-300 text-xs lg:text-sm mb-3">
              © 2024 VectorScan Maritime Solutions. Advanced AI Diagnostics for Maritime Operations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-ocean-400">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                System Operational
              </span>
              <span className="hidden sm:inline">•</span>
              <span>AI Engine: Active</span>
              <span className="hidden sm:inline">•</span>
              <span>Response Time: &lt;3s</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default QueryPage;