import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {
  Search,
  Truck,
  Download,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function ArrivedTrucks() {
  const [drivers, setDrivers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);

  // Date and time filters
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');

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

  // Year options (last 10 years including current)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  // Fetch data and filter only arrived trucks
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get('/api/drivers');
        const arrivedOnly = res.data.filter(d => d.arrivalTime);
        setDrivers(arrivedOnly);
        setFilteredData(arrivedOnly);
      } catch (err) {
        console.error('Failed to fetch drivers:', err.message);
      }
    }
    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...drivers];

    // Apply search
    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter(d =>
        d.name?.toLowerCase().includes(term) ||
        d.haulerId?.name?.toLowerCase().includes(term)
      );
    }

    // Apply date filter
    if (filterDate) {
      const selectedDate = new Date(filterDate);
      selectedDate.setHours(0, 0, 0, 0);
      result = result.filter(d => {
        if (!d.arrivalTime) return false;
        const arrivalDate = new Date(d.arrivalTime);
        arrivalDate.setHours(0, 0, 0, 0);
        return arrivalDate.getTime() === selectedDate.getTime();
      });
    }

    // Apply month filter
    if (filterMonth) {
      const month = parseInt(filterMonth);
      result = result.filter(d => {
        if (!d.arrivalTime) return false;
        const arrivalDate = new Date(d.arrivalTime);
        return arrivalDate.getMonth() + 1 === month;
      });
    }

    // Apply year filter
    if (filterYear) {
      const year = parseInt(filterYear);
      result = result.filter(d => {
        if (!d.arrivalTime) return false;
        const arrivalDate = new Date(d.arrivalTime);
        return arrivalDate.getFullYear() === year;
      });
    }

    // Apply time filters (only if date is selected)
    if (filterDate && (fromTime || toTime)) {
      result = result.filter(d => {
        if (!d.arrivalTime) return false;

        const arrival = new Date(d.arrivalTime);
        const selectedDate = new Date(filterDate);

        // Check if arrival date matches the selected date
        const arrivalDateOnly = new Date(arrival);
        arrivalDateOnly.setHours(0, 0, 0, 0);
        const selectedDateOnly = new Date(selectedDate);
        selectedDateOnly.setHours(0, 0, 0, 0);

        if (arrivalDateOnly.getTime() !== selectedDateOnly.getTime()) {
          return false;
        }

        // Extract hours and minutes from arrival time
        const arrivalHours = arrival.getHours();
        const arrivalMinutes = arrival.getMinutes();
        const arrivalTimeInMinutes = arrivalHours * 60 + arrivalMinutes;

        // Check from time
        if (fromTime) {
          const [fromHour, fromMinute] = fromTime.split(':').map(Number);
          const fromTimeInMinutes = fromHour * 60 + fromMinute;
          if (arrivalTimeInMinutes < fromTimeInMinutes) {
            return false;
          }
        }

        // Check to time
        if (toTime) {
          const [toHour, toMinute] = toTime.split(':').map(Number);
          const toTimeInMinutes = toHour * 60 + toMinute;
          if (arrivalTimeInMinutes > toTimeInMinutes) {
            return false;
          }
        }

        return true;
      });
    }

    setFilteredData(result);
    setPage(1); // Reset pagination
  }, [search, drivers, filterDate, filterMonth, filterYear, fromTime, toTime]);

  // Pagination
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
        Driver: d.name,
        Hauler: d.haulerId?.name || 'N/A',
        'Arrival Date': d.arrivalTime ? new Date(d.arrivalTime).toLocaleDateString() : 'N/A',
        'Arrival Time': d.arrivalTime ? new Date(d.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        Company: d.companyId?.name || d.company || 'N/A',
        'Plate Number': d.plateNumber || 'N/A',
        'Created At': d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'N/A'
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Arrived Trucks');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'ArrivedTrucks.xlsx');
      setShowDownloadPopup(false);
    }, 1000);
  };

  // Reset filters
  const resetFilters = () => {
    setFilterDate('');
    setFilterMonth('');
    setFilterYear('');
    setSearch('');
    setFromTime('');
    setToTime('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">Arrived Trucks</h1>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-grow w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by Driver or Hauler"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Select Date</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => {
                    setFilterDate(e.target.value);
                    // Reset time filters when date changes
                    if (!e.target.value) {
                      setFromTime('');
                      setToTime('');
                    }
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>

              {/* Time Filters - Only show when date is selected */}
              {filterDate && (
                <>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">From Time</label>
                    <input
                      type="time"
                      value={fromTime}
                      onChange={(e) => setFromTime(e.target.value)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">To Time</label>
                    <input
                      type="time"
                      value={toTime}
                      onChange={(e) => setToTime(e.target.value)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                </>
              )}

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
                title="Reset all filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-transform transform hover:scale-105"
            >
              <Download className="w-5 h-5" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Download popup */}
        {showDownloadPopup && (
          <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-md shadow-lg animate-pulse z-50">
            Preparing Excel file...
          </div>
        )}

        {/* No data fallback */}
        {paginatedData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-10 text-center">
            <Truck className="mx-auto w-12 h-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-700">No arrived trucks found</h3>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters.</p>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plate Number #</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.map((d) => (
                      <tr key={d._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{d.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.haulerId?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {d.arrivalTime ? new Date(d.arrivalTime).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {d.arrivalTime ? new Date(d.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.companyId?.name || d.company || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.plateNumber || 'N/A'}</td>
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
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${page === 1
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
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${page === totalPages
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