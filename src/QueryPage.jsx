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
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-5xl">
        <header className="text-center mb-8">
          <img src="/vectorscan-logo.png" alt="VectorScan Logo" className="h-32 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-white bg-blue-700 p-3 rounded-t-lg">VectorScan Query</h1>
        </header>
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-8 rounded-lg shadow-inner">
          <div>
            <label className="block text-base font-medium text-gray-700">Fault Description</label>
            <input
              type="text"
              value={faultDescription}
              onChange={(e) => setFaultDescription(e.target.value)}
              className="mt-2 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-lg"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center text-lg"
          >
            {loading ? 'Submitting...' : 'Submit Query'}
          </button>
          {error && <p className="text-red-600 text-base">{error}</p>}
        </form>
        {result && (
          <div className="mt-8 p-8 bg-gray-50 rounded-lg shadow-inner">
            <h2 className="text-2xl font-semibold text-blue-800 mb-6">Diagnosis Result</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg">Diagnosis</h3>
                <p className="text-base">{result.diagnosis.trim()}</p>
              </div>
              <div>
                <h3 className="font-bold text-lg">Cause</h3>
                <p className="text-base">{result.cause.trim()}</p>
              </div>
              <div>
                <h3 className="font-bold text-lg">Resolution</h3>
                <p className="text-base">{result.resolution.trim()}</p>
              </div>
              <div>
                <h3 className="font-bold text-lg">Similar Past Faults</h3>
                <pre className="whitespace-pre-wrap text-base">{result.similarFaults.trim()}</pre>
              </div>
              <div>
                <h3 className="font-bold text-lg">Status</h3>
                <p className="text-base">{result.status.trim()}</p>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="mt-6 bg-green-600 text-white p-3 rounded-md hover:bg-green-700 text-lg"
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