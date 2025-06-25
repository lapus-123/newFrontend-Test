import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Search,
  Truck,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function DriverHistory() {
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [companies, setCompanies] = useState(['All']);
  const [page, setPage] = useState(1);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);

  // Load all drivers (no filtering here)
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get('/api/drivers');
        const driverList = res.data;

        setDrivers(driverList);

        // Extract companies
        const companyList = [...new Set(driverList.map(d => d.company))];
        setCompanies(['All', ...companyList]);
      } catch (err) {
        console.error('Failed to fetch drivers:', err.message);
      }
    }

    fetchData();
  }, []);

  // Helper: Get status based on time
  const getStatus = (arrivalTime) => {
    if (!arrivalTime) return 'N/A';

    const date = new Date(arrivalTime);
    const cutoff = new Date(date);
    cutoff.setHours(15, 0, 0); // 3:00 PM

    if (date <= cutoff) {
      return 'Full Time';
    } else {
      return 'Overtime';
    }
  };

  // Format timeIn and timeOut
  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    const date = new Date(timeStr);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Filter data
  const filteredData = drivers.filter((d) => {
    const matchesSearch = !searchTerm ||
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.truckType?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany = selectedCompany === 'All' || d.company === selectedCompany;

    return matchesSearch && matchesCompany;
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Export to Excel
  const exportToExcel = () => {
    setShowDownloadPopup(true);

    setTimeout(() => {
      const excelData = filteredData.map((d) => ({
        'Truck Number': d.plateNumber,
        'Driver Name': d.name,
        'Arrival Time': d.arrivalTime || 'N/A',
        'Departure Time': d.departureTime || 'N/A',
        'Company': d.company,
        'Product Type': d.productType,
        'DN Number': d.dnNumber || 'N/A',
        'Status': getStatus(d.arrivalTime),
        'Destination': d.destination || 'N/A'
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Driver History');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'Driver_History.xlsx');

      setShowDownloadPopup(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <h1 className="text-3xl font-bold text-blue-600 mb-6">Driver History</h1>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by Name, Plate, or Truck"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            {companies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-transform transform hover:scale-105"
          >
            <Download size={18} />
            <span>Export Excel</span>
          </button>
        </div>

        {/* Popup for download animation */}
        {showDownloadPopup && (
          <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-md shadow-lg animate-pulse z-50">
            Preparing Excel file...
          </div>
        )}

        {/* Table */}
        {paginatedData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-10 text-center">
            <Truck className="mx-auto w-12 h-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-700">No records found</h3>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Truck Number', 'Driver Name', 'Arrival Time', 'Departure Time', 'Company', 'Product Type', 'DN Number', 'Status', 'Destination'].map(header => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.map((d) => (
                      <tr key={d._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{d.plateNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatTime(d.arrivalTime)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatTime(d.departureTime)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.company}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.productType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.dnNumber || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-block px-3 py-1 rounded-full text-white text-xs ${
                            getStatus(d.arrivalTime) === 'Full Time' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}>
                            {getStatus(d.arrivalTime)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.destination || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  page === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Prev
              </button>
              <span className="text-sm text-gray-600">
                Page <span className="font-semibold">{page}</span> of{' '}
                <span className="font-semibold">{totalPages}</span>
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  page === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}