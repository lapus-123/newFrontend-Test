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
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer />
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Manage Truck Types
        </h1>
        <p className="text-gray-600 mt-1">Add, view, edit or delete truck types</p>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full sm:w-1/3">
          <input
            type="text"
            placeholder="Search by type..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <button
          onClick={() => {
            setFormData({ type: '' });
            setEditId(null);
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold shadow-md flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Type
        </button>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="min-w-full table-auto text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.length > 0 ? (
              filtered.map(t => (
                <tr key={t._id}>
                  <td className="px-6 py-4">{t._id}</td>
                  <td className="px-6 py-4">{t.type}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => editType(t._id)}
                      className="text-blue-600 flex items-center gap-1"
                    >
                      <Edit className="w-5 h-5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(t._id, t.type)}
                      className="text-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-8 text-gray-500">
                  No truck types found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Truck Type' : 'Add Truck Type'}</h2>
            <form onSubmit={handleAddOrUpdate}>
              <label className="text-sm font-semibold text-gray-700">Truck Type</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full mt-2 mb-4 px-4 py-2 rounded-xl border border-gray-300 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter truck type"
              />
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold"
                >
                  {editId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirmation</h3>
            <p className="mb-6">{confirmModal.message}</p>
            <div className="flex justify-end gap-4">
              <button
                className="text-gray-600"
                onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold"
                onClick={confirmModal.onConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
