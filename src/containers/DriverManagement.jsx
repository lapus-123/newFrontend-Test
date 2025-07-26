import React, { useState, useEffect } from 'react';
import {
    Search, Clock, Truck, User,
    ArrowRight, Plus, Calendar, X, Edit, Trash2
} from 'lucide-react';
import axios from '../utils/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import ConfirmationModal from '../components/ConfirmationModal';
import RecordArrivalModal from './Modals/RecordArrivalModal';
import RecordDepartureModal from './Modals/RecordDepartureModal';

export default function DriverManagement() {
    const [driversData, setDriversData] = useState([]);
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
        companyId: '',
        hauler: '',
        haulerId: '',
        truckType: '',
        truckTypeId: '',
        arrivalTime: '',
        departureTime: '',
        destination: '',
        products: [],
        plateNumber: '',
        dnNumber: ''
    });

    // New State for Date Filter
    const [selectedDate, setSelectedDate] = useState('');

    // Fetch data once on component mount
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
            const res = await axios.get('/api/drivers');
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
        setFormData({
            company: '',
            companyId: '',
            hauler: '',
            haulerId: '',
            truckType: '',
            truckTypeId: '',
            arrivalTime: type === 'arrival' ? getFormattedTimestamp() : '',
            departureTime: type === 'departure' ? getFormattedTimestamp() : '',
            destination: '',
            products: [],
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
            d.name?.toLowerCase().includes(term) ||
            (d.companyId?.name || d.company || '').toLowerCase().includes(term) ||
            (d.haulerId?.name || d.hauler || '').toLowerCase().includes(term)
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



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addProductField = () => {
        if (formData.products.length < 5) {
            setFormData(prev => ({
                ...prev,
                products: [...prev.products, { productId: '' }]
            }));
        }
    };

    const removeProductField = (index) => {
        setFormData(prev => ({
            ...prev,
            products: prev.products.filter((_, i) => i !== index)
        }));
    };

    const updateProductField = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            products: prev.products.map((p, i) =>
                i === index ? { ...p, [field]: value } : p
            )
        }));
    };

    const handleSubmit = async () => {
        if (!selectedDriver) {
            toast.error("No driver selected.");
            return;
        }
        const selectedCompany = companies.find(c => c.name === formData.company);
        const selectedTruck = trucks.find(t => t.type === formData.truckType);
        const payload = {
            driverDataId: selectedDriver._id,
            name: selectedDriver.name,
            plateNumber: formData.plateNumber || null,
            company: formData.company || '',
            companyId: selectedCompany?._id || null,
            truckTypeId: selectedTruck?._id || null,
            haulerId: formData.haulerId || null,
            products: formData.products,
            dnNumber: formData.dnNumber || '',
            arrivalTime: formData.arrivalTime,
            departureTime: formData.departureTime,
            destination: formData.destination
        };
        try {
            let res;
            if (mode === 'arrival') {
                res = await axios.post('/api/drivers', payload);
                setDriverLogs(prev => [res.data, ...prev]);
            } else {
                res = await axios.put(`/api/drivers/${selectedDriver._id}`, payload);
                setDriverLogs(prev => prev.map(r => r._id === res.data._id ? res.data : r));
            }
            toast.success(`${mode === 'arrival' ? 'Arrival' : 'Departure'} saved successfully!`);
            setShowModal(false);
            fetchDriverLogs(); // Only refetch logs
        } catch (err) {
            console.error('Submit error:', err);
            toast.error(err.response?.data?.error || 'Failed to update record.');
        }
    };

    const ExcelExport = () => {
        const filteredForExport = selectedDate
            ? driverLogs.filter(log => {
                const logDate = new Date(log.createdAt);
                const selected = new Date(selectedDate);
                return (
                    logDate.getFullYear() === selected.getFullYear() &&
                    logDate.getMonth() === selected.getMonth() &&
                    logDate.getDate() === selected.getDate()
                );
            })
            : driverLogs;

        const exportData = filteredForExport.map(rec => ({
            Driver: rec.name,
            'Plate Number': rec.plateNumber || '—',
            Company: rec.companyId?.name || rec.company || '—',
            'Truck Type': rec.truckTypeId?.type || rec.truckType || '—',
            Hauler: rec.haulerId?.name || rec.hauler || '—',
            'Arrival Time': rec.arrivalTime || '—',
            'Departure Time': rec.departureTime || '—',
            Destination: rec.destination || '—',
            Products: rec.products?.map(p => {
                const productName = typeof p.productId === 'string'
                    ? 'Unknown Product'
                    : p.productId?.name || 'Unknown Product';
                return productName;
            }).join(', ') || '—',
            'DN Number': rec.dnNumber || '—'
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Driver Records');
        XLSX.writeFile(wb, `DriverRecords_${selectedDate || 'all'}.xlsx`);
    };

    const handleDelete = (logId) => {
        setDeleteId(logId);
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await axios.delete(`/api/drivers/${deleteId}`);
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
        setFilteredDrivers([]);
        const normalizedProducts = rec.products.map(p => ({
            productId: typeof p.productId === 'object' ? p.productId._id : p.productId || ''
        }));
        setFormData({
            company: rec.companyId?.name || rec.company || '',
            companyId: rec.companyId || null,
            hauler: rec.haulerId?.name || rec.hauler || '',
            haulerId: rec.haulerId || null,
            truckType: rec.truckTypeId?.type || rec.truckType || '',
            truckTypeId: rec.truckTypeId || null,
            arrivalTime: rec.arrivalTime || '',
            departureTime: rec.departureTime || '',
            destination: rec.destination || '',
            products: normalizedProducts,
            plateNumber: rec.plateNumber || '',
            dnNumber: rec.dnNumber || ''
        });
    };

    const handleRecordDeparture = (rec) => {
        setMode('departure');
        setShowModal(true);
        setSelectedDriver(rec);
        setFilteredDrivers([]);
        setFormData({
            company: rec.companyId?.name || rec.company || '',
            companyId: rec.companyId || null,
            hauler: rec.haulerId?.name || rec.hauler || '',
            haulerId: rec.haulerId || null,
            truckType: rec.truckTypeId?.type || rec.truckType || '',
            truckTypeId: rec.truckTypeId || null,
            arrivalTime: rec.arrivalTime || '',
            departureTime: getFormattedTimestamp(),
            destination: rec.destination || '',
            products: rec.products || [],
            plateNumber: rec.plateNumber || '',
            dnNumber: rec.dnNumber || ''
        });
    };

    const unifiedFilteredLogs = searchTerm
        ? driverLogs.filter(log =>
            log.name?.toLowerCase().includes(searchTerm) ||
            (log.companyId?.name || log.company || '').toLowerCase().includes(searchTerm) ||
            (log.truckTypeId?.type || log.truckType || '').toLowerCase().includes(searchTerm)
        )
        : driverLogs;

    const finalFilteredLogs = selectedDate
        ? unifiedFilteredLogs.filter(log => {
            const logDate = new Date(log.createdAt);
            const selected = new Date(selectedDate);
            return (
                logDate.getFullYear() === selected.getFullYear() &&
                logDate.getMonth() === selected.getMonth() &&
                logDate.getDate() === selected.getDate()
            );
        })
        : unifiedFilteredLogs;

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
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
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

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 my-4 p-4 flex flex-col md:flex-row gap-4">
                <div className="relative w-full md:w-1/2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
                    <input
                        type="text"
                        placeholder="Search by Driver, Company, or Truck Type..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="relative w-auto">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Filter by Date
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-36 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

            </div>

            {/* Records Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Hauler</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Arrival</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Departure</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Destination</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Products</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">DN Number</th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {finalFilteredLogs.length > 0 ? (
                                finalFilteredLogs.map((rec) => (
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
                                        <td className="px-6 py-4 text-slate-600">
                                            {rec.companyId?.name || rec.company || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {rec.truckTypeId?.type || rec.truckType || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {rec.haulerId?.name || rec.hauler || '—'}
                                        </td>
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
                                        <td className="px-6 py-4 text-slate-600">
                                            {rec.products?.length > 0 ? (
                                                <ul className="space-y-1">
                                                    {rec.products.map((p, idx) => {
                                                        const productName = typeof p.productId === 'object'
                                                            ? p.productId?.name || 'Unknown Product'
                                                            : products.find(prod => prod._id === p.productId)?.name || 'Unknown Product';
                                                        return (
                                                            <li key={idx}>{productName}</li>
                                                        );
                                                    })}
                                                </ul>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
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
                                    <td colSpan="11" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="bg-slate-100 p-3 rounded-full">
                                                <Truck className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500 font-medium">No records found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {showModal && mode === 'arrival' && (
                <RecordArrivalModal
                    showModal={showModal}
                    setShowModal={setShowModal}
                    driversData={driversData}
                    filteredDrivers={filteredDrivers}
                    setFilteredDrivers={setFilteredDrivers}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedDriver={selectedDriver}
                    setSelectedDriver={setSelectedDriver}
                    companies={companies}
                    trucks={trucks}
                    products={products}
                    formData={formData}
                    setFormData={setFormData}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    addProductField={addProductField}
                    removeProductField={removeProductField}
                    updateProductField={updateProductField}
                />
            )}

            {showModal && ['departure', 'edit-full'].includes(mode) && (
                <RecordDepartureModal
                    showModal={showModal}
                    setShowModal={setShowModal}
                    selectedDriver={selectedDriver}
                    companies={companies}
                    trucks={trucks}
                    products={products}
                    formData={formData}
                    setFormData={setFormData}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    addProductField={addProductField}
                    removeProductField={removeProductField}
                    updateProductField={updateProductField}
                />
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
            <ToastContainer position="top-right" autoClose={1000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
}