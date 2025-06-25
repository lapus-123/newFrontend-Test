import { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const METRICS = [
    { value: 'trucks', label: 'Trucks', color: '#3B82F6' },
    { value: 'companies', label: 'Companies', color: '#A855F7' },
    { value: 'arrivals', label: 'Arrivals', color: '#10B981' },
    { value: 'departures', label: 'Departures', color: '#F59E0B' },
    { value: 'products', label: 'Products', color: '#EC4899' }
];

function ModernLineChart({ data, label, selectedMetric: initialMetric }) {
    const [selectedMetric, setSelectedMetric] = useState(initialMetric || 'trucks');

    // Prepare chart data for all metrics
    const chartData = Object.entries(data).map(([key, value]) => ({
        name: key,
        ...value
    }));

    const currentMetric = METRICS.find(m => m.value === selectedMetric);

    return (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className={`p-1 rounded-full`} style={{ background: `${currentMetric.color}22` }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={currentMetric.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 3v18h18"></path>
                            <path d="M18 17L12.5 11 9.5 14 6 10"></path>
                        </svg>
                    </span>
                    {label}
                </h3>
                <select
                    value={selectedMetric}
                    onChange={e => setSelectedMetric(e.target.value)}
                    className="px-3 py-1 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90"
                >
                    {METRICS.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                    >
                        <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" />
                        <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 13, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(255,255,255,0.95)',
                                borderRadius: '1rem',
                                border: '1px solid #E5E7EB',
                                fontSize: '13px',
                                boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07)'
                            }}
                            labelStyle={{ color: '#374151', fontWeight: 600 }}
                            itemStyle={{ color: currentMetric.color }}
                        />
                        <Line
                            type="monotone"
                            dataKey={selectedMetric}
                            name={currentMetric.label}
                            stroke={currentMetric.color}
                            strokeWidth={3}
                            dot={{ r: 5, fill: currentMetric.color, stroke: '#fff', strokeWidth: 2 }}
                            activeDot={{ r: 7, fill: currentMetric.color, stroke: '#fff', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default ModernLineChart;