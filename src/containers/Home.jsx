import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const [drivers, setDrivers] = useState([]);
  const [dnNumbers, setDnNumbers] = useState({});
  const [destinations, setDestinations] = useState({});
  const [driverTimes, setDriverTimes] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [companies, setCompanies] = useState(['All']);

  // Load drivers
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get('/api/drivers');
        const driverList = res.data;

        const dnInit = {};
        const destInit = {};
        const timeInit = {};

        driverList.forEach((d) => {
          dnInit[d._id] = d.dnNumber || '';
          destInit[d._id] = d.destination || '';
          timeInit[d._id] = {
            arrival: d.arrivalTime || null,
            departure: d.departureTime || null
          };
        });

        setDrivers(driverList);
        setDnNumbers(dnInit);
        setDestinations(destInit);
        setDriverTimes(timeInit);

        const companyList = [...new Set(driverList.map(d => d.company))];
        setCompanies(['All', ...companyList]);
      } catch (err) {
        console.error('Failed to load drivers:', err.message);
        toast.error('Failed to fetch drivers');
      }
    }

    fetchData();
  }, []);

  // Binary search filter
  const binarySearch = (list, key, value) => {
    let low = 0;
    let high = list.length - 1;
    const results = [];

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const item = list[mid];

      if ((key === 'name' && item.name.toLowerCase().includes(value)) ||
          (key === 'plateNumber' && item.plateNumber.toLowerCase().includes(value))) {
        let left = mid - 1;
        let right = mid + 1;

        results.push(item);

        while (left >= 0 && list[left][key]?.toLowerCase().includes(value)) {
          results.push(list[left--]);
        }

        while (right < list.length && list[right][key]?.toLowerCase().includes(value)) {
          results.push(list[right++]);
        }

        return results;
      }

      if ((item[key] || '').toLowerCase() < value) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return results;
  };

  const filteredDrivers = searchTerm.trim()
    ? binarySearch([...drivers].sort((a, b) => a.name.localeCompare(b.name)), 'name', searchTerm.toLowerCase())
    : selectedCompany === 'All'
    ? drivers
    : drivers.filter(d => d.company === selectedCompany);

  // Format current time
  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Set time on click
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

  // Save driver with destination data
  const handleSave = async (driverId) => {
    try {
      const driverData = {
        ...filteredDrivers.find(d => d._id === driverId),
        dnNumber: dnNumbers[driverId],
        arrivalTime: driverTimes[driverId]?.arrival,
        departureTime: driverTimes[driverId]?.departure,
        destination: destinations[driverId]
      };

      const res = await axios.put(`/api/drivers/${driverId}`, driverData);
      toast.success('Destination saved successfully!', { autoClose: 2000 });

      // Update local state
      setDrivers(prev => prev.map(d => d._id === driverId ? res.data : d));
    } catch (err) {
      console.error('Error saving destination:', err.response?.data || err.message);
      toast.error('Failed to save destination.', { autoClose: 3000 });
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = filteredDrivers.map(driver => ({
      'Plate Number': driver.plateNumber,
      'Name': driver.name,
      'Company': driver.company,
      'Product Type': driver.productType,
      'DN Number': dnNumbers[driver._id] || '',
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

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Destination Log</h1>
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by name or plate..."
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

      {/* Table */}
      <div className="bg-white shadow-lg rounded-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['DN Number', 'Arrival Time', 'Departure Time', 'Destination', 'Plate Number', 'Name', 'Company', 'Product Type'].map(header => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDrivers.length > 0 ? (
                filteredDrivers.map((driver) => {
                  const arrival = getTime(driver._id, 'arrival');
                  const departure = getTime(driver._id, 'departure');

                  return (
                    <tr key={driver._id}>
                      {/* DN Number */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          placeholder="Enter DN"
                          value={dnNumbers[driver._id] || ''}
                          onChange={(e) =>
                            setDnNumbers(prev => ({ ...prev, [driver._id]: e.target.value }))
                          }
                          className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>

                      {/* Arrival Time */}
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

                      {/* Departure Time */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {departure !== 'N/A' ? (
                          <span className="text-purple-600 text-sm font-medium">{departure}</span>
                        ) : (
                          <button
                            onClick={() => setTime('departure', driver._id)}
                            disabled={!arrival}
                            className={`px-4 py-1.5 rounded font-semibold ${
                              !arrival ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600 text-white'
                            }`}
                          >
                            Set
                          </button>
                        )}
                      </td>

                      {/* Destination */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          placeholder="Enter destination"
                          value={destinations[driver._id] || ''}
                          onChange={(e) =>
                            setDestinations(prev => ({ ...prev, [driver._id]: e.target.value }))
                          }
                          className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>

                      {/* Driver Info */}
                      <td className="px-6 py-4 whitespace-nowrap">{driver.plateNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{driver.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{driver.company}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{driver.productType}</td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleSave(driver._id)}
                          className="px-4 py-1.5 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}