import React, { useState, useEffect } from 'react';
import { Users, Truck, Building2, Package, TrendingUp, Clock, MapPin, Calendar, ArrowUp, ArrowDown, BarChart3, PieChart, Activity, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Pie, PieChart as RechartsPieChart, Cell } from 'recharts';
import axios from '../utils/axios';

export default function Summary() {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('all');

    const [summary, setSummary] = useState({
        totalDrivers: 0,
        totalArrivals: 0,
        totalDepartures: 0,
        activeCompanies: 0,
        todayArrivals: 0,
        todayDepartures: 0,
    });

    useEffect(() => {
        fetchDrivers();
    }, []);

    useEffect(() => {
        if (drivers.length > 0) {
            calculateSummary();
        }
    }, [drivers, timeFilter]);

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/drivers');

            // ✅ Correctly flatten and enrich driver data
            const flattened = res.data.map((d) => ({
                ...d,
                company: d.companyId?.name || '—',
                truckType: d.truckTypeId?.type || '—',
                hauler: d.haulerId?.name || '—',
                // ✅ Handle multiple products
                productNames: d.products?.length > 0
                    ? d.products.map(p => p.productId?.name).filter(Boolean)
                    : [],
            }));

            setDrivers(flattened);
        } catch (err) {
            console.error('Failed to fetch drivers:', err);
            setDrivers([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateSummary = () => {
        const today = new Date().toDateString();
        const companies = new Set();
        let totalArrivals = 0;
        let totalDepartures = 0;
        let todayArrivals = 0;
        let todayDepartures = 0;

        drivers.forEach((driver) => {
            if (driver.company && driver.company !== '—') companies.add(driver.company);
            if (driver.arrivalTime) {
                totalArrivals++;
                const arrivalDate = new Date(driver.arrivalTime);
                if (!isNaN(arrivalDate) && arrivalDate.toDateString() === today) {
                    todayArrivals++;
                }
            }
            if (driver.departureTime) {
                totalDepartures++;
                const departureDate = new Date(driver.departureTime);
                if (!isNaN(departureDate) && departureDate.toDateString() === today) {
                    todayDepartures++;
                }
            }
        });

        setSummary({
            totalDrivers: drivers.length,
            totalArrivals,
            totalDepartures,
            activeCompanies: companies.size,
            todayArrivals,
            todayDepartures,
        });
    };

    const getFilteredDrivers = () => {
        if (timeFilter === 'all') return drivers;

        const now = new Date();
        const filterDate = new Date();

        switch (timeFilter) {
            case 'today':
                filterDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                filterDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                filterDate.setMonth(now.getMonth() - 1);
                break;
            default:
                return drivers;
        }

        return drivers.filter((driver) => {
            const arrivalDate = driver.arrivalTime ? new Date(driver.arrivalTime) : null;
            const departureDate = driver.departureTime ? new Date(driver.departureTime) : null;

            const validArrival = arrivalDate && !isNaN(arrivalDate.getTime()) && arrivalDate >= filterDate;
            const validDeparture = departureDate && !isNaN(departureDate.getTime()) && departureDate >= filterDate;

            return validArrival || validDeparture;
        });
    };

    const getHourlyData = () => {
        const hourlyStats = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            arrivals: 0,
            departures: 0,
        }));

        const filteredDrivers = getFilteredDrivers();
        filteredDrivers.forEach((driver) => {
            if (driver.arrivalTime) {
                const arrivalDate = new Date(driver.arrivalTime);
                if (!isNaN(arrivalDate)) {
                    const hour = arrivalDate.getHours();
                    hourlyStats[hour].arrivals++;
                }
            }
            if (driver.departureTime) {
                const departureDate = new Date(driver.departureTime);
                if (!isNaN(departureDate)) {
                    const hour = departureDate.getHours();
                    hourlyStats[hour].departures++;
                }
            }
        });

        return hourlyStats.map((stat) => ({
            ...stat,
            time: `${stat.hour.toString().padStart(2, '0')}:00`,
        }));
    };

    const getTruckTypeData = () => {
        const truckStats = {};
        const filteredDrivers = getFilteredDrivers();
        filteredDrivers.forEach((driver) => {
            if (driver.truckType && driver.truckType !== '—') {
                truckStats[driver.truckType] = (truckStats[driver.truckType] || 0) + 1;
            }
        });
        return Object.entries(truckStats).map(([type, count]) => ({ name: type, value: count }));
    };

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];



    const renderProductTags = (productNames) => {
        if (!productNames || productNames.length === 0) {
            return <span className="text-slate-400">—</span>;
        }
        return (
            <div className="flex flex-wrap gap-1">
                {productNames.map((name, idx) => (
                    <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700"
                    >
                        <Package className="w-3 h-3" />
                        {name}
                    </span>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500 text-lg">Loading drivers...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Dashboard Summary</h1>
                        <p className="text-slate-600 mt-1">Comprehensive overview of driver activities</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Filter className="w-4 h-4 text-slate-500" />
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-slate-600 text-sm font-medium">Total Drivers</p>
                                <p className="text-2xl font-bold text-slate-900">{summary.totalDrivers}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-100 p-2 rounded-lg">
                                <Clock className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-slate-600 text-sm font-medium">Total Arrivals</p>
                                <p className="text-2xl font-bold text-slate-900">{summary.totalArrivals}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-slate-600 text-sm font-medium">Total Departures</p>
                                <p className="text-2xl font-bold text-slate-900">{summary.totalDepartures}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <Building2 className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-slate-600 text-sm font-medium">Active Companies</p>
                                <p className="text-2xl font-bold text-slate-900">{summary.activeCompanies}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="bg-teal-100 p-2 rounded-lg">
                                <ArrowUp className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-slate-600 text-sm font-medium">Today's Arrivals</p>
                                <p className="text-2xl font-bold text-slate-900">{summary.todayArrivals}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="bg-cyan-100 p-2 rounded-lg">
                                <ArrowDown className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                                <p className="text-slate-600 text-sm font-medium">Today's Departures</p>
                                <p className="text-2xl font-bold text-slate-900">{summary.todayDepartures}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Hourly Trends */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Hourly Activity</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={getHourlyData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Line type="monotone" dataKey="arrivals" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} name="Arrivals" />
                                <Line type="monotone" dataKey="departures" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} name="Departures" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Truck Types */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Truck Type Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPieChart cx="50%" cy="50%" outerRadius={100}>
                                <Pie
                                    data={getTruckTypeData()}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {getTruckTypeData().map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Drivers Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-900">Driver Records</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Driver</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Truck Type</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Plate Number</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Arrival</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Departure</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Destination</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Products</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {getFilteredDrivers().map((driver) => (
                                    <tr key={driver._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-slate-100 p-2 rounded-full">
                                                    <Users className="w-4 h-4 text-slate-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{driver.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{driver.company}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                <Truck className="w-3 h-3" />
                                                {driver.truckType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-mono text-sm">{driver.plateNumber}</td>
                                        <td className="px-6 py-4">
                                            {driver.arrivalTime ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(driver.arrivalTime).toLocaleString()}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {driver.departureTime ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(driver.departureTime).toLocaleString()}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {driver.destination ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                    <MapPin className="w-3 h-3" />
                                                    {driver.destination}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {renderProductTags(driver.productNames)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}