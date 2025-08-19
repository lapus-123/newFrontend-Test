import { useEffect, useState } from 'react';
import {
  Plus, Edit, Trash2, Search
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from '../utils/axios'; 

export default function AddTruckType() {
  const [formData, setFormData] = useState({ type: '' });
  const [truckTypes, setTruckTypes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    action: null,
    message: '',
    onConfirm: null,
  });

  const API_URL = '/api/trucks';

  useEffect(() => {
    fetchTruckTypes();
  }, []);

  const fetchTruckTypes = async () => {
    try {
      const res = await axios.get(API_URL);
      setTruckTypes(res.data);
    } catch {
      toast.error('Failed to fetch truck types');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.type.trim()) {
      toast.error('Truck type is required');
      return false;
    }
    return true;
  };

  const handleAddOrUpdate = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setConfirmModal({
      open: true,
      action: editId ? 'update' : 'add',
      message: editId
        ? `Update truck type to "${formData.type}"?`
        : `Add truck type "${formData.type}"?`,
      onConfirm: () => (editId ? updateType() : addType()),
    });
  };

  const addType = async () => {
    try {
      const res = await axios.post(API_URL, formData);
      setTruckTypes([res.data, ...truckTypes]);
      toast.success('Truck type added');
      closeModal();
    } catch {
      toast.error('Failed to add truck type');
    }
    setConfirmModal(prev => ({ ...prev, open: false }));
  };

  const updateType = async () => {
    try {
      const res = await axios.put(`${API_URL}/${editId}`, formData);
      setTruckTypes(truckTypes.map(t => (t._id === editId ? res.data : t)));
      toast.info('Truck type updated');
      closeModal();
    } catch {
      toast.error('Failed to update truck type');
    }
    setConfirmModal(prev => ({ ...prev, open: false }));
  };

  const handleDelete = (id, type) => {
    setConfirmModal({
      open: true,
      action: 'delete',
      message: `Delete truck type "${type}"?`,
      onConfirm: () => deleteType(id),
    });
  };

  const deleteType = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTruckTypes(truckTypes.filter(t => t._id !== id));
      toast.warning('Truck type deleted');
    } catch {
      toast.error('Failed to delete truck type');
    }
    setConfirmModal(prev => ({ ...prev, open: false }));
  };

  const editType = (id) => {
    const t = truckTypes.find(t => t._id === id);
    if (t) {
      setFormData({ type: t.type });
      setEditId(id);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setFormData({ type: '' });
    setEditId(null);
    setIsModalOpen(false);
  };

  const filtered = truckTypes.filter(t =>
    t.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
  <div className="bg-slate-50">
      <ToastContainer />
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 sm:p-2 md:p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-1 md:gap-2">
          <div>
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900">Manage Truck Types</h1>
            <p className="text-slate-600 mt-0 text-[10px] sm:text-xs md:text-sm">Add, view, edit or delete truck types</p>
          </div>
          <div>
            <button
              onClick={() => {
                setFormData({ type: '' });
                setEditId(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-0.5 sm:gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-1 py-0.5 sm:px-2 sm:py-1 md:px-2 md:py-1.5 rounded-md font-medium transition-colors shadow-sm text-[10px] sm:text-xs md:text-sm min-w-[70px]"
            >
              <Plus className="w-3 h-3" /> <span>Add Type</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 my-1 sm:my-2 p-1 sm:p-1 md:p-2">
        <div className="relative w-full md:w-1/2">
          <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-0.5">Search</label>
          <input
            type="text"
            placeholder="Search by type..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-1 py-0.5 sm:px-1 sm:py-1 md:px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[10px] sm:text-xs"
          />
        </div>
      </div>

      {/* Types Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-1 sm:px-2 md:px-4 py-1 sm:py-1 md:py-2 border-b border-slate-200">
          <h2 className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-900">Truck Types List</h2>
        </div>
        <div className="border-t border-slate-200">
          <div style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'scroll', overflowX: 'scroll' }}>
            <table className="w-full min-w-[700px] text-[10px] sm:text-xs md:text-sm">
              <thead className="bg-slate-50 border-b border-slate-500 sticky top-0 z-10">
                <tr>
                  <th className="text-left px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1 text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="text-left px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1 text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-right px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1 text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.length > 0 ? (
                  filtered.map(t => (
                    <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1">{t._id}</td>
                      <td className="px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1">{t.type}</td>
                      <td className="px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1 whitespace-nowrap text-right text-[10px] sm:text-xs md:text-sm font-medium space-x-0.5 sm:space-x-1">
                        <button
                          onClick={() => editType(t._id)}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-1 py-0.5 sm:px-1 sm:py-0.5 md:px-2 md:py-1 rounded-md shadow transition duration-200 ease-in-out text-[10px] sm:text-xs md:text-sm min-w-[55px]"
                        >
                          <Edit className="w-3 h-3 inline-block mr-0.5" /> <span className="hidden xs:inline sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(t._id, t.type)}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-1 py-0.5 sm:px-1 sm:py-0.5 md:px-2 md:py-1 rounded-md shadow transition duration-200 ease-in-out text-[10px] sm:text-xs md:text-sm min-w-[55px]"
                        >
                          <span className="hidden xs:inline sm:inline">Del</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-1 sm:px-1 md:px-2 py-2 sm:py-4 md:py-6 text-center">
                      <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                        <div className="bg-slate-100 p-0.5 sm:p-1 md:p-2 rounded-full">
                          <Plus className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium text-[10px] sm:text-xs md:text-sm">No truck types found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl">
            <div className="p-1 sm:p-2 md:p-3 border-b border-slate-200">
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900">
                {editId ? 'Edit Truck Type' : 'Add Truck Type'}
              </h2>
            </div>
            <form onSubmit={handleAddOrUpdate} className="p-1 sm:p-2 md:p-3 space-y-2">
              <div>
                <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-0.5">
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <Plus className="w-3 h-3 text-emerald-500" />
                    Truck Type
                  </div>
                </label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  placeholder="Enter truck type"
                  className="w-full px-1 py-0.5 sm:px-1 sm:py-1 md:px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[10px] sm:text-xs"
                />
              </div>
              <div className="flex justify-end gap-1 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-1 py-0.5 sm:px-2 sm:py-1 text-slate-600 hover:text-slate-900 text-[10px] sm:text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-1 py-0.5 sm:px-2 sm:py-1 rounded-md font-semibold shadow transition duration-200 ease-in-out text-[10px] sm:text-xs"
                >
                  {editId ? 'Update Type' : 'Add Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl">
            <div className="p-1 sm:p-2 md:p-3 border-b border-slate-200">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900">Confirmation</h3>
            </div>
            <div className="p-1 sm:p-2 md:p-3 space-y-2">
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600">{confirmModal.message}</p>
              <div className="flex justify-end gap-1 pt-2 border-t border-slate-200">
                <button
                  className="px-1 py-0.5 sm:px-2 sm:py-1 text-slate-600 hover:text-slate-900 text-[10px] sm:text-xs"
                  onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                >
                  Cancel
                </button>
                <button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-1 py-0.5 sm:px-2 sm:py-1 rounded-md font-semibold shadow transition duration-200 ease-in-out text-[10px] sm:text-xs"
                  onClick={confirmModal.onConfirm}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
