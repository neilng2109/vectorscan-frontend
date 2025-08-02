import React, { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';

const QueryPage = () => {
  const [faultDescription, setFaultDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    doc.text('VectorScan Fault Diagnosis', 10, 10);
    doc.setFontSize(12);
    doc.text('Diagnosis: ' + result.diagnosis.trim(), 10, 30);
    doc.text('Cause: ' + result.cause.trim(), 10, 40);
    doc.text('Resolution: ' + result.resolution.trim(), 10, 50);
    doc.text('Similar Past Faults: ' + result.similarFaults.trim(), 10, 60);
    doc.text('Status: ' + result.status.trim(), 10, 80);
    doc.save('diagnosis.pdf');
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
      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 pt-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-xl">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Vector<span className="text-blue-400">Scan</span>
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mt-1"></div>
              </div>
            </div>
            <p className="text-xl text-blue-100 font-light">
              🔍 AI-Powered Maritime Fault Diagnosis
            </p>
          </div>

          {/* Main Container */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-8 lg:p-12">
              
              {/* Query Form */}
              <div className="mb-10">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Fault Diagnosis Query</h2>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-blue-200 mb-3">
                        Describe the Maritime Fault or Issue
                      </label>
                      <textarea
                        value={faultDescription}
                        onChange={(e) => setFaultDescription(e.target.value)}
                        className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 resize-none"
                        placeholder="e.g., Main engine overheating, unusual vibrations in propeller shaft, hydraulic system pressure drop, electrical panel sparking..."
                        rows="4"
                        required
                      />
                      <p className="text-xs text-blue-300 mt-2 opacity-80">
                        💡 Be as detailed as possible for more accurate AI diagnosis
                      </p>
                    </div>
                    
                    {error && (
                      <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={loading || !faultDescription.trim()}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                          </svg>
                          Analyzing Fault...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Get AI Diagnosis
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Results Section */}
              {result && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-white">AI Diagnosis Results</h2>
                    </div>
                    <button
                      onClick={handleDownloadPDF}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download PDF
                    </button>
                  </div>

                  <div className="grid gap-6">
                    {/* Diagnosis */}
                    {result.diagnosis && (
                      <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/20">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-lg">🔍</span>
                          </div>
                          <h3 className="text-xl font-bold text-white">Diagnosis</h3>
                        </div>
                        <p className="text-blue-100 leading-relaxed">{result.diagnosis.trim()}</p>
                      </div>
                    )}

                    {/* Cause */}
                    {result.cause && (
                      <div className="bg-gradient-to-br from-orange-500/20 to-red-600/10 backdrop-blur-sm rounded-2xl p-6 border border-orange-400/20">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-lg">⚠️</span>
                          </div>
                          <h3 className="text-xl font-bold text-white">Root Cause</h3>
                        </div>
                        <p className="text-orange-100 leading-relaxed">{result.cause.trim()}</p>
                      </div>
                    )}

                    {/* Resolution */}
                    {result.resolution && (
                      <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-sm rounded-2xl p-6 border border-green-400/20">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-lg">🔧</span>
                          </div>
                          <h3 className="text-xl font-bold text-white">Recommended Solution</h3>
                        </div>
                        <p className="text-green-100 leading-relaxed">{result.resolution.trim()}</p>
                      </div>
                    )}

                    {/* Similar Faults */}
                    {result.similarFaults && (
                      <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/20">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-lg">📈</span>
                          </div>
                          <h3 className="text-xl font-bold text-white">Historical Analysis</h3>
                        </div>
                        <pre className="text-purple-100 leading-relaxed whitespace-pre-wrap font-mono text-sm bg-black/20 p-4 rounded-lg">{result.similarFaults.trim()}</pre>
                      </div>
                    )}

                    {/* Status */}
                    {result.status && (
                      <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 backdrop-blur-sm rounded-2xl p-6 border border-yellow-400/20">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-lg">📊</span>
                          </div>
                          <h3 className="text-xl font-bold text-white">Status & Priority</h3>
                        </div>
                        <p className="text-yellow-100 leading-relaxed">{result.status.trim()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
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

export default QueryPage;