import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import {
  Plus, X, User, Edit3, Trash2, Search, Sparkles
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Driver() {
  const [drivers, setDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemsPerPage = 5;

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/drivers-data'); // ✅ Corrected endpoint
      setDrivers(res.data);
    } catch (err) {
      err.toast.error('Failed to load drivers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error('Please enter a driver name');

    setIsSubmitting(true);
    try {
      if (editId) {
        const res = await axios.put(`/api/drivers-data/${editId}`, { name, plateNumber });
        setDrivers(prev => prev.map(d => d._id === editId ? res.data : d));
        toast.success('Driver updated');
      } else {
        const res = await axios.post('/api/drivers-data', { name, plateNumber });
        setDrivers(prev => [...prev, res.data]);
        toast.success('Driver added');
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save driver');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (driver) => {
    setName(driver.name);
    setPlateNumber(driver.plateNumber || '');
    setEditId(driver._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    try {
      await axios.delete(`/api/drivers-data/${id}`); // ✅ Corrected endpoint
      setDrivers(prev => prev.filter(d => d._id !== id));
      toast.success('Driver deleted');
    } catch {
      toast.error('Failed to delete driver');
    }
  };

  const resetForm = () => {
    setName('');
    setPlateNumber('');
    setEditId(null);
    setShowModal(false);
    setIsSubmitting(false);
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (driver.plateNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedDrivers = filteredDrivers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-indigo-700">Driver Management</h1>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl shadow hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Add Driver <Sparkles className="w-3 h-3 opacity-70" />
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or plate number"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-300 outline-none"
          />
        </div>

        {/* Table */}
        <div className="overflow-auto rounded-xl shadow border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600">Plate Number</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr><td colSpan="3" className="text-center py-6">Loading...</td></tr>
              ) : paginatedDrivers.length === 0 ? (
                <tr><td colSpan="3" className="text-center py-6 text-slate-500">No drivers found.</td></tr>
              ) : paginatedDrivers.map(driver => (
                <tr key={driver._id}>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium text-slate-800">{driver.name}</span>
                  </td>
                  <td className="px-6 py-4">{driver.plateNumber || '—'}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(driver)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      <Edit3 className="inline w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(driver._id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      <Trash2 className="inline w-4 h-4" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg border text-sm ${currentPage === i + 1
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{editId ? 'Edit Driver' : 'Add Driver'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-600" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Driver Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Plate Number</label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : editId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}