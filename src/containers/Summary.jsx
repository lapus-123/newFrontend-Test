import { useState } from 'react';
import {
    Search,
    LineChart, // <-- Import the LineChart icon
} from 'lucide-react';
import ModernLineChart from '../components/ModernLineChart';

// Mock data for demonstration
const MOCK_DATES = [
    '2024-06-01',
    '2024-06-02',
    '2024-06-03',
];

const MOCK_DATA = [
    {
        id: 1,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 2,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 3,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 4,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 5,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 6,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 7,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 8,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 9,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 10,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 11,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 12,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 13,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 14,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 15,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 16,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 17,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 18,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 19,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 20,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 21,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 22,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 23,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 24,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 25,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 26,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 27,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 28,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 29,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 30,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 31,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 32,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 33,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 34,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 35,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 36,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 37,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 38,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 39,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 40,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 41,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 42,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 43,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 44,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 45,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 46,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 47,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 48,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
    {
        id: 49,
        name: 'John Doe',
        plateNumber: 'ABC123',
        companyName: 'Acme Corp',
        product: 'Sand',
        destination: 'Site A',
        arrivalTime: '2024-06-01T08:00:00',
        departureTime: '2024-06-01T10:00:00',
        dnNumber: 'DN001',
        date: '2024-06-01',
    },
    {
        id: 50,
        name: 'Jane Smith',
        plateNumber: 'XYZ789',
        companyName: 'Beta Ltd',
        product: 'Gravel',
        destination: 'Site B',
        arrivalTime: '2024-06-02T09:30:00',
        departureTime: null,
        dnNumber: 'DN002',
        date: '2024-06-02',
    },
];

const MOCK_CHART_DATA = Array.from({ length: 25 }, (_, i) => {
    const base = [
        { label: '2024-06-01', trucks: 5, companies: 2, arrivals: 5, departures: 3, months: 1 },
        { label: '2024-06-02', trucks: 8, companies: 3, arrivals: 8, departures: 7, months: 1 },
        { label: '2024-06-03', trucks: 4, companies: 1, arrivals: 4, departures: 2, months: 1 },
    ];
    const b = base[i % base.length];
    return {
        ...b,
        label: `${b.label} (${Math.floor(i / base.length) + 1})`
    };
});

export default function Summary() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(MOCK_DATES[0]);
    const [selectedMetric, setSelectedMetric] = useState('trucks');

    // Filter data based on search and date
    const filteredData = MOCK_DATA.filter(
        (row) =>
            (row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())) &&
            row.date === selectedDate
    );

    // Chart data can be filtered or transformed as needed
    const chartData = MOCK_CHART_DATA;

    const handleDateChange = (e) => setSelectedDate(e.target.value);
    const handleMetricChange = (e) => setSelectedMetric(e.target.value);

    const dates = MOCK_DATES;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Attendance Master List
                </h1>
                <p className="text-gray-600 mt-1">View daily attendance records</p>
            </div>

            {/* Controls */}
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                <div className="relative w-full sm:w-1/3">
                    <input
                        type="text"
                        placeholder="Search by name or plate..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 pl-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <div className="w-full sm:w-auto">
                    <select
                        value={selectedDate}
                        onChange={handleDateChange}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                        {dates.map((date, index) => (
                            <option key={index} value={date} className="text-black">
                                {date}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table FIRST */}
            <div className="max-w-6xl mx-auto overflow-x-auto bg-white rounded-xl shadow-md mb-8">
                <table className="min-w-full table-auto text-left">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-black">Driver</th>
                            <th className="px-6 py-3 text-black">Plate</th>
                            <th className="px-6 py-3 text-black">Company</th>
                            <th className="px-6 py-3 text-black">Product</th>
                            <th className="px-6 py-3 text-black">Dest</th>
                            <th className="px-6 py-3 text-black">Arr</th>
                            <th className="px-6 py-3 text-black">Dep</th>
                            <th className="px-6 py-3 text-black">DN#</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredData.length > 0 ? (
                            filteredData.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-black">{row.name}</td>
                                    <td className="px-6 py-4 text-black">{row.plateNumber}</td>
                                    <td className="px-6 py-4 text-black">{row.companyName}</td>
                                    <td className="px-6 py-4 text-black">{row.product}</td>
                                    <td className="px-6 py-4 text-black">{row.destination}</td>
                                    <td className="px-6 py-4 text-black">
                                        {new Date(row.arrivalTime).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-black">
                                        {row.departureTime
                                            ? new Date(row.departureTime).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })
                                            : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-black">{row.dnNumber}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                    No records found for the selected date.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Metric Selector */}
            <div className="max-w-6xl mx-auto mb-2 flex justify-end">
                <select
                    value={selectedMetric}
                    onChange={handleMetricChange}
                    className="px-3 py-1 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                >
                    <option value="trucks">Trucks</option>
                    <option value="companies">Companies</option>
                    <option value="arrivals">Arrivals</option>
                    <option value="departures">Departures</option>
                    <option value="months">Months</option>
                </select>
            </div>

            {/* Chart (after table) */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <LineChart className="h-6 w-6 text-blue-600" />
                    <span className="font-semibold text-gray-700">
                        {`Trend: ${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}`}
                    </span>
                </div>
                <ModernLineChart
                    data={chartData}
                    label={`Trend: ${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}`}
                    selectedMetric={selectedMetric}
                />
            </div>
        </div>
    );
}
