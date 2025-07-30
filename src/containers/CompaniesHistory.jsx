import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import axios from '../utils/axios';
import {
  Building,
  Clock,
  Download,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  Users,
  Activity,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function CompaniesHistory() {
  const [haulersData, setHaulersData] = useState({});
  const [arrivalDepartureTrend, setArrivalDepartureTrend] = useState([]);
  const [haulerStats, setHaulerStats] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDataAndProcess();
  }, []);

  const fetchDataAndProcess = async (filteredDrivers = null) => {
    setIsLoading(true);
    try {
      const res = filteredDrivers
        ? { data: filteredDrivers }
        : await axios.get('/api/drivers');

      const drivers = res.data;

      processHaulerContributionPerCompany(drivers);
      processArrivalDepartureTrend(drivers);
      processHaulerStats(drivers);
    } catch (err) {
      console.error('Failed to fetch drivers:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const processHaulerContributionPerCompany = (drivers) => {
    const grouped = {};
    drivers.forEach((d) => {
      const companyName = d.companyId?.name || d.company || 'Unknown';
      const haulerName = d.haulerId?.name || 'Unknown Hauler';

      if (!grouped[companyName]) grouped[companyName] = {};
      if (!grouped[companyName][haulerName]) grouped[companyName][haulerName] = 0;
      grouped[companyName][haulerName]++;
    });
    setHaulersData(grouped);
  };

  const processArrivalDepartureTrend = (drivers) => {
    const trend = {};
    drivers.forEach((d) => {
      const createdAt = new Date(d.createdAt);
      const date = createdAt.toISOString().split('T')[0];

      if (!trend[date]) trend[date] = { arrivals: 0, departures: 0 };

      if (d.arrivalTime) trend[date].arrivals++;
      if (d.departureTime) trend[date].departures++;
    });

    const sorted = Object.keys(trend).sort((a, b) => new Date(a) - new Date(b));
    const formatted = sorted.map((date) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      arrivals: trend[date].arrivals,
      departures: trend[date].departures,
    }));
    setArrivalDepartureTrend(formatted);
  };

  const processHaulerStats = (drivers) => {
    const haulerCounts = {};
    drivers.forEach((d) => {
      const haulerName = d.haulerId?.name || 'Unknown Hauler';
      const companyName = d.companyId?.name || 'Unknown Company';

      if (!haulerCounts[haulerName]) {
        haulerCounts[haulerName] = {
          name: haulerName,
          trips: 0,
          company: companyName,
        };
      }
      haulerCounts[haulerName].trips++;
    });

    const sortedHaulers = Object.values(haulerCounts)
      .sort((a, b) => b.trips - a.trips)
      .slice(0, 10); // Top 10 haulers

    setHaulerStats(sortedHaulers);
  };

  const handleFilter = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/drivers');
      let drivers = res.data;

      // Filter by date and time range
      if (startDate || endDate || startTime !== '00:00' || endTime !== '23:59') {
        drivers = drivers.filter((d) => {
          const createdAt = new Date(d.createdAt);
          const updatedAt = new Date(d.updatedAt);

          // Create date-time combinations for filtering
          let startDateTime = null;
          let endDateTime = null;

          if (startDate) {
            startDateTime = new Date(`${startDate}T${startTime}:00.000Z`);
          }

          if (endDate) {
            endDateTime = new Date(`${endDate}T${endTime}:59.999Z`);
          }

          let matches = true;

          // Check if createdAt or updatedAt falls within the range
          if (startDateTime) {
            matches = matches && (createdAt >= startDateTime || updatedAt >= startDateTime);
          }

          if (endDateTime) {
            matches = matches && (createdAt <= endDateTime || updatedAt <= endDateTime);
          }

          return matches;
        });
      }

      fetchDataAndProcess(drivers);
    } catch (err) {
      console.error('Filter error:', err);
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setStartTime('00:00');
    setEndTime('23:59');
    fetchDataAndProcess();
  };

  const exportToExcel = () => {
    const ws1 = XLSX.utils.json_to_sheet(arrivalDepartureTrend);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Arrival_Departure_Trend');

    const haulers = [];
    Object.entries(haulersData).forEach(([company, haulerObj]) =>
      Object.entries(haulerObj).forEach(([hauler, count]) =>
        haulers.push({ Company: company, Hauler: hauler, Trips: count })
      )
    );

    const ws2 = XLSX.utils.json_to_sheet(haulers);
    XLSX.utils.book_append_sheet(wb, ws2, 'Hauler_Performance');

    const ws3 = XLSX.utils.json_to_sheet(haulerStats);
    XLSX.utils.book_append_sheet(wb, ws3, 'Top_Haulers');

    XLSX.writeFile(wb, `Hauler_Performance_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const downloadChart = (id, name) => {
    const chart = document.getElementById(id);
    html2canvas(chart, {
      backgroundColor: '#ffffff',
      scale: 2,
    }).then((canvas) => {
      const link = document.createElement('a');
      link.download = `${name}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  const getModernBarOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#4f46e5',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11, weight: '500' },
          color: '#6b7280'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
          lineWidth: 1,
        },
        ticks: {
          stepSize: 1,
          font: { size: 11, weight: '500' },
          color: '#6b7280'
        }
      },
    },
  });

  const getModernLineOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#10b981',
        borderWidth: 1,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11, weight: '500' },
          color: '#6b7280'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
          lineWidth: 1,
        },
        ticks: {
          font: { size: 11, weight: '500' },
          color: '#6b7280'
        }
      }
    },
  });

  const getHaulerChartData = (company) => {
    const labels = Object.keys(haulersData[company] || {});
    const colors = [
      '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
      '#ef4444', '#ec4899', '#84cc16', '#f97316', '#3b82f6'
    ];

    return {
      labels,
      datasets: [
        {
          label: 'Trips',
          backgroundColor: labels.map((_, index) => colors[index % colors.length]),
          borderColor: labels.map((_, index) => colors[index % colors.length]),
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
          data: labels.map((l) => haulersData[company][l]),
        },
      ],
    };
  };

  const trendChartData = {
    labels: arrivalDepartureTrend.map((t) => t.date),
    datasets: [
      {
        label: 'Arrivals',
        data: arrivalDepartureTrend.map((t) => t.arrivals),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10b981',
        borderWidth: 3,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Departures',
        data: arrivalDepartureTrend.map((t) => t.departures),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: '#f59e0b',
        borderWidth: 3,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const topHaulersChartData = {
    labels: haulerStats.map(h => h.name),
    datasets: [
      {
        label: 'Total Trips',
        data: haulerStats.map(h => h.trips),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: '#6366f1',
        borderWidth: 3,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">

            {/* Title and Icon */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Hauler Performance Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Track and analyze hauler activities
                </p>
              </div>
            </div>

            {/* Export Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                <FileSpreadsheet size={18} />
                Export
              </button>
            </div>

          </div>
        </div>


        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar size={16} /> Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar size={16} /> End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock size={16} /> Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock size={16} /> End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleFilter}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
              >
                {isLoading ? 'Filtering...' : 'Apply Filter'}
              </button>


              <button
                onClick={clearFilters}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Haulers</p>
                <p className="text-2xl font-bold">{haulerStats.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Total Companies</p>
                <p className="text-2xl font-bold">{Object.keys(haulersData).length}</p>
              </div>
              <Building className="h-8 w-8 text-emerald-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Trips</p>
                <p className="text-2xl font-bold">{haulerStats.reduce((sum, h) => sum + h.trips, 0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Avg per Hauler</p>
                <p className="text-2xl font-bold">
                  {haulerStats.length > 0 ? Math.round(haulerStats.reduce((sum, h) => sum + h.trips, 0) / haulerStats.length) : 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Arrival/Departure Trend */}
          <div id="trend-chart" className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                <TrendingUp size={20} /> Arrival vs Departure Trend
              </h3>
              <button
                onClick={() => downloadChart('trend-chart', 'Arrival_vs_Departure_Trend')}
                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm transition-colors"
              >
                <Download size={16} /> Download
              </button>
            </div>
            <div className="h-80">
              <Bar data={trendChartData} options={getModernLineOptions()} />
            </div>
          </div>

          {/* Top Haulers */}
          <div id="top-haulers-chart" className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                <Users size={20} /> Top Performing Haulers
              </h3>
              <button
                onClick={() => downloadChart('top-haulers-chart', 'Top_Haulers')}
                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm transition-colors"
              >
                <Download size={16} /> Download
              </button>
            </div>
            <div className="h-80">
              <Bar data={topHaulersChartData} options={getModernBarOptions()} />
            </div>
          </div>
        </div>

        {/* Haulers per Company */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Building size={24} /> Haulers by Company
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.keys(haulersData).length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>No hauler data available</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              Object.keys(haulersData).map((company) => (
                <div key={company} id={`hauler-${company.replace(/\s+/g, '-')}`}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2 text-gray-800">
                      <Building size={18} /> {company}
                    </h3>
                    <button
                      onClick={() => downloadChart(`hauler-${company.replace(/\s+/g, '-')}`, `Haulers_${company}`)}
                      className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm transition-colors"
                    >
                      <Download size={14} /> PNG
                    </button>
                  </div>
                  <div className="h-64">
                    <Bar data={getHaulerChartData(company)} options={getModernBarOptions()} />
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      Total Haulers: <span className="font-semibold">{Object.keys(haulersData[company]).length}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Total Trips: <span className="font-semibold">{Object.values(haulersData[company]).reduce((sum, count) => sum + count, 0)}</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 flex items-center gap-4 shadow-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-gray-700 font-medium">Processing data...</p>
          </div>
        </div>
      )}
    </div>
  );
}