import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import axios from '../utils/axios';

import {
  Truck,
  Building,
  Clock,
  Download,
  FileSpreadsheet,
  Calendar,
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
  const [driversData, setDriversData] = useState({});
  const [haulersData, setHaulersData] = useState({});
  const [arrivalDepartureTrend, setArrivalDepartureTrend] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchDataAndProcess();
  }, []);

  const fetchDataAndProcess = async () => {
    try {
      const res = await axios.get('/api/drivers');
      const drivers = res.data;
      processDriverPerCompany(drivers);
      processHaulerContributionPerCompany(drivers);
      processArrivalDepartureTrend(drivers);
    } catch (err) {
      console.error('Failed to fetch drivers:', err.message);
    }
  };

  const processDriverPerCompany = (drivers) => {
    const grouped = {};
    drivers.forEach(d => {
      const companyName = d.companyId?.name || d.company || 'Unknown';
      const driverName = d.name || d.driverDataId || 'Unknown Driver';
      if (!grouped[companyName]) grouped[companyName] = {};
      if (!grouped[companyName][driverName]) grouped[companyName][driverName] = 0;
      grouped[companyName][driverName]++;
    });
    setDriversData(grouped);
  };

  const processHaulerContributionPerCompany = (drivers) => {
    const grouped = {};
    drivers.forEach(d => {
      const companyName = d.companyId?.name || d.company || 'Unknown';
      const haulerName = d.haulerId?.name || d.haulerId || 'Unknown Hauler';
      if (!grouped[companyName]) grouped[companyName] = {};
      if (!grouped[companyName][haulerName]) grouped[companyName][haulerName] = 0;
      grouped[companyName][haulerName]++;
    });
    setHaulersData(grouped);
  };

  const processArrivalDepartureTrend = (drivers) => {
    const trend = {};
    drivers.forEach(d => {
      if (d.arrivalTime) {
        const date = new Date(d.arrivalTime).toISOString().split('T')[0];
        if (!trend[date]) trend[date] = { arrivals: 0, departures: 0 };
        trend[date].arrivals++;
      }
      if (d.departureTime) {
        const date = new Date(d.departureTime).toISOString().split('T')[0];
        if (!trend[date]) trend[date] = { arrivals: 0, departures: 0 };
        trend[date].departures++;
      }
    });

    const sorted = Object.keys(trend).sort((a, b) => new Date(a) - new Date(b));
    const formatted = sorted.map(date => ({
      date,
      arrivals: trend[date].arrivals,
      departures: trend[date].departures
    }));
    setArrivalDepartureTrend(formatted);
  };

  const handleFilter = () => {
    if (!startDate && !endDate) return fetchDataAndProcess();
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      axios.get('/api/drivers').then(res => {
        const drivers = res.data.filter(d => {
          const arrival = d.arrivalTime ? new Date(d.arrivalTime) : null;
          const departure = d.departureTime ? new Date(d.departureTime) : null;
          return (arrival && arrival >= start && arrival <= end) ||
            (departure && departure >= start && departure <= end);
        });

        processDriverPerCompany(drivers);
        processHaulerContributionPerCompany(drivers);
        processArrivalDepartureTrend(drivers);
      });
    } catch (err) {
      console.error('Filter error:', err);
    }
  };

  const exportToExcel = () => {
    const ws1 = XLSX.utils.json_to_sheet(arrivalDepartureTrend);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Arrival_Departure');

    const drivers = [];
    Object.entries(driversData).forEach(([company, drivers]) =>
      Object.entries(drivers).forEach(([name, count]) =>
        drivers.push({ Company: company, Driver: name, Trips: count })));

    const haulers = [];
    Object.entries(haulersData).forEach(([company, haulers]) =>
      Object.entries(haulers).forEach(([name, count]) =>
        haulers.push({ Company: company, Hauler: name, Trips: count })));

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(drivers), 'Drivers');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(haulers), 'Haulers');
    XLSX.writeFile(wb, 'Company_Performance_Report.xlsx');
  };

  const downloadChart = (id, name) => {
    const chart = document.getElementById(id);
    html2canvas(chart).then(canvas => {
      const link = document.createElement('a');
      link.download = `${name}.png`;
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const getBarOptions = () => ({
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  });

  const getLineOptions = () => ({
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } }
  });

  const getDriverChartData = (company) => {
    const labels = Object.keys(driversData[company] || {});
    return {
      labels,
      datasets: [{
        label: 'Trips',
        backgroundColor: '#4f46e5',
        borderColor: '#4338ca',
        borderWidth: 1,
        data: labels.map(l => driversData[company][l])
      }]
    };
  };

  const getHaulerChartData = (company) => {
    const labels = Object.keys(haulersData[company] || {});
    return {
      labels,
      datasets: [{
        label: 'Trips',
        backgroundColor: '#0ea5e9',
        borderColor: '#0284c7',
        borderWidth: 1,
        data: labels.map(l => haulersData[company][l])
      }]
    };
  };

  const trendChartData = {
    labels: arrivalDepartureTrend.map(t => t.date),
    datasets: [
      {
        label: 'Arrivals',
        data: arrivalDepartureTrend.map(t => t.arrivals),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        fill: true
      },
      {
        label: 'Departures',
        data: arrivalDepartureTrend.map(t => t.departures),
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        fill: true
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-indigo-700">
            <Building size={28} /> Company Performance Dashboard
          </h1>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gray-500" />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 border rounded-md shadow-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gray-500" />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 border rounded-md shadow-sm" />
            </div>
            <button onClick={handleFilter} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow">
              Apply Filter
            </button>
            <button onClick={exportToExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow">
              <FileSpreadsheet size={18} /> Export Excel
            </button>
          </div>
        </div>

        {/* Arrival/Departure Trend */}
        <section id="trend-chart" className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
            <Clock size={18} /> Arrival vs Departure Trend
          </h3>
          <div className="h-80">
            <Bar data={trendChartData} options={getLineOptions()} />
          </div>
          <button onClick={() => downloadChart('trend-chart', 'Arrival_vs_Departure')} className="mt-3 text-sm text-indigo-600 flex items-center gap-1 hover:underline">
            <Download size={14} /> Download PNG
          </button>
        </section>

        {/* Drivers per Company */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(driversData).map(company => (
            <div key={company} id={`driver-${company}`} className="bg-white rounded-lg shadow p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-2 text-indigo-700">
                <Truck size={18} /> {company}
              </h3>
              <div className="h-64">
                <Bar data={getDriverChartData(company)} options={getBarOptions()} />
              </div>
              <button onClick={() => downloadChart(`driver-${company}`, `Drivers_${company}`)} className="mt-3 text-sm text-indigo-600 flex items-center gap-1 hover:underline">
                <Download size={14} /> Download
              </button>
            </div>
          ))}
        </section>

        {/* Haulers per Company */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(haulersData).map(company => (
            <div key={company} id={`hauler-${company}`} className="bg-white rounded-lg shadow p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-2 text-sky-700">
                <Building size={18} /> {company}
              </h3>
              <div className="h-64">
                <Bar data={getHaulerChartData(company)} options={getBarOptions()} />
              </div>
              <button onClick={() => downloadChart(`hauler-${company}`, `Haulers_${company}`)} className="mt-3 text-sm text-sky-600 flex items-center gap-1 hover:underline">
                <Download size={14} /> Download
              </button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
