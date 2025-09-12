import React, { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // For better table handling in PDF

const QueryPage = () => {
  const [faultDescription, setFaultDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * This function parses the formatted string from the backend into a structured object.
   * It uses regular expressions to reliably find the Diagnosis, Cause, and Resolution sections,
   * regardless of how the AI formats the string.
   */
  const parseResult = (text) => {
    if (!text || typeof text !== 'string') {
      return { diagnosis: 'N/A', cause: 'N/A', resolution: 'N/A' };
    }
  
    const diagnosisMatch = text.match(/\*\*Diagnosis:\*\*(.*?)(?=\*\*Cause:\*\*|$)/s);
    const causeMatch = text.match(/\*\*Cause:\*\*(.*?)(?=\*\*Resolution:\*\*|$)/s);
    const resolutionMatch = text.match(/\*\*Resolution:\*\*(.*?)(?=\*\*Status:|\*\*Similar Past Faults:|$)/s);
    const statusMatch = text.match(/\*\*Status:\*\*(.*)/s);
  
    const parsedData = {
      diagnosis: diagnosisMatch ? diagnosisMatch[1].trim() : 'N/A',
      cause: causeMatch ? causeMatch[1].trim() : 'N/A',
      resolution: resolutionMatch ? resolutionMatch[1].trim() : 'N/A',
      status: statusMatch ? statusMatch[1].trim() : 'Status not provided.'
    };

    // If no specific sections are found, assume the entire text is the diagnosis.
    if (parsedData.diagnosis === 'N/A' && parsedData.cause === 'N/A' && parsedData.resolution === 'N/A') {
        parsedData.diagnosis = text;
    }

    return parsedData;
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
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.data.error) {
        setError(response.data.error);
      } else {
        // We now parse the string from the backend before setting the state.
        setResult(parseResult(response.data.result));
      }
    } catch (err)      {
      console.error('Query error:', err);
      setError(err.response?.data?.error || 'Failed to submit query');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    let y = 20;

    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text('VectorScan Fault Diagnosis Report', 105, 18, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(15, 25, 195, 25);
    y = 35;

    // Initial Fault
    doc.setFontSize(12);
    doc.text('Initial Fault Description:', 15, y);
    doc.setFont("helvetica", "normal");
    const wrappedFault = doc.splitTextToSize(faultDescription, 180);
    doc.text(wrappedFault, 15, y + 5);
    y += wrappedFault.length * 5 + 10;

    // Create a simplified list for the PDF content
    const sections = [
        { title: 'Diagnosis', content: result.diagnosis },
        { title: 'Probable Cause', content: result.cause },
        { title: 'Recommended Resolution', content: result.resolution }
    ];

    sections.forEach(section => {
        doc.setFont("helvetica", "bold");
        doc.text(section.title + ':', 15, y);
        doc.setFont("helvetica", "normal");
        const wrappedContent = doc.splitTextToSize(section.content.trim() || 'N/A', 180);
        doc.text(wrappedContent, 15, y + 5);
        y += wrappedContent.length * 5 + 10;
    });

    doc.save(`VectorScan_Report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-4xl w-full">
        <header className="text-center mb-6">
          <img src="/vectorscan-logo.png" alt="VectorScan Logo" className="h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">VectorScan Expert Diagnosis</h1>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-lg shadow-inner mb-8">
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
            {loading ? 'Diagnosing...' : 'Get Expert Diagnosis'}
          </button>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </form>
        {result && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg text-gray-700">Diagnosis</h3>
              <p className="p-3 bg-gray-50 rounded-md">{result.diagnosis || 'N/A'}</p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg text-gray-700">Cause</h3>
              <p className="p-3 bg-gray-50 rounded-md">{result.cause || 'N/A'}</p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-700">Resolution</h3>
              <p className="p-3 bg-gray-50 rounded-md">{result.resolution || 'N/A'}</p>
            </div>

            <div className="text-xs text-gray-400 p-3 border-t">
              <p><strong>Status:</strong> {result.status}</p>
            </div>

            <button onClick={handleDownloadPDF} className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700">Download PDF Report</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryPage;

