import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { Plus, X, User, Edit3, Trash2, Users, Search, Sparkles, Car } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Driver() {
  const [drivers, setDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/drivers');
      setDrivers(res.data);
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
      toast.error('Failed to load drivers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter a driver name');
      return;
    }

    try {
      if (editId) {
        const res = await axios.put(`/api/drivers/${editId}`, {
          name,
          plateNumber,
        });
        setDrivers(prev => prev.map(d => d._id === editId ? res.data : d));
        toast.success('Driver updated successfully!');
      } else {
        const res = await axios.post('/api/drivers', {
          name,
          plateNumber,
        });
        setDrivers(prev => [...prev, res.data]);
        toast.success('Driver added successfully!');
      }

      setName('');
      setPlateNumber('');
      setEditId(null);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to save driver');
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
      await axios.delete(`/api/drivers/${id}`);
      setDrivers(prev => prev.filter(d => d._id !== id));
      toast.success('Driver deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete driver');
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (driver.plateNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full w-32"></div>
                <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full w-24"></div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-16 h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg"></div>
              <div className="w-16 h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Driver Management
                </h1>
                <p className="text-slate-600 text-lg">Manage your fleet drivers efficiently</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setEditId(null);
              setName('');
              setPlateNumber('');
              setShowModal(true);
            }}
            className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3">
              <Plus className="w-5 h-5" />
              Add New Driver
              <Sparkles className="w-4 h-4 opacity-70" />
            </div>
          </button>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or plate number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-300 text-lg"
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {drivers.length}
              </div>
              <div className="text-slate-600 font-medium">Total Drivers</div>
            </div>
          </div>
        </div>

        {/* Driver List */}
        <div className="space-y-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : filteredDrivers.length > 0 ? (
            <div className="grid gap-4">
              {filteredDrivers.map((driver, index) => (
                <div
                  key={driver._id}
                  className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                          {index + 1}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors duration-300">
                          {driver.name}
                        </h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Car className="w-4 h-4 text-slate-400" />
                          {driver.plateNumber || 'No plate'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(driver)}
                        className="group/btn relative overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center gap-2">
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </div>
                      </button>

                      <button
                        onClick={() => handleDelete(driver._id)}
                        className="group/btn relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center gap-2">
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Users className="w-16 h-16 text-slate-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-600 mb-2">No drivers found</h3>
              <p className="text-slate-500 mb-8">Get started by adding your first driver to the system</p>
              <button
                onClick={() => {
                  setEditId(null);
                  setName('');
                  setPlateNumber('');
                  setShowModal(true);
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Add Your First Driver
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setShowModal(false)}
          ></div>

          <div className="relative bg-white/95 backdrop-blur-sm w-full max-w-md rounded-3xl shadow-2xl border border-white/20 p-8 z-10 transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {editId ? 'Edit Driver' : 'Add New Driver'}
                </h2>
                <p className="text-slate-600 mt-1">
                  {editId ? 'Update driver information' : 'Enter driver details below'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-3 hover:bg-slate-100 rounded-2xl transition-colors duration-200 group"
              >
                <X className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Driver Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-300 text-lg bg-white/50 backdrop-blur-sm"
                    placeholder="Enter driver name"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Plate Number
                </label>
                <div className="relative">
                  <Car className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-300 text-lg bg-white/50 backdrop-blur-sm"
                    placeholder="Enter plate number"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  {editId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="mt-16"
        toastClassName="rounded-2xl shadow-2xl"
      />
    </div>
  );
}
