import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import axios from '../utils/axios';

// Import Chart.js register helpers
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function CompaniesHistory() {
  const [companyData, setCompanyData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Load driver data grouped by company
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get('/api/drivers');
        const drivers = res.data;

        const grouped = {};
        drivers.forEach(d => {
          const key = d.company;
          if (!grouped[key]) grouped[key] = 0;
          grouped[key]++;
        });

        const chartData = Object.entries(grouped).map(([name, count]) => ({ name, count }));
        setCompanyData(chartData);
        setFilteredData(chartData);
      } catch (err) {
        console.error('Failed to fetch drivers:', err.message);
      }
    }

    fetchData();
  }, []);

  // Handle date filtering (you can extend this later based on arrivalTime)
  const handleFilter = () => {
    // Placeholder logic — currently just returns all data
    // Later you can filter by arrivalTime range
    const filtered = companyData; // Replace with real date filtering
    setFilteredData(filtered);
  };

  // Download chart as PNG
  const downloadChart = () => {
    const chart = document.getElementById('companies-chart-container');

    html2canvas(chart).then(canvas => {
      const link = document.createElement('a');
      link.download = 'companies_truck_count.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  // Export to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData, {
      header: ['name', 'count']
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Companies History');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'Companies_History.xlsx');
  };

  // Prepare chart data
  const chartData = {
    labels: filteredData.map(d => d.name),
    datasets: [
      {
        label: 'Number of Trucks',
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // Tailwind blue-500
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        data: filteredData.map(d => d.count),
        hoverBackgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderRadius: 5
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Trucks Per Company'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Companies History</h1>

        {/* Date Filter */}
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border rounded"
            />
          </div>
          <button
            onClick={handleFilter}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply Filter
          </button>
          <button
            onClick={downloadChart}
            className="mt-6 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Download Chart
          </button>
          <button
            onClick={exportToExcel}
            className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export to Excel
          </button>
        </div>

        {/* Bar Chart */}
        <div id="companies-chart-container" className="w-full h-96 bg-white p-4 rounded-lg shadow-inner">
          <Bar data={{
            labels: chartData.labels,
            datasets: chartData.datasets
          }} options={options} />
        </div>
      </div>
    </div>
  );
}