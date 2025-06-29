import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const [drivers, setDrivers] = useState([]);
  const [destinations, setDestinations] = useState({});
  const [driverTimes, setDriverTimes] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [companies, setCompanies] = useState(['All']);
  const [highlightedRow, setHighlightedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const driversPerPage = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get('/api/drivers');
        const driverList = res.data;

        const destInit = {};
        const timeInit = {};

        driverList.forEach((d) => {
          destInit[d._id] = d.destination || '';
          timeInit[d._id] = {
            arrival: d.arrivalTime || null,
            departure: d.departureTime || null
          };
        });

        setDrivers(driverList);
        setDestinations(destInit);
        setDriverTimes(timeInit);

        const companyList = [...new Set(driverList.map(d => d.company))];
        setCompanies(['All', ...companyList]);
      } catch (err) {
        err.toast.error('Failed to fetch drivers');
      }
    }

    fetchData();
  }, []);

  const filteredDrivers = searchTerm.trim()
    ? drivers.filter((d) => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : selectedCompany === 'All'
      ? drivers
      : drivers.filter(d => d.company === selectedCompany);

  const indexOfLast = currentPage * driversPerPage;
  const indexOfFirst = indexOfLast - driversPerPage;
  const currentDrivers = filteredDrivers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredDrivers.length / driversPerPage);

  const getFormattedTime = () =>
    new Date().toLocaleString('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true
    });

  const setTime = (type, driverId) => {
    const formattedTime = getFormattedTime();
    setDriverTimes(prev => ({
      ...prev,
      [driverId]: {
        ...prev[driverId],
        [type]: formattedTime
      }
    }));
  };

  const getTime = (driverId, type) =>
    driverTimes[driverId]?.[type] || 'N/A';

  const handleSave = async (driverId) => {
    try {
      const driverData = {
        ...drivers.find(d => d._id === driverId),
        arrivalTime: driverTimes[driverId]?.arrival,
        departureTime: driverTimes[driverId]?.departure,
        destination: destinations[driverId]
      };

      const res = await axios.put(`/api/drivers/${driverId}`, driverData);
      toast.success('Saved successfully!', { autoClose: 2000 });
      setDrivers(prev => prev.map(d => d._id === driverId ? res.data : d));
      setHighlightedRow(driverId);
      setTimeout(() => setHighlightedRow(null), 2000);
    } catch (err) {
      err.toast.error('Failed to save.', { autoClose: 3000 });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/drivers/${confirmDelete}`);
      setDrivers(prev => prev.filter(d => d._id !== confirmDelete));
      toast.success('Deleted successfully.', { autoClose: 2000 });
    } catch (err) {
      err.toast.error('Failed to delete.', { autoClose: 3000 });
    } finally {
      setConfirmDelete(null);
    }
  };

  const exportToExcel = () => {
    const data = filteredDrivers.map(driver => ({
      'Name': driver.name,
      'Company': driver.company,
      'Product Type': driver.productType,
      'Arrival Time': getTime(driver._id, 'arrival'),
      'Departure Time': getTime(driver._id, 'departure'),
      'Destination': destinations[driver._id] || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Log');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'Driver_Log.xlsx');
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <ToastContainer />

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6 text-sm">Are you sure you want to delete this driver?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >Cancel</button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Destination Log</h1>
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Export
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded w-full sm:w-64"
        />
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          {companies.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="bg-white shadow-lg rounded-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Arrival Time', 'Departure Time', 'Destination', 'Name', 'Company', 'Product Type'].map(header => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentDrivers.length > 0 ? (
                currentDrivers.map((driver) => {
                  const arrival = getTime(driver._id, 'arrival');
                  const departure = getTime(driver._id, 'departure');

                  return (
                    <tr key={driver._id} className={highlightedRow === driver._id ? 'bg-yellow-100' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {arrival !== 'N/A' ? (
                          <span className="text-green-600 text-sm font-medium">{arrival}</span>
                        ) : (
                          <button
                            onClick={() => setTime('arrival', driver._id)}
                            className="px-4 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all font-semibold"
                          >
                            Set
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {departure !== 'N/A' ? (
                          <span className="text-purple-600 text-sm font-medium">{departure}</span>
                        ) : (
                          <button
                            onClick={() => setTime('departure', driver._id)}
                            disabled={!arrival}
                            className={`px-4 py-1.5 rounded font-semibold ${!arrival ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
                          >
                            Set
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          placeholder="Enter destination"
                          value={destinations[driver._id] || ''}
                          onChange={(e) => setDestinations(prev => ({ ...prev, [driver._id]: e.target.value }))}
                          className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{driver.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{driver.company}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{driver.productType}</td>
                      <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                        <button
                          onClick={() => handleSave(driver._id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >Save</button>
                        <button
                          onClick={() => setConfirmDelete(driver._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >Delete</button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No matching records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center items-center mt-6 gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1.5 rounded ${page === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}
