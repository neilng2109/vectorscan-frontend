import React, { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';

const QueryPage = () => {
  const [faultDescription, setFaultDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- THIS PARSER IS NOW CORRECTED ---
  const parseResult = (text) => {
    if (!text || typeof text !== 'string') {
      return { diagnosis: '', cause: '', resolution: '', similarFaults: '', status: '' };
    }
  
    const sections = { diagnosis: '', cause: '', resolution: '', similarFaults: '', status: '' };
  
    // Corrected Regex: Looks for optional asterisks, the word, and a colon.
    const diagnosisMatch = text.match(/\*\*Diagnosis:\*\*(.*?)(?=\*\*Cause:\*\*|$)/s);
    const causeMatch = text.match(/\*\*Cause:\*\*(.*?)(?=\*\*Resolution:\*\*|$)/s);
    const resolutionMatch = text.match(/\*\*Resolution:\*\*(.*?)(?=\*\*Similar Past Faults:|\*\*Status:|$)/s);
    const similarFaultsMatch = text.match(/\*\*Similar Past Faults:\*\*(.*?)(?=\*\*Status:|$)/s);
    const statusMatch = text.match(/\*\*Status:\*\*(.*)/s);
  
    sections.diagnosis = diagnosisMatch ? diagnosisMatch[1].trim() : 'Not provided';
    sections.cause = causeMatch ? causeMatch[1].trim() : 'Not provided';
    sections.resolution = resolutionMatch ? resolutionMatch[1].trim() : 'Not provided';
    sections.similarFaults = similarFaultsMatch ? similarFaultsMatch[1].trim() : 'Not provided';
    sections.status = statusMatch ? statusMatch[1].trim() : 'Not provided';
  
    return sections;
  };

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

  const handleDownloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('VectorScan Fault Diagnosis Report', 105, 18, { align: 'center' });
    doc.setFontSize(12);
    let yPos = 30;
    const addSection = (title, content) => {
        doc.setFont("helvetica", "bold");
        doc.text(title, 15, yPos);
        yPos += 7;
        doc.setFont("helvetica", "normal");
        const wrappedContent = doc.splitTextToSize(content, 180);
        doc.text(wrappedContent, 15, yPos);
        yPos += wrappedContent.length * 5 + 10;
    };
    addSection('Fault Description:', faultDescription);
    addSection('Diagnosis:', result.diagnosis);
    addSection('Cause:', result.cause);
    addSection('Resolution:', result.resolution);
    addSection('Status:', result.status);
    doc.save(`VectorScan_Report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-300 flex items-center justify-center font-sans p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl">
        <header className="text-center mb-8">
          <img src="/vectorscan-logo.png" alt="VectorScan Logo" className="h-20 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-blue-800">VectorScan Query</h1>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-lg shadow-inner mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fault Description</label>
            <input
              type="text"
              value={faultDescription}
              onChange={(e) => setFaultDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base"
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
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </form>
        {result && (
          <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
            <h2 className="text-2xl font-semibold text-blue-800 mb-6 text-center">Diagnosis Result</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-700">Diagnosis</h3>
                <p className="mt-1 text-gray-800">{result.diagnosis}</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-700">Cause</h3>
                <p className="mt-1 text-gray-800">{result.cause}</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-700">Resolution</h3>
                <p className="mt-1 text-gray-800">{result.resolution}</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-700">Status</h3>
                <p className="mt-1 text-gray-800">{result.status}</p>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="mt-6 w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
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

