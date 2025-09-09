import React, { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';

const QueryPage = () => {
  const [faultDescription, setFaultDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // A small change to force a new build

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!faultDescription.trim()) {
      setError('Please enter a fault description.');
      return;
    }
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

  console.log("RAW AI RESPONSE:", response.data.result); // <-- ADD THIS LINE

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
  if (!text) return { diagnosis: '', cause: '', resolution: '', similarFaults: '', status: '' };
  
  const sections = { diagnosis: '', cause: '', resolution: '', similarFaults: '', status: '' };
  const lines = text.split('\n');
  let currentSection = '';

  lines.forEach((line) => {
    // This regex looks for the word, ignoring optional leading asterisks or spaces
    if (/^..Diagnosis:/.test(line)) currentSection = 'diagnosis';
    else if (/^..Cause:/.test(line)) currentSection = 'cause';
    else if (/^..Resolution:/.test(line)) currentSection = 'resolution';
    else if (/^..Similar Past Faults:/.test(line)) currentSection = 'similarFaults';
    else if (/^..Status:/.test(line)) currentSection = 'status';
    else if (currentSection) {
      // This removes the heading from the text itself
      const cleanLine = line.replace(/^..(Diagnosis|Cause|Resolution|Similar Past Faults|Status):\s*/, '');
      sections[currentSection] += cleanLine + '\n';
    }
  });
    return sections;
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('VectorScan Fault Diagnosis', 10, 10);
    doc.setFontSize(12);
    doc.text('Diagnosis: ' + (result.diagnosis.trim() || 'N/A'), 10, 30);
    doc.text('Cause: ' + (result.cause.trim() || 'N/A'), 10, 40);
    doc.text('Resolution: ' + (result.resolution.trim() || 'N/A'), 10, 50);
    doc.text('Similar Past Faults: ' + (result.similarFaults.trim() || 'N/A'), 10, 60);
    doc.text('Status: ' + (result.status.trim() || 'N/A'), 10, 80);
    doc.save('diagnosis.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-300 flex items-center justify-center font-sans">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-6xl">
        <header className="text-center mb-8">
          <img src="/vectorscan-logo.png" alt="VectorScan Logo" className="h-24 mx-auto mb-4" />
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
          <div className="mt-8 p-6 bg-gray-50 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Diagnosis Result</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold">Diagnosis</h3>
                <p>{result.diagnosis.trim() || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-bold">Cause</h3>
                <p>{result.cause.trim() || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-bold">Resolution</h3>
                <p>{result.resolution.trim() || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-bold">Similar Past Faults</h3>
                <pre className="whitespace-pre-wrap">{result.similarFaults.trim() || 'N/A'}</pre>
              </div>
              <div>
                <h3 className="font-bold">Status</h3>
                <p>{result.status.trim() || 'N/A'}</p>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="mt-4 bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
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