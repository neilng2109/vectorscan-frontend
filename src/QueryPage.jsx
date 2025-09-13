import React, { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';

const QueryPage = () => {
  const [faultDescription, setFaultDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- NEW DIAGNOSTIC PARSER ---
  const parseResult = (text) => {
    if (!text || typeof text !== 'string') {
      return { diagnosis: 'N/A', cause: 'N/A', resolution: 'N/A', status: 'N/A' };
    }
  
    // More robust regex to capture content between keywords, accounting for variations.
    const diagnosisMatch = text.match(/\*\*Diagnosis:\*\*(.*?)(?=\*\*Cause:\*\*|$)/s);
    const causeMatch = text.match(/\*\*Cause:\*\*(.*?)(?=\*\*Resolution:\*\*|$)/s);
    const resolutionMatch = text.match(/\*\*Resolution:\*\*(.*?)(?=\*\*Status:|$)/s);
    const statusMatch = text.match(/\*\*Status:\*\*(.*)/s);
  
    const parsedData = {
      diagnosis: diagnosisMatch ? diagnosisMatch[1].trim() : 'Parsing failed.',
      cause: causeMatch ? causeMatch[1].trim() : 'Parsing failed.',
      resolution: resolutionMatch ? resolutionMatch[1].trim() : 'Parsing failed.',
      status: statusMatch ? statusMatch[1].trim() : 'Parsing failed.',
    };

    // --- THIS IS THE NEW DIAGNOSTIC LOG ---
    console.log("--- PARSER DIAGNOSTICS ---", {
        inputText: text,
        diagnosisMatch: diagnosisMatch,
        causeMatch: causeMatch,
        resolutionMatch: resolutionMatch,
        statusMatch: statusMatch,
        parsedData: parsedData
    });

    return parsedData;
  };

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
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log("RAW AI RESPONSE:", response.data.result);

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
    let yPos = 20;

    const addSection = (title, content) => {
        if (yPos > 260) {
            doc.addPage();
            yPos = 20;
        }
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(title, 15, yPos);
        yPos += 8;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        const wrappedContent = doc.splitTextToSize(content, 180);
        doc.text(wrappedContent, 15, yPos);
        yPos += wrappedContent.length * 5 + 12;
    };

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text('VectorScan Fault Diagnosis Report', 105, 15, { align: 'center' });
    yPos = 30;

    addSection('Initial Fault Description:', faultDescription);
    addSection('AI-Powered Diagnosis:', result.diagnosis);
    addSection('Probable Cause:', result.cause);
    addSection('Recommended Resolution:', result.resolution);
    addSection('Status:', result.status);

    doc.save(`VectorScan_Report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-300 flex items-center justify-center font-sans p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl">
        <header className="text-center mb-8">
          <img src="/vectorscan-logo.png" alt="VectorScan Logo" className="h-20 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-blue-800">VectorScan Query</h1>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-lg shadow-inner mb-8">
          <div>
            <label htmlFor="fault-description" className="block text-sm font-medium text-gray-700 mb-1">Fault Description</label>
            <input
              id="fault-description"
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
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center text-base font-semibold"
          >
            {loading ? 'Submitting...' : 'Submit Query'}
          </button>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </form>
        {result && (
          <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
            <h2 className="text-2xl font-semibold text-blue-800 mb-6 text-center">Diagnosis Result</h2>
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-gray-700 text-lg">Diagnosis</h3>
                <p className="mt-1 text-gray-800 bg-white p-3 rounded">{result.diagnosis}</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-700 text-lg">Cause</h3>
                <p className="mt-1 text-gray-800 bg-white p-3 rounded">{result.cause}</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-700 text-lg">Resolution</h3>
                <p className="mt-1 text-gray-800 bg-white p-3 rounded">{result.resolution}</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-700 text-lg">Status</h3>
                <p className="mt-1 text-gray-800 bg-white p-3 rounded">{result.status}</p>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="mt-8 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-semibold"
            >
              Download PDF Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryPage;

