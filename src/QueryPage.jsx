import React, { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // For better table handling in PDF

const QueryPage = () => {
  const [faultDescription, setFaultDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        // The backend now sends a structured object, so no parsing is needed.
        setResult(response.data.result);
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

    // Diagnosis & Confidence
    doc.setFont("helvetica", "bold");
    doc.text('Diagnosis:', 15, y);
    doc.setFont("helvetica", "normal");
    const wrappedDiagnosis = doc.splitTextToSize(result.diagnosis || 'N/A', 180);
    doc.text(wrappedDiagnosis, 15, y + 5);
    y += wrappedDiagnosis.length * 5 + 5;
    doc.setFont("helvetica", "bold");
    doc.text(`Confidence Score:`, 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(result.confidence_score || 'N/A', 55, y);
    y += 10;

    // Root Causes Table
    if (result.root_causes && result.root_causes.length > 0) {
        doc.autoTable({
            startY: y,
            head: [['Potential Root Cause', 'Probability']],
            body: result.root_causes.map(rc => [rc.cause, rc.probability]),
            theme: 'striped',
            headStyles: { fillColor: [3, 102, 214] }, // Blue header
        });
        y = doc.autoTable.previous.finalY + 10;
    }

    // Resolution and Preventative Plans
    const renderList = (title, items) => {
        if (!items || items.length === 0) return;
        if (y > 250) { doc.addPage(); y = 20; } // Add new page if needed
        doc.setFont("helvetica", "bold");
        doc.text(title, 15, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        items.forEach((item, index) => {
            const wrappedItem = doc.splitTextToSize(`${index + 1}. ${item}`, 180);
            if (y + (wrappedItem.length * 5) > 280) { doc.addPage(); y = 20; }
            doc.text(wrappedItem, 15, y);
            y += wrappedItem.length * 5 + 2;
        });
        y += 5;
    };
    
    renderList('Recommended Resolution Plan:', result.resolution_plan);
    renderList('Recommended Preventative Actions:', result.preventative_actions);
    
    // Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(150);
    const wrappedDisclaimer = doc.splitTextToSize(`Disclaimer: ${result.disclaimer}`, 180);
    if (y + (wrappedDisclaimer.length * 4) > 280) { doc.addPage(); y = 20; }
    doc.text(wrappedDisclaimer, 15, y);

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
              <p className="text-sm text-gray-500 mt-1"><strong>Confidence Score:</strong> {result.confidence_score || 'N/A'}</p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg text-gray-700">Potential Root Causes</h3>
              <ul className="list-disc list-inside p-3 bg-gray-50 rounded-md space-y-1">
                {result.root_causes?.map((item, index) => (
                  <li key={index}><strong>{item.cause}</strong> (Probability: {item.probability})</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-700">Recommended Resolution Plan</h3>
              <ol className="list-decimal list-inside p-3 bg-gray-50 rounded-md space-y-1">
                {result.resolution_plan?.map((step, index) => <li key={index}>{step}</li>)}
              </ol>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-700">Recommended Preventative Actions</h3>
              <ol className="list-decimal list-inside p-3 bg-gray-50 rounded-md space-y-1">
                {result.preventative_actions?.map((step, index) => <li key={index}>{step}</li>)}
              </ol>
            </div>

            <div className="text-xs text-gray-400 p-3 border-t">
              <p><strong>Disclaimer:</strong> {result.disclaimer}</p>
            </div>

            <button onClick={handleDownloadPDF} className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700">Download Enhanced PDF Report</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryPage;

