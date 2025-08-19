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
  Calendar
} from 'lucide-react';

export default function DriverHistory() {
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [companies, setCompanies] = useState(['All']);
  const [filterDate, setFilterDate] = useState('');
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);

  // Load all drivers
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get('/api/drivers');
        const driverList = res.data.map((d) => ({
          ...d,
          company: d.companyId?.name || 'N/A',
          truckType: d.truckTypeId?.type || 'N/A',
          products: d.products?.length > 0
            ? d.products.map(p => p.productId?.name).join(', ')
            : 'N/A',
        }));
        setDrivers(driverList);

        // Extract unique companies
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
    return date <= cutoff ? 'Full Time' : 'Overtime';
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

  // Format date only
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  // Filter data
  const filteredData = drivers.filter((d) => {
    const matchesSearch =
      !searchTerm ||
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.truckType?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany = selectedCompany === 'All' || d.company === selectedCompany;
    const matchesDate = !filterDate || formatDate(d.arrivalTime) === filterDate;
    return matchesSearch && matchesCompany && matchesDate;
  });

  // Export to Excel
  const exportToExcel = () => {
    setShowDownloadPopup(true);
    setTimeout(() => {
      const excelData = filteredData.map((d) => ({
        'Truck Number': d.plateNumber,
        'Driver Name': d.name,
        'Arrival Time': d.arrivalTime ? formatTime(d.arrivalTime) : 'N/A',
        'Departure Time': d.departureTime ? formatTime(d.departureTime) : 'N/A',
        'Company': d.company,
        'Products': d.products,
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
    <div className="bg-slate-50">
      <ToastContainer />
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 sm:p-2 md:p-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-1 md:gap-2">
            <div>
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900">Driver History</h1>
              <p className="text-slate-600 mt-0 text-[10px] sm:text-xs md:text-sm">View and track driver records</p>
            </div>
            <div>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-0.5 sm:gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-1 py-0.5 sm:px-2 sm:py-1 md:px-2 md:py-1.5 rounded-md font-medium transition-colors shadow-sm text-[10px] sm:text-xs md:text-sm min-w-[70px]"
              >
                <Download className="w-3 h-3" /> <span>Export Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 my-1 sm:my-2 p-1 sm:p-1 md:p-2">
          <div className="flex flex-col sm:flex-row gap-2 items-end">
            <div className="relative w-full md:w-1/3">
              <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-0.5">Search</label>
              <input
                type="text"
                placeholder="Search by Name, Plate, or Truck"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-1 py-0.5 sm:px-1 sm:py-1 md:px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[10px] sm:text-xs"
              />
            </div>
            <div className="w-full md:w-1/4">
              <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-0.5">Company</label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full px-1 py-0.5 sm:px-1 sm:py-1 md:px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[10px] sm:text-xs"
              >
                {companies.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-1/4">
              <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-0.5">Date</label>
              <div className="flex items-center gap-2 px-1 py-0.5 sm:px-1 sm:py-1 md:px-2 border border-slate-300 rounded-md">
                <Calendar className="w-3 h-3 text-slate-400" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="border-none focus:outline-none text-[10px] sm:text-xs w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Popup for download animation */}
        {showDownloadPopup && (
          <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-md shadow-lg animate-pulse z-50">
            Preparing Excel file...
          </div>
        )}

        {/* Records Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-1 sm:px-2 md:px-4 py-1 sm:py-1 md:py-2 border-b border-slate-200">
            <h2 className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-900">Driver Records</h2>
          </div>
          {filteredData.length === 0 ? (
            <div className="p-4 text-center">
              <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                <div className="bg-slate-100 p-0.5 sm:p-1 md:p-2 rounded-full">
                  <Truck className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium text-[10px] sm:text-xs md:text-sm">No records found</p>
                <p className="text-slate-400 text-[10px] sm:text-xs">Try adjusting your search</p>
              </div>
            </div>
          ) : (
            <div className="border-t border-slate-200">
              <div style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'scroll', overflowX: 'scroll' }}>
                <table className="w-full min-w-[700px] text-[10px] sm:text-xs md:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-500 sticky top-0 z-10">
                    <tr>
                      {[
                        'Plate Number #',
                        'Driver',
                        'Arrival',
                        'Departure',
                        'Company',
                        'Status',
                      ].map((header) => (
                        <th
                          key={header}
                          className="text-left px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1 text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredData.map((d) => (
                      <tr key={d._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1">{d.plateNumber}</td>
                        <td className="px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1">{d.name}</td>
                        <td className="px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1">{formatTime(d.arrivalTime)}</td>
                        <td className="px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1">{formatTime(d.departureTime)}</td>
                        <td className="px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1">
                          <span className={`inline-flex items-center gap-0.5 px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                            getStatus(d.arrivalTime) === 'Full Time'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            <div className={`w-1 h-1 rounded-full ${
                              getStatus(d.arrivalTime) === 'Full Time'
                                ? 'bg-emerald-600'
                                : 'bg-yellow-600'
                            }`}></div>
                            {getStatus(d.arrivalTime)}
                          </span>
                        </td>
                        <td className="px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1">{d.destination || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}