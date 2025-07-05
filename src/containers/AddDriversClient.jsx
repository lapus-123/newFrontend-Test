import React, { useState, useEffect } from 'react';
import {
    Search, Clock, Truck, Building2, User,
    ArrowRight, ArrowLeft, Plus, Calendar, X, Edit2, Trash2, Edit
} from 'lucide-react';
import axios from '../utils/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import ConfirmationModal from '../components/ConfirmationModal';

export default function AddDriverClient() {
    const [driversData, setDriversData] = useState([]); // From /api/drivers-data
    const [driverLogs, setDriverLogs] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [trucks, setTrucks] = useState([]);
    const [products, setProducts] = useState([]);
    const [mode, setMode] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredDrivers, setFilteredDrivers] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [formData, setFormData] = useState({
        company: '',
        truckType: '',
        arrivalTime: '',
        departureTime: '',
        destination: '',
        product: '', // productId
        plateNumber: '',
        dnNumber: ''
    });
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [startDate, setStartDate] = useState(null); // Date filter
    const [endDate, setEndDate] = useState(null); // Date filter

    useEffect(() => {
        fetchDriversData();
        fetchDriverLogs();
        fetchCompanies();
        fetchTrucks();
        fetchProducts();
    }, []);

    const fetchDriversData = async () => {
        try {
            const res = await axios.get('/api/drivers-data');
            setDriversData(res.data);
        } catch (err) {
            console.error('Failed to fetch driver data:', err);
            toast.error('Failed to load driver list.');
        }
    };

    const fetchDriverLogs = async () => {
        try {
            const res = await axios.get('/api/drivers'); // Assuming endpoint for logs
            setDriverLogs(res.data);
        } catch (err) {
            console.error('Failed to fetch driver logs:', err);
        }
    };

    const fetchCompanies = async () => {
        try {
            const res = await axios.get('/api/companies');
            setCompanies(res.data);
        } catch (err) {
            console.error('Failed to fetch companies:', err);
        }
    };

    const fetchTrucks = async () => {
        try {
            const res = await axios.get('/api/trucks');
            setTrucks(res.data);
        } catch (err) {
            console.error('Failed to fetch trucks:', err);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await axios.get('/api/products');
            setProducts(res.data);
        } catch (err) {
            console.error('Failed to fetch products:', err);
        }
    };

    const getFormattedTimestamp = () => {
        return new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const openModal = (type) => {
        setMode(type);
        setShowModal(true);
        setSelectedDriver(null);
        setSearchTerm('');
        setFilteredDrivers([]);
        setIsDuplicate(false);
        setFormData({
            company: '',
            truckType: '',
            arrivalTime: type === 'arrival' ? getFormattedTimestamp() : '',
            departureTime: type === 'departure' ? getFormattedTimestamp() : '',
            destination: '',
            product: '',
            plateNumber: '',
            dnNumber: ''
        });
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        if (!term.trim()) {
            setFilteredDrivers([]);
            return;
        }
        const matchedDrivers = driversData.filter((d) =>
            d.name.toLowerCase().includes(term) ||
            d.company?.toLowerCase().includes(term) ||
            d.truckType?.toLowerCase().includes(term)
        );
        const today = new Date().toISOString().split('T')[0];
        const resultsWithStatus = matchedDrivers.map(driver => {
            const todaysRecords = driverLogs
                .filter(r => r.name === driver.name && r.arrivalTime?.startsWith(today))
                .sort((a, b) => new Date(b.arrivalTime) - new Date(a.arrivalTime));
            const latestRecord = todaysRecords[0] || null;
            let status = 'New Driver';
            if (latestRecord?.arrivalTime) {
                status = latestRecord.departureTime ? 'Complete' : 'Incomplete';
            }
            return {
                ...driver,
                status,
                latestRecord
            };
        });
        setFilteredDrivers(resultsWithStatus);
    };

    const selectDriver = (driver) => {
        const { latestRecord } = driver;
        setSelectedDriver(driver);
        setSearchTerm(driver.name);
        setFilteredDrivers([]);
        const today = new Date().toISOString().split('T')[0];
        const existingArrival = driverLogs.find(
            r => r.name === driver.name && r.arrivalTime?.startsWith(today)
        );
        setIsDuplicate(!!existingArrival);
        setFormData(prev => ({
            ...prev,
            company: driver.company || '',
            truckType: driver.truckTypeId?.type || driver.truckType || '',
            arrivalTime: latestRecord?.arrivalTime || '',
            departureTime: latestRecord?.departureTime || (mode === 'departure' ? getFormattedTimestamp() : ''),
            destination: latestRecord?.destination || '',
            product: latestRecord?.productId || prev.product,
            plateNumber: latestRecord?.plateNumber || driver.plateNumber || '',
            dnNumber: latestRecord?.dnNumber || ''
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!selectedDriver) {
            toast.error("No driver selected.");
            return;
        }
        const selectedCompany = companies.find(c => c.name === formData.company);
        const selectedTruck = trucks.find(t => t.type === formData.truckType);
        const selectedProduct = products.find(p => p._id === formData.product);
        const payload = {
            driverDataId: selectedDriver._id,
            name: selectedDriver.name,
            plateNumber: formData.plateNumber || null,
            company: formData.company || '',
            companyId: selectedCompany?._id || null,
            truckTypeId: selectedTruck?._id || null,
            productId: selectedProduct?._id || null,
            dnNumber: formData.dnNumber || '',
            arrivalTime: formData.arrivalTime,
            departureTime: formData.departureTime,
            destination: formData.destination
        };
        try {
            let res;
            if (mode === 'arrival') {
                res = await axios.post('/api/drivers', payload); // Assuming endpoint for logs
                setDriverLogs(prev => [res.data, ...prev]);
            } else {
                res = await axios.put(`/api/drivers/${selectedDriver._id}`, payload);
                setDriverLogs(prev => prev.map(r => r._id === res.data._id ? res.data : r));
            }
            toast.success('Record saved successfully!');
            setShowModal(false);
            // Refetch data after successful update or post
            // Refresh the page after a short delay to allow the modal to close smoothly
            setTimeout(() => {
                window.location.reload();
            }, 300);

        } catch (err) {
            console.error('Submit error:', err);
            toast.error(err.response?.data?.error || 'Failed to update record.');
        }
    };

    const ExcelExport = () => {
        const exportData = driverLogs.map(rec => ({
            Driver: rec.name,
            'Plate Number': rec.plateNumber || '—',
            Company: rec.companyId?.name || rec.company || '—',
            'Truck Type': rec.truckTypeId?.type || rec.truckType || '—',
            'Arrival Time': rec.arrivalTime || '—',
            'Departure Time': rec.departureTime || '—',
            Destination: rec.destination || '—',
            Product: rec.productId?.name || '—',
            'DN Number': rec.dnNumber || '—'
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Driver Records');
        XLSX.writeFile(wb, 'DriverRecords.xlsx');
    };

    const handleDelete = (logId) => {
        setDeleteId(logId);
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await axios.delete(`/api/drivers/${deleteId}`); // deleteId is the log record's _id
            setDriverLogs(prev => prev.filter(r => r._id !== deleteId));
            toast.success('Record deleted successfully!');
        } catch (err) {
            console.error('Delete error:', err);
            toast.error('Failed to delete record.');
        } finally {
            setShowConfirmModal(false);
            setDeleteId(null);
        }
    };

    const handleFullEdit = (rec) => {
        setMode('edit-full');
        setShowModal(true);
        setSelectedDriver(rec);
        setSearchTerm(rec.name);
        setFilteredDrivers([]);
        setFormData({
            company: rec.company || '',
            truckType: rec.truckTypeId?.type || rec.truckType || '',
            arrivalTime: rec.arrivalTime || '',
            departureTime: rec.departureTime || '',
            destination: rec.destination || '',
            product: rec.productId?._id || '',
            plateNumber: rec.plateNumber || '',
            dnNumber: rec.dnNumber || ''
        });
    };

    const handleRecordDeparture = (rec) => {
        setMode('departure');
        setShowModal(true);
        setSelectedDriver(rec);
        setSearchTerm(rec.name);
        setFilteredDrivers([]);
        setFormData({
            company: rec.company || '',
            truckType: rec.truckTypeId?.type || rec.truckType || '',
            arrivalTime: rec.arrivalTime || '',
            departureTime: getFormattedTimestamp(),
            destination: rec.destination || '',
            product: rec.productId?._id || '',
            plateNumber: rec.plateNumber || '',
            dnNumber: rec.dnNumber || ''
        });
    };

    // Date Filtering Logic
    const filteredByDate = driverLogs.filter(log => {
        const logDate = new Date(log.arrivalTime || log.departureTime);
        if (startDate && endDate) {
            return logDate >= startDate && logDate <= endDate;
        }
        if (startDate) {
            return logDate >= startDate;
        }
        if (endDate) {
            return logDate <= endDate;
        }
        return true;
    });

    // Unified Filter by Search Term
    const unifiedFilteredLogs = searchTerm
        ? filteredByDate.filter(log =>
            log.name.toLowerCase().includes(searchTerm) ||
            (log.companyId?.name || log.company || '').toLowerCase().includes(searchTerm) ||
            (log.truckTypeId?.type || log.truckType || '').toLowerCase().includes(searchTerm)
        )
        : filteredByDate;

    return (
        <div className="min-h-screen bg-slate-50 p-4 lg:p-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Driver Management</h1>
                        <p className="text-slate-600 mt-1">Track arrivals and departures</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => openModal('arrival')}
                            disabled={isDuplicate}
                            className={`flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${isDuplicate ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <ArrowRight className="w-4 h-4" />
                            Record Arrival
                        </button>
                        <button
                            onClick={ExcelExport}
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                        >
                            Export Excel
                        </button>
                    </div>
                </div>
            </div>
            {/* Date Filter & Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 my-4 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                    type="text"
                    placeholder="Search by Driver, Company, or Truck Type..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="date"
                    value={startDate?.toISOString()?.split('T')[0]}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                    className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="date"
                    value={endDate?.toISOString()?.split('T')[0]}
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                    className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            {  /* Records Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Recent Records</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Driver</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Plate No.</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Truck Type</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Arrival</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Departure</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Destination</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">DN Number</th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {unifiedFilteredLogs.length > 0 ? (
                                unifiedFilteredLogs.map((rec) => (
                                    <tr key={rec._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-slate-100 p-2 rounded-full">
                                                    <User className="w-4 h-4 text-slate-600" />
                                                </div>
                                                <span className="font-medium text-slate-900">{rec.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{rec.plateNumber || '—'}</td>
                                        <td className="px-6 py-4 text-slate-600">{rec.companyId?.name || rec.company || '—'}</td>
                                        <td className="px-6 py-4 text-slate-600">{rec.truckTypeId?.type || rec.truckType || '—'}</td>
                                        <td className="px-6 py-4">
                                            {rec.arrivalTime ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                    <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                                                    {rec.arrivalTime}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {rec.departureTime ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                                    {rec.departureTime}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{rec.destination || '—'}</td>
                                        <td className="px-6 py-4 text-slate-600">{rec.productId?.name || '—'}</td>
                                        <td className="px-6 py-4 text-slate-600">{rec.dnNumber || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleRecordDeparture(rec)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition duration-200 ease-in-out"
                                            >
                                                Record Departure
                                            </button>
                                            <button
                                                onClick={() => handleFullEdit(rec)}
                                                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition duration-200 ease-in-out"
                                            >
                                                <Edit className="w-4 h-4 inline-block mr-1" /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rec._id)}
                                                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition duration-200 ease-in-out"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="bg-slate-100 p-3 rounded-full">
                                                <Truck className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500 font-medium">No records yet</p>
                                            <p className="text-slate-400 text-sm">Start by recording an arrival or departure</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div
                        className="relative bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl" // <-- wider rectangle modal
                        style={{ minWidth: 500, maxWidth: 700 }}
                    >
                        {/* Modal Header */}
                        <div className={`px-6 py-4 border-b border-slate-200 ${mode === 'arrival' ? 'bg-emerald-50' : mode === 'edit-full' ? 'bg-yellow-50' : 'bg-blue-50'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${mode === 'arrival'
                                        ? 'bg-emerald-100'
                                        : mode === 'edit-full'
                                            ? 'bg-yellow-100'
                                            : 'bg-blue-100'
                                        }`}>
                                        {mode === 'arrival' ? (
                                            <ArrowRight className="w-5 h-5 text-emerald-600" />
                                        ) : mode === 'edit-full' ? (
                                            <Edit2 className="w-5 h-5 text-yellow-600" />
                                        ) : (
                                            <ArrowLeft className="w-5 h-5 text-blue-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">
                                            {mode === 'arrival' ? 'Record Arrival' :
                                                mode === 'edit-full' ? 'Edit Record' : 'Record Departure'}
                                        </h3>
                                        <p className="text-sm text-slate-600">
                                            {mode === 'arrival' ? 'Log driver arrival time' :
                                                mode === 'edit-full' ? 'Edit full record details' :
                                                    'Enter departure details'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>
                        {/* Modal Body */}
                        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            {/* Search Driver */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Search Driver</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        placeholder="Type driver name..."
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {filteredDrivers.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 bg-white border border-slate-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-auto z-10">
                                            {filteredDrivers.map((d) => (
                                                <button
                                                    key={d._id}
                                                    className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                                                    onClick={() => selectDriver(d)}
                                                >
                                                    <div className="font-medium text-slate-900">{d.name}</div>
                                                    <div className="text-sm">
                                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${d.status === 'Incomplete' ? 'bg-red-100 text-red-700' :
                                                            d.status === 'Complete' ? 'bg-green-100 text-green-700' :
                                                                'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {d.status || 'New Driver'}
                                                        </span>
                                                        <span className="ml-2 text-slate-500 text-xs">{d.company || ''}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Selected Driver */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Selected Driver</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={selectedDriver?.name || 'No driver selected'}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
                                />
                            </div>
                            {/* Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Company</label>
                                    <select
                                        name="company"
                                        value={formData.company}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Company</option>
                                        {companies.map(c => (
                                            <option key={c._id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Truck Type</label>
                                    <select
                                        name="truckType"
                                        value={formData.truckType}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Truck</option>
                                        {trucks.map(t => (
                                            <option key={t._id} value={t.type}>{t.type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Plate Number</label>
                                    <input
                                        name="plateNumber"
                                        value={formData.plateNumber}
                                        onChange={handleInputChange}
                                        placeholder="Enter plate number"
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Arrival Time</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="arrivalTime"
                                            value={formData.arrivalTime}
                                            onChange={handleInputChange}
                                            disabled={mode === 'departure'}
                                            className={`flex-1 px-4 py-2.5 border border-slate-300 rounded-lg ${mode === 'departure' ? 'bg-slate-100 cursor-not-allowed' : ''
                                                }`}
                                        />
                                        <button
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                arrivalTime: getFormattedTimestamp()
                                            }))}
                                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
                                            disabled={mode === 'departure'}
                                        >
                                            <Calendar className="w-4 h-4 text-slate-600" />
                                        </button>
                                    </div>
                                </div>
                                {mode !== 'arrival' && (
                                    <>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-slate-700">Departure Time</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    name="departureTime"
                                                    value={formData.departureTime}
                                                    onChange={handleInputChange}
                                                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg"
                                                />
                                                <button
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        departureTime: getFormattedTimestamp()
                                                    }))}
                                                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
                                                >
                                                    <Calendar className="w-4 h-4 text-slate-600" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Destination</label>
                                            <input
                                                name="destination"
                                                value={formData.destination}
                                                onChange={handleInputChange}
                                                placeholder="Enter destination"
                                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Product</label>
                                            <select
                                                name="product"
                                                value={formData.product}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select Product</option>
                                                {products.map(p => (
                                                    <option key={p._id} value={p._id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-slate-700">DN Number</label>
                                            <input
                                                name="dnNumber"
                                                value={formData.dnNumber}
                                                onChange={handleInputChange}
                                                placeholder="Enter DN number"
                                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!selectedDriver}
                                        className={`px-6 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${mode === 'arrival' ? 'bg-emerald-600 hover:bg-emerald-700' :
                                            mode === 'edit-full' ? 'bg-yellow-600 hover:bg-yellow-700' :
                                                'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                    >
                                        Save Record
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this record? This action cannot be undone."
                isLoading={false}
            />
            {/* Toast Container */}
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
}