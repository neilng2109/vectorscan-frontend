import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';

function Query() {
  const [faultInput, setFaultInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPastFaults, setShowPastFaults] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState('');
  const exampleQueries = [
    'emergency generator breaker trip',
    'cooling pump overheating',
    'steering gear pump vibration',
    'hvac no power',
    'freshwater generator desalination failure',
    'fire suppression system pressure loss',
    'navigation radar malfunction',
    'ballast tank valve leak',
    'main engine fuel injector fault',
    'bilge pump failure',
    'bow thruster hydraulic failure',
    'galley refrigeration unit failure',
    'stabilizer fin hydraulic leak',
    'passenger elevator control failure',
    'wastewater treatment system overflow'
  ];

  useEffect(() => {
    setCurrentTimestamp(new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris', timeZoneName: 'short' }).replace(',', ''));
  }, [result]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('https://vectorscan-api-36ef68d51551.herokuapp.com/query', { fault_input: faultInput }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(response.data.result);
    } catch (err) {
      setError('Failed to fetch diagnosis. Please check login or try again.');
    }
    setLoading(false);
  };

  const handleExampleSelect = (query) => {
    setFaultInput(query);
    setResult(null);
  };

  const downloadPDF = () => {
  const doc = new jsPDF();
  doc.setFont('Inter'); // Font name might need adjustment
  doc.setFontSize(16);
  doc.text(faultInput.toUpperCase() + ' DIAGNOSIS', 10, 10);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris', timeZoneName: 'short' }).replace(',', '')}`, 10, 20);
  doc.setFontSize(12);
  const lines = result.split('\n');
  let y = 30;
  lines.forEach(line => {
    if (line.length > 90) {
      const chunks = line.match(/.{1,90}/g);
      chunks.forEach(chunk => {
        doc.text(chunk, 10, y);
        y += 10;
      });
    } else {
      doc.text(line, 10, y);
      y += 10;
    }
  });
  doc.save('VectorScan_Diagnosis.pdf');
};

  const parseResult = (text) => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    let diagnosis = '', actions = [], pastFaults = [];
    let section = '';
    let mockDates = ['2024-11-15', '2024-09-22', '2024-07-10'];
    let dateIndex = 0;
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('Diagnosis:')) {
        section = 'diagnosis';
        diagnosis = trimmedLine.replace('Diagnosis:', '').trim();
      } else if (trimmedLine.startsWith('Recommended Actions:')) {
        section = 'actions';
      } else if (trimmedLine.startsWith('Similar Past Faults:')) {
        section = 'pastCourses';
      } else if (section === 'actions') {
        if (trimmedLine.match(/^(\d+\.\s)?(\[!]|-)/)) {
          actions.push(trimmedLine.replace(/^\d+\.\s/, '').replace('[!]', '[!] ').trim());
        }
      } else if (section === 'pastCourses' && trimmedLine.includes('|')) {
        const cols = trimmedLine.split('|').map(col => col.trim()).filter(col => col);
        if (cols.length >= 5 && !trimmedLine.includes('Equipment')) {
          pastFaults.push({
            equipment: cols[0],
            fault: cols[1],
            resolution: cols[2],
            date: mockDates[dateIndex++ % mockDates.length],
            id: cols[4]
          });
        }
      }
    });
    return { diagnosis, actions, pastFaults };
  };

  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 font-['Inter']">
      <header className="w-full max-w-5xl bg-blue-900 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="vectorscan-logo.png" alt="VectorScan Logo" className="h-16 w-auto" onError={() => console.log('Failed to load logo')} />
          <h1 className="text-2xl font-bold">VectorScan Troubleshooting Platform</h1>
        </div>
        <div className="text-lg">Integrated with CBM Systems</div>
      </header>
      <main className="w-full max-w-5xl bg-white p-6 rounded-b-lg shadow-lg flex flex-col gap-6">
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="mb-6">
            <label htmlFor="faultInput" className="block text-lg font-medium text-gray-700 mb-2">
              Enter Fault Description
            </label>
            <div className="flex gap-2">
              <input
                id="faultInput"
                type="text"
                value={faultInput}
                onChange={(e) => setFaultInput(e.target.value)}
                placeholder="e.g., Emergency Generator Breaker Trip"
                className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Fault description input"
              />
              <select
                onChange={(e) => handleExampleSelect(e.target.value)}
                className="p-3 border rounded-lg"
              >
                <option value="">Example Queries</option>
                {exampleQueries.map((query, index) => (
                  <option key={index} value={query}>{query}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Diagnosing...
                </span>
              ) : 'Diagnose Fault'}
            </button>
          </form>
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 flex justify-between">
              {error}
              <button onClick={handleSubmit} className="text-blue-600 hover:underline">Retry</button>
            </div>
          )}
          {result && (
            <div className="bg-gray-50 p-6 rounded-lg transition-opacity duration-300 opacity-100">
              {(() => {
                const { diagnosis, actions, pastFaults } = parseResult(result);
                return (
                  <>
                    <h2 className="text-xl font-semibold text-blue-900 mb-4">{faultInput.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())} Diagnosis</h2>
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-700">Diagnosis</h3>
                      <p className="text-gray-600">{diagnosis}</p>
                    </div>
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-700">Recommended Actions</h3>
                      {actions.length > 0 ? (
                        <ul className="list-disc pl-5 text-gray-600">
                          {actions.map((action, index) => (
                            <li key={index}>{action.replace('-', '').replace('[!]', '[!] ').trim()}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No specific actions recommended.</p>
                      )}
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <button
                        onClick={() => setShowPastFaults(!showPastFaults)}
                        className="text-blue-600 hover:underline"
                      >
                        {showPastFaults ? 'Hide' : 'Show'} Similar Past Faults
                      </button>
                      <div>
                        <button
                          onClick={downloadPDF}
                          className="text-blue-600 hover:underline mr-4"
                        >
                          Download PDF
                        </button>
                        <a
                          href={`https://mast.example.com/asset/${pastFaults[0]?.id || '103'}`}
                          target="_blank"
                          className="text-blue-600 hover:underline"
                        >
                          View in CBM System
                        </a>
                      </div>
                    </div>
                    {showPastFaults && pastFaults.length > 0 ? (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-blue-100">
                            <th className="border p-2 text-left">Equipment</th>
                            <th className="border p-2 text-left">Fault</th>
                            <th className="border p-2 text-left">Resolution</th>
                            <th className="border p-2 text-left">Date</th>
                            <th className="border p-2 text-left">ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pastFaults.map((fault, index) => (
                            <tr key={index} className="border-b">
                              <td className="border p-2">{fault.equipment}</td>
                              <td className="border p-2">{fault.fault}</td>
                              <td className="border p-2">{fault.resolution}</td>
                              <td className="border p-2">{fault.date}</td>
                              <td className="border p-2">{fault.id}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : showPastFaults ? (
                      <p className="text-gray-600">No similar past faults found.</p>
                    ) : null}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </main>
      <footer className="w-full max-w-5xl bg-gray-200 p-4 rounded-b-lg mt-4 text-center text-gray-600">
        VectorScan v1.0 | Contact: support@vectorscan.io | Updated: {currentTimestamp}
      </footer>
    </div>
  );
}

export default Query;