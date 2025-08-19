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
    <div className="bg-slate-50">
      <div className="mx-auto space-y-2 sm:space-y-3">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 sm:p-2 md:p-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-1 md:gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1 sm:p-1.5 bg-emerald-500 rounded-lg">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900">Hauler Performance Dashboard</h1>
                <p className="text-slate-600 mt-0 text-[10px] sm:text-xs md:text-sm">Track and analyze hauler activities</p>
              </div>
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 sm:p-2 md:p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="flex flex-col gap-1">
              <label className="block text-[10px] sm:text-xs font-medium text-slate-700">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> Start Date
                </div>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-1 py-0.5 sm:px-1 sm:py-1 md:px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[10px] sm:text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-[10px] sm:text-xs font-medium text-slate-700">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> End Date
                </div>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-1 py-0.5 sm:px-1 sm:py-1 md:px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[10px] sm:text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-[10px] sm:text-xs font-medium text-slate-700">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> Start Time
                </div>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-1 py-0.5 sm:px-1 sm:py-1 md:px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[10px] sm:text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-[10px] sm:text-xs font-medium text-slate-700">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> End Time
                </div>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-1 py-0.5 sm:px-1 sm:py-1 md:px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[10px] sm:text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-200">
            <button
              onClick={clearFilters}
              className="px-1 py-0.5 sm:px-2 sm:py-1 text-slate-600 hover:text-slate-900 text-[10px] sm:text-xs"
            >
              Clear
            </button>
            <button
              onClick={handleFilter}
              disabled={isLoading}
              className="flex items-center gap-0.5 sm:gap-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white px-1 py-0.5 sm:px-2 sm:py-1 rounded-md font-medium transition-colors shadow-sm text-[10px] sm:text-xs"
            >
              {isLoading ? 'Filtering...' : 'Apply Filter'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-500">Total Haulers</p>
                <p className="text-base sm:text-lg font-bold text-slate-900">{haulerStats.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-500">Total Companies</p>
                <p className="text-base sm:text-lg font-bold text-slate-900">{Object.keys(haulersData).length}</p>
              </div>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Building className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-500">Total Trips</p>
                <p className="text-base sm:text-lg font-bold text-slate-900">{haulerStats.reduce((sum, h) => sum + h.trips, 0)}</p>
              </div>
              <div className="p-2 bg-indigo-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-500">Avg per Hauler</p>
                <p className="text-base sm:text-lg font-bold text-slate-900">
                  {haulerStats.length > 0 ? Math.round(haulerStats.reduce((sum, h) => sum + h.trips, 0) / haulerStats.length) : 0}
                </p>
              </div>
              <div className="p-2 bg-amber-100 rounded-lg">
                <Activity className="w-4 h-4 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* Arrival/Departure Trend */}
          <div id="trend-chart" className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-900 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Arrival vs Departure Trend
              </h3>
              <button
                onClick={() => downloadChart('trend-chart', 'Arrival_vs_Departure_Trend')}
                className="flex items-center gap-0.5 text-[10px] sm:text-xs text-slate-600 hover:text-slate-900"
              >
                <Download className="w-3 h-3" /> Download
              </button>
            </div>
            <div className="h-64 sm:h-80">
              <Bar data={trendChartData} options={getModernLineOptions()} />
            </div>
          </div>

          {/* Top Haulers */}
          <div id="top-haulers-chart" className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-900 flex items-center gap-1">
                <Users className="w-3 h-3" /> Top Performing Haulers
              </h3>
              <button
                onClick={() => downloadChart('top-haulers-chart', 'Top_Haulers')}
                className="flex items-center gap-0.5 text-[10px] sm:text-xs text-slate-600 hover:text-slate-900"
              >
                <Download className="w-3 h-3" /> Download
              </button>
            </div>
            <div className="h-64 sm:h-80">
              <Bar data={topHaulersChartData} options={getModernBarOptions()} />
            </div>
          </div>
        </div>

        {/* Haulers per Company */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 sm:p-2 md:p-3">
            <div className="flex items-center gap-1">
              <Building className="w-3 h-3" />
              <h2 className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-900">Haulers by Company</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 mt-2">
            {Object.keys(haulersData).length === 0 ? (
              <div className="col-span-full bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Users className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-600 text-[10px] sm:text-xs">No hauler data available</p>
                  <p className="text-slate-400 text-[10px] sm:text-xs">Try adjusting your filters</p>
                </div>
              </div>
            ) : (
              Object.keys(haulersData).map((company) => (
                <div key={company} id={`hauler-${company.replace(/\s+/g, '-')}`}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-900 flex items-center gap-1">
                      <Building className="w-3 h-3" /> {company}
                    </h3>
                    <button
                      onClick={() => downloadChart(`hauler-${company.replace(/\s+/g, '-')}`, `Haulers_${company}`)}
                      className="flex items-center gap-0.5 text-[10px] sm:text-xs text-slate-600 hover:text-slate-900"
                    >
                      <Download className="w-3 h-3" /> PNG
                    </button>
                  </div>
                  <div className="h-48 sm:h-64">
                    <Bar data={getHaulerChartData(company)} options={getModernBarOptions()} />
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <p className="text-[10px] sm:text-xs text-slate-600">
                      Total Haulers: <span className="font-medium">{Object.keys(haulersData[company]).length}</span>
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-600">
                      Total Trips: <span className="font-medium">{Object.values(haulersData[company]).reduce((sum, count) => sum + count, 0)}</span>
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