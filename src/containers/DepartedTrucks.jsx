import { useEffect, useState } from 'react';
import axios from '../utils/axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  Search,
  Truck,
  Download,
  Calendar,
  X
} from 'lucide-react';

export default function DepartedTrucks() {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
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

  // Reset all filters
  const resetFilters = () => {
    setFilterSingleDate('');
    setFilterMonth('');
    setFilterYear('');
    setSearch('');
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
    <div className="bg-slate-50">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 sm:p-2 md:p-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-1 md:gap-2">
            <div>
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900">Departed Trucks</h1>
              <p className="text-slate-600 mt-0 text-[10px] sm:text-xs md:text-sm">View and track departed truck records</p>
            </div>
            <div>
              <button
                onClick={handleDownload}
                className="flex items-center gap-0.5 sm:gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-1 py-0.5 sm:px-2 sm:py-1 md:px-2 md:py-1.5 rounded-md font-medium transition-colors shadow-sm text-[10px] sm:text-xs md:text-sm min-w-[70px]"
              >
                <Download className="w-3 h-3" /> <span>Export Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 my-1 sm:my-2 p-1 sm:p-1 md:p-2">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-2 md:gap-3">
            <div className="col-span-1">
              <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-0.5">Search</label>
              <input
                type="text"
                placeholder="Search by Driver or Hauler"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-1 py-0.5 sm:px-1 sm:py-1 md:px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[10px] sm:text-xs"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-0.5">Date</label>
              <input
                type="date"
                value={filterSingleDate}
                onChange={(e) => setFilterSingleDate(e.target.value)}
                className="w-full px-1 py-0.5 sm:px-1 sm:py-1 md:px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[10px] sm:text-xs"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-0.5">Month</label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full px-1 py-0.5 sm:px-1 sm:py-1 md:px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[10px] sm:text-xs"
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-0.5">Year</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-1 py-0.5 sm:px-1 sm:py-1 md:px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[10px] sm:text-xs"
              >
                <option value="">All Years</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            
            <div className="col-span-1 sm:col-span-4 flex justify-end mt-1">
              <button
                onClick={resetFilters}
                className="px-1 py-0.5 sm:px-2 sm:py-1 md:px-2 md:py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md transition-colors text-[10px] sm:text-xs flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Download Popup */}
        {showDownloadPopup && (
          <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-md shadow-lg animate-pulse z-50">
            Preparing Excel file...
          </div>
        )}

        {/* No Data Fallback */}
        {filteredData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-10 text-center">
            <Truck className="mx-auto w-12 h-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-700">No departed trucks found</h3>
            <p className="text-sm text-gray-500 mt-1">Try adjusting filters or search.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Custom scrollbar styles */}
            <style>
              {`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 8px;
                  height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: #f1f5f9;
                  border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #cbd5e1;
                  border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #94a3b8;
                }
              `}
            </style>
            <div className="overflow-auto max-h-[600px] custom-scrollbar">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Driver</th>
                    <th className="px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Hauler</th>
                    <th className="px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Company</th>
                    <th className="px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Plate Number#</th>
                    <th className="px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Departure Date</th>
                    <th className="px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Departure Time</th>
                    <th className="px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">DN Number</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredData.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] sm:text-xs text-slate-700">{d.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] sm:text-xs text-slate-700">{d.haulerId?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] sm:text-xs text-slate-700">{d.companyId?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] sm:text-xs text-slate-700">{d.plateNumber || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] sm:text-xs text-slate-700">
                        {d.departureTime ? new Date(d.departureTime).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] sm:text-xs text-slate-700">
                        {d.departureTime ? new Date(d.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] sm:text-xs text-slate-700">{d.dnNumber || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}