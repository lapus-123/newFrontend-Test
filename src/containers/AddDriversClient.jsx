import React, { useState, useEffect } from 'react';
import {
    Search, Clock, Truck, Building2, User,
    ArrowRight, ArrowLeft, Plus, Calendar, X
} from 'lucide-react';
import axios from '../utils/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddDriversClient() {
    const [drivers, setDrivers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [trucks, setTrucks] = useState([]);
    const [products, setProducts] = useState([]);
    const [records, setRecords] = useState([]);
    const [mode, setMode] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredDrivers, setFilteredDrivers] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState(null);


    const [formData, setFormData] = useState({
        company: '',
        truckType: '',
        timestamp: '',
        destination: '',
        product: ''
    });

    useEffect(() => {
        fetchDrivers();
        fetchCompanies();
        fetchTrucks();
        fetchProducts();
    }, []);

    const fetchDrivers = async () => {
        try {
            const res = await axios.get('/api/drivers');
            setDrivers(res.data);
            setRecords(res.data);
        } catch (err) {
            console.error('Failed to fetch drivers:', err);
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
        setFormData({
            company: '',
            truckType: '',
            timestamp: '',
            destination: '',
            product: ''
        });
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (!term.trim()) {
            setFilteredDrivers([]);
            return;
        }
        const results = drivers.filter((d) =>
            d.name.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredDrivers(results);
    };

    const selectDriver = (driver) => {
        setSelectedDriver(driver);
        setSearchTerm(driver.name);
        setFilteredDrivers([]);
        setFormData({
            company: driver.company || '',
            truckType: driver.truckType || '',
            timestamp: '',
            destination: driver.destination || '',
            product: driver.product || ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!selectedDriver) {
            console.warn('No driver selected.');
            return;
        }

        const selectedCompany = companies.find(c => c.name === formData.company);
        const selectedTruck = trucks.find(t => t.type === formData.truckType);
        const selectedProduct = products.find(p => p._id === formData.product); // 🔁 match by _id

        const payload = {
            name: selectedDriver.name,
            plateNumber: selectedDriver.plateNumber || null,
            age: selectedDriver.age || 0,
            address: selectedDriver.address || '',
            company: formData.company || '',
            companyId: selectedCompany?._id || null,
            truckTypeId: selectedTruck?._id || null,
            productId: selectedProduct?._id || null, // ✅ now properly matched by _id
            dnNumber: selectedDriver.dnNumber || '',
            arrivalTime: mode === 'arrival' ? formData.timestamp : selectedDriver.arrivalTime || '',
            departureTime: mode === 'departure' ? formData.timestamp : selectedDriver.departureTime || '',
            destination: mode === 'departure' ? formData.destination : selectedDriver.destination || ''
        };

        console.log('Submitting PUT payload:', payload);

        try {
            const res = await axios.put(`/api/drivers/${selectedDriver._id}`, payload);
            const updatedDriver = res.data;

            setRecords(prev => {
                const index = prev.findIndex(r => r._id === updatedDriver._id);
                if (index >= 0) {
                    const updated = [...prev];
                    updated[index] = updatedDriver;
                    return updated;
                }
                return prev;
            });

            toast.success('Record updated successfully!');
            setShowModal(false);
        } catch (err) {
            console.error('Submit error:', err);
            toast.error(err.response?.data?.error || 'Failed to update record.');
        }
    };


    return (
        <>
            <div className="min-h-screen bg-slate-50 p-4 lg:p-6">
                <div className="max-w-7xl mx-auto space-y-6">
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
                                    onClick={() => openModal('departure')}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Record Departure
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-100 p-2 rounded-lg">
                                    <ArrowRight className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-slate-600 text-sm font-medium">Total Arrivals</p>
                                    <p className="text-2xl font-bold text-slate-900">{records.filter(r => r.arrivalTime).length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <ArrowLeft className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-slate-600 text-sm font-medium">Total Departures</p>
                                    <p className="text-2xl font-bold text-slate-900">{records.filter(r => r.departureTime).length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-amber-100 p-2 rounded-lg">
                                    <Truck className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-slate-600 text-sm font-medium">Active Drivers</p>
                                    <p className="text-2xl font-bold text-slate-900">{drivers.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                    <Building2 className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-slate-600 text-sm font-medium">Companies</p>
                                    <p className="text-2xl font-bold text-slate-900">{companies.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Records Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h2 className="text-lg font-semibold text-slate-900">Recent Records</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Driver</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Truck Type</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Arrival</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Departure</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Destination</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {records.length > 0 ? (
                                        records.map((rec) => (
                                            <tr key={rec._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-slate-100 p-2 rounded-full">
                                                            <User className="w-4 h-4 text-slate-600" />
                                                        </div>
                                                        <span className="font-medium text-slate-900">{rec.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">{rec.company || '—'}</td>
                                                <td className="px-6 py-4 text-slate-600">{rec.truckType || '—'}</td>
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
                                                <td className="px-6 py-4 text-slate-600">{rec.productType || '—'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center">
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
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                        <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md">
                            {/* Modal Header */}
                            <div className={`px-6 py-4 border-b border-slate-200 ${mode === 'arrival' ? 'bg-emerald-50' : 'bg-blue-50'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${mode === 'arrival' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                                            {mode === 'arrival' ?
                                                <ArrowRight className={`w-5 h-5 ${mode === 'arrival' ? 'text-emerald-600' : 'text-blue-600'}`} /> :
                                                <ArrowLeft className={`w-5 h-5 ${mode === 'arrival' ? 'text-emerald-600' : 'text-blue-600'}`} />
                                            }
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">
                                                {mode === 'arrival' ? 'Record Arrival' : 'Record Departure'}
                                            </h3>
                                            <p className="text-sm text-slate-600">
                                                {mode === 'arrival' ? 'Log driver arrival time' : 'Log driver departure details'}
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
                            <div className="p-6 space-y-4">
                                {/* Search Driver */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Search Driver</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input
                                            value={searchTerm}
                                            onChange={handleSearch}
                                            placeholder="Type driver name..."
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                                        <div className="text-sm text-slate-500">{d.company}</div>
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Company</label>
                                        <select
                                            name="company"
                                            value={formData.company}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select Truck</option>
                                            {trucks.map(t => (
                                                <option key={t._id} value={t.type}>{t.type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Timestamp */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Timestamp</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="timestamp"
                                            value={formData.timestamp}
                                            readOnly
                                            placeholder="Click to set current time"
                                            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
                                        />
                                        <button
                                            onClick={() =>
                                                setFormData(prev => ({ ...prev, timestamp: getFormattedTimestamp() }))
                                            }
                                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
                                        >
                                            <Calendar className="w-4 h-4 text-slate-600" />
                                        </button>
                                    </div>
                                </div>

                                {/* Departure-Only Fields */}
                                {mode === 'departure' && (
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Destination</label>
                                            <input
                                                name="destination"
                                                value={formData.destination}
                                                onChange={handleInputChange}
                                                placeholder="Enter destination"
                                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Product</label>
                                            <select
                                                name="product"
                                                value={formData.product}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Select Product</option>
                                                {products.map(p => (
                                                    <option key={p._id} value={p._id}>{p.name}</option> // ⬅️ use ID as value
                                                ))}
                                            </select>
                                        </div>
                                    </div>
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
                                        className={`px-6 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${mode === 'arrival'
                                            ? 'bg-emerald-600 hover:bg-emerald-700'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                    >
                                        Save Record
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </>
    );
} 
