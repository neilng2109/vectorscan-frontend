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
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-300 flex items-center justify-center font-sans">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-4xl">
        <header className="text-center mb-8">
          <img src="/vectorscan-logo.png" alt="VectorScan Logo" className="h-20 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-blue-800">VectorScan Query</h1>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-lg shadow-inner">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fault Description</label>
            <input
              type="text"
              value={faultDescription}
              onChange={(e) => setFaultDescription(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="e.g., main engine overheat"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center text-base"
          >
            {loading ? 'Submitting...' : 'Submit Query'}
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
        {result && (
          <div className="mt-6 p-6 bg-gray-50 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Diagnosis Result</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base">Diagnosis</h3>
                <p className="text-sm">{result.diagnosis.trim()}</p>
              </div>
              <div>
                <h3 className="font-bold text-base">Cause</h3>
                <p className="text-sm">{result.cause.trim()}</p>
              </div>
              <div>
                <h3 className="font-bold text-base">Resolution</h3>
                <p className="text-sm">{result.resolution.trim()}</p>
              </div>
              <div>
                <h3 className="font-bold text-base">Similar Past Faults</h3>
                <pre className="whitespace-pre-wrap text-sm">{result.similarFaults.trim()}</pre>
              </div>
              <div>
                <h3 className="font-bold text-base">Status</h3>
                <p className="text-sm">{result.status.trim()}</p>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="mt-4 bg-green-600 text-white p-2 rounded-md hover:bg-green-700 text-base"
            >
              Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryPage;