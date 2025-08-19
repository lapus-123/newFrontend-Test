import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import {
  Plus, X, User, Edit3, Trash2, Search, Sparkles
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Driver() {
  const [drivers, setDrivers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [haulers, setHaulers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [haulerId, setHaulerId] = useState('');
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [driversRes, companiesRes, haulersRes] = await Promise.all([
        axios.get('/api/drivers-data'),
        axios.get('/api/companies'),
        axios.get('/api/haulers')
      ]);
      setDrivers(driversRes.data);
      setCompanies(companiesRes.data);
      setHaulers(haulersRes.data);
    } catch {
      toast.error('Failed to load initial data');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    setShowModal(true);
  };

  const resetForm = () => {
    setName('');
    setPlateNumber('');
    setCompanyId('');
    setHaulerId('');
    setEditId(null);
    setShowModal(false);
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error('Please enter a driver name');
    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      plateNumber: plateNumber.trim(),
      companyId: companyId || undefined,
      haulerId: haulerId || undefined
    };

    try {
      if (editId) {
        const res = await axios.put(`/api/drivers-data/${editId}`, payload);
        setDrivers(prev => prev.map(d => d._id === editId ? res.data : d));
        toast.success('Driver updated');
      } else {
        const res = await axios.post('/api/drivers-data', payload);
        setDrivers(prev => [res.data, ...prev]);
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
    setCompanyId(driver.companyId?._id || '');
    setHaulerId(driver.haulerId?._id || '');
    setEditId(driver._id);
    openModal();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    try {
      await axios.delete(`/api/drivers-data/${id}`);
      setDrivers(prev => prev.filter(d => d._id !== id));
      toast.success('Driver deleted');
    } catch {
      toast.error('Failed to delete driver');
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (driver.plateNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter drivers based on search

  return (
    <div className="bg-slate-50">
      <div className="mx-auto space-y-2">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 sm:p-2 md:p-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-1 md:gap-2">
            <div>
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900">Driver Management</h1>
              <p className="text-slate-600 mt-0 text-[10px] sm:text-xs md:text-sm">Manage driver information</p>
            </div>
            <button
              onClick={() => { resetForm(); openModal(); }}
              className="flex items-center gap-0.5 sm:gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-1 py-0.5 sm:px-2 sm:py-1 md:px-2 md:py-1.5 rounded-md font-medium transition-colors shadow-sm text-[10px] sm:text-xs md:text-sm min-w-[70px]"
            >
              <Plus className="w-3 h-3" /> <span className="hidden xs:inline sm:inline">Add Driver</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 my-1 sm:my-2 p-1 sm:p-1 md:p-2 flex flex-col md:flex-row gap-1 sm:gap-1 md:gap-2">
        {/*div className="relative w-full">*/}

          <div className="relative w-full md:w-1/2">

            <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-0.5">Search</label>
            <input
              type="text"
              placeholder="Search by name or plate number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-1 py-0.5 sm:px-1 sm:py-1 md:px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[10px] sm:text-xs"
            />
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-1 sm:px-2 md:px-4 py-1 sm:py-1 md:py-2 border-b border-slate-200">
            <h2 className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-900">Driver Records</h2>
          </div>
          <div className="border-t border-slate-200">
            <div style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'scroll', overflowX: 'scroll' }}>
              <table className="w-full min-w-[900px] text-[10px] sm:text-xs md:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-2 text-left text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Driver</th>
                  <th className="px-2 py-2 text-left text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Plate Number</th>
                  <th className="px-2 py-2 text-left text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
                  <th className="px-2 py-2 text-left text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Hauler</th>
                  <th className="px-2 py-2 text-right text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-1 sm:px-1 md:px-2 py-2 sm:py-4 md:py-6 text-center">
                      <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                        <div className="bg-slate-100 p-0.5 sm:p-1 md:p-2 rounded-full">
                          <User className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium text-[10px] sm:text-xs md:text-sm">Loading...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-1 sm:px-1 md:px-2 py-2 sm:py-4 md:py-6 text-center">
                      <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                        <div className="bg-slate-100 p-0.5 sm:p-1 md:p-2 rounded-full">
                          <User className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium text-[10px] sm:text-xs md:text-sm">No drivers found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map(driver => (
                    <tr key={driver._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1">
                        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5">
                          <div className="bg-slate-100 p-0.5 sm:p-1 rounded-full">
                            <User className="w-3 h-3 text-slate-600" />
                          </div>
                          <span className="font-medium text-slate-900 text-[10px] sm:text-xs md:text-sm">{driver.name}</span>
                        </div>
                      </td>
                      <td className="px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1 text-slate-600">{driver.plateNumber || '—'}</td>
                      <td className="px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1 text-slate-600">{driver.companyId?.name || '—'}</td>
                      <td className="px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1 text-slate-600">{driver.haulerId?.name || '—'}</td>
                      <td className="px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1 whitespace-nowrap text-right text-[10px] sm:text-xs md:text-sm font-medium space-x-0.5 sm:space-x-1">
                        <button 
                          onClick={() => handleEdit(driver)} 
                          className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-1 py-0.5 sm:px-1 sm:py-0.5 md:px-2 md:py-1 rounded-md shadow transition duration-200 ease-in-out text-[10px] sm:text-xs md:text-sm min-w-[55px]"
                        >
                          <Edit3 className="w-3 h-3 inline-block mr-0.5" /> <span className="hidden xs:inline sm:inline">Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(driver._id)} 
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-1 py-0.5 sm:px-1 sm:py-0.5 md:px-2 md:py-1 rounded-md shadow transition duration-200 ease-in-out text-[10px] sm:text-xs md:text-sm min-w-[55px]"
                        >
                          <span className="hidden xs:inline sm:inline">Del</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
          </table>
        </div>


      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-4 rounded-xl shadow-xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-bold">{editId ? 'Edit Driver' : 'Add Driver'}</h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-xs mb-1">Driver Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs" />
              </div>
              <div>
                <label className="block text-xs mb-1">Plate Number</label>
                <input type="text" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs" />
              </div>
              <div>
                <label className="block text-xs mb-1">Company</label>
                <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs">
                  <option value="">Select Company</option>
                  {companies.map(c => (<option key={c._id} value={c._id}>{c.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1">Hauler</label>
                <select value={haulerId} onChange={(e) => setHaulerId(e.target.value)} className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs">
                  <option value="">Select Hauler</option>
                  {haulers.map(h => (<option key={h._id} value={h._id}>{h.name}</option>))}
                </select>
              </div>
              <div className="flex justify-end gap-1 pt-2">
                <button onClick={() => setShowModal(false)} className="px-2 py-1 border rounded-md text-slate-600 text-xs" disabled={isSubmitting}>Cancel</button>
                <button onClick={handleSubmit} className="px-2 py-1 bg-indigo-600 text-white rounded-md text-xs" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
    </div>
    </div>
  );
}
