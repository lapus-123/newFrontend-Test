import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  Search,
  Truck,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function DepartedTrucks() {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);

  // Load all drivers with departureTime
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get('/api/drivers');
        const departedOnly = res.data.filter(d => d.departureTime); // Only show drivers who departed
        setDrivers(departedOnly);
      } catch (err) {
        console.error('Failed to fetch drivers:', err.message);
      }
    }

    fetchData();
  }, []);

  // Filter by search term
  const filteredData = drivers.filter(
    (d) =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.plateNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Export to Excel
  const handleDownload = () => {
    setShowDownloadPopup(true);

    setTimeout(() => {
      const exportData = filteredData.map((d) => ({
        'Truck Number': d.plateNumber,
        Driver: d.name,
        'Arrival Time': d.arrivalTime || 'N/A',
        'Departure Time': d.departureTime,
        Company: d.company,
        'Product Type': d.productType,
        'DN Number': d.dnNumber || 'N/A',
        Destination: d.destination || 'N/A'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Departed Trucks');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'DepartedTrucks.xlsx');

      setShowDownloadPopup(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-purple-600 mb-6">Departed Trucks</h1>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by Truck or Driver"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={handleDownload}
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
            <h3 className="mt-4 text-lg font-medium text-gray-700">No departed trucks found</h3>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Truck Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Arrival Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Departure Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DN Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destination
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.map((d) => (
                      <tr key={d._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{d.plateNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.arrivalTime || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.departureTime}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.company}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.productType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.dnNumber || 'N/A'}</td>
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
                    : 'bg-purple-600 text-white hover:bg-purple-700'
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
                    : 'bg-purple-600 text-white hover:bg-purple-700'
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