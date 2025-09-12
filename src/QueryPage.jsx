import React, { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Keep this for PDF tables

const QueryPage = () => {
  const [faultDescription, setFaultDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // This robust parser correctly handles the simple string format from the backend.
  const parseResult = (text) => {
    if (!text || typeof text !== 'string') {
      return { diagnosis: 'N/A', cause: 'N/A', resolution: 'N/A', status: 'N/A' };
    }
  
    const diagnosisMatch = text.match(/\*\*Diagnosis:\*\*(.*?)(?=\*\*Cause:\*\*|$)/s);
    const causeMatch = text.match(/\*\*Cause:\*\*(.*?)(?=\*\*Resolution:\*\*|$)/s);
    const resolutionMatch = text.match(/\*\*Resolution:\*\*(.*?)(?=\*\*Status:|$)/s);
    const statusMatch = text.match(/\*\*Status:\*\*(.*)/s);
  
    return {
      diagnosis: diagnosisMatch ? diagnosisMatch[1].trim() : 'Diagnosis not found.',
      cause: causeMatch ? causeMatch[1].trim() : 'Cause not found.',
      resolution: resolutionMatch ? resolutionMatch[1].trim() : 'Resolution not found.',
      status: statusMatch ? statusMatch[1].trim() : 'Status not available.',
    };
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
      const response = await axios.post('https://api.vectorscan.io/query', 
        { fault_description: faultDescription },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.error) {
        setError(response.data.error);
      } else {
        // Use the parser on the 'result' string
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
    // Simplified PDF generation for the stable version
    doc.setFontSize(22);
    doc.text('VectorScan Fault Diagnosis Report', 105, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Fault: ${faultDescription}`, 15, 30);
    doc.text(`Diagnosis: ${result.diagnosis}`, 15, 40);
    doc.text(`Cause: ${result.cause}`, 15, 50);
    doc.text(`Resolution: ${result.resolution}`, 15, 60);
    doc.save('VectorScan-Report.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-4xl w-full">
        <header className="text-center mb-6">
          <img src="/vectorscan-logo.png" alt="VectorScan Logo" className="h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">VectorScan Diagnosis</h1>
        </header>
        <form onSubmit={handleSubmit} className="mb-8 space-y-4">
          <div>
            <label htmlFor="fault-description" className="block text-sm font-medium text-gray-700">Fault Description</label>
            <input
              id="fault-description"
              type="text"
              value={faultDescription}
              onChange={(e) => setFaultDescription(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., main engine overheat"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
            {loading ? 'Diagnosing...' : 'Get Diagnosis'}
          </button>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </form>
        {result && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg text-gray-700">Diagnosis</h3>
              <p className="p-3 bg-gray-50 rounded-md">{result.diagnosis}</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-700">Cause</h3>
              <p className="p-3 bg-gray-50 rounded-md">{result.cause}</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-700">Resolution</h3>
              <p className="p-3 bg-gray-50 rounded-md">{result.resolution}</p>
            </div>
             <div>
              <h3 className="font-bold text-lg text-gray-700">Status</h3>
              <p className="p-3 bg-gray-50 rounded-md">{result.status}</p>
            </div>
            <button onClick={handleDownloadPDF} className="w-full mt-4 bg-green-600 text-white p-2 rounded-md hover:bg-green-700">Download PDF Report</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryPage;

