import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  Search,
  Truck,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function DepartedTrucks() {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);

  // Date Filters
  const [filterSingleDate, setFilterSingleDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  // Month options
  const months = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  // Year options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // Fetch data and filter only departed trucks
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get('/api/drivers');
        const departedOnly = res.data.filter(d => d.departureTime);
        setDrivers(departedOnly);
      } catch (err) {
        console.error('Failed to fetch drivers:', err.message);
      }
    }
    fetchData();
  }, []);

  // Filter by name, date, month, year, and hauler
  const filteredData = drivers.filter(d => {
    const departureDate = d.departureTime ? new Date(d.departureTime) : null;
    if (!departureDate || isNaN(departureDate.getTime())) return false;

    let match = true;

    // Apply search (now includes hauler)
    if (search.trim()) {
      const term = search.toLowerCase();
      match = d.name?.toLowerCase().includes(term) || d.haulerId?.name?.toLowerCase().includes(term);
    }
    // Apply single date filter
    if (filterSingleDate) {
      const selectedDate = new Date(filterSingleDate);
      selectedDate.setHours(0, 0, 0, 0);
      const itemDate = new Date(departureDate);
      itemDate.setHours(0, 0, 0, 0);
      match = match && itemDate.getTime() === selectedDate.getTime();
    }

    // Apply month filter
    if (filterMonth) {
      const month = parseInt(filterMonth);
      match = match && departureDate.getMonth() + 1 === month;
    }

    // Apply year filter
    if (filterYear) {
      const year = parseInt(filterYear);
      match = match && departureDate.getFullYear() === year;
    }

    return match;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Reset all filters
  const resetFilters = () => {
    setFilterSingleDate('');
    setFilterMonth('');
    setFilterYear('');
    setSearch('');
    setPage(1);
  };

  // Export to Excel
  const handleDownload = () => {
    setShowDownloadPopup(true);
    setTimeout(() => {
      const exportData = filteredData.map((d) => ({
        Driver: d.name,
        Hauler: d.haulerId?.name || 'N/A',
        Company: d.companyId?.name || 'N/A',
        Plate: d.plateNumber || 'N/A',
        'Departure Date': d.departureTime ? new Date(d.departureTime).toLocaleDateString() : 'N/A',
        'Departure Time': d.departureTime ? new Date(d.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        'DN Number': d.dnNumber || 'N/A'
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
        <h1 className="text-3xl font-bold text-purple-600 mb-6">Departed Trucks</h1>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by Driver or Hauler"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Select Date</label>
              <input
                type="date"
                value={filterSingleDate}
                onChange={(e) => setFilterSingleDate(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Select Month</label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded"
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Select Year</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button
              onClick={resetFilters}
              className="mt-6 px-3 py-2 text-sm bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-transform transform hover:scale-105"
          >
            <Download size={18} />
            <span>Export Excel</span>
          </button>
        </div>

        {/* Download Popup */}
        {showDownloadPopup && (
          <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-md shadow-lg animate-pulse z-50">
            Preparing Excel file...
          </div>
        )}

        {/* No Data Fallback */}
        {paginatedData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-10 text-center">
            <Truck className="mx-auto w-12 h-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-700">No departed trucks found</h3>
            <p className="text-sm text-gray-500 mt-1">Try adjusting filters or search.</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hauler</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plate Number#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departure Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departure Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DN Number</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.map((d) => (
                      <tr key={d._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.haulerId?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.companyId?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.plateNumber || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {d.departureTime ? new Date(d.departureTime).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {d.departureTime ? new Date(d.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.dnNumber || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${page === 1
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
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${page === totalPages
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