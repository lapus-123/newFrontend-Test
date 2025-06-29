import { useEffect, useState } from 'react';
import {
  Building,
  Plus,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import axios from '../utils/axios'; // Adjust the import path as needed

export default function Company() {
  const [formData, setFormData] = useState({ name: '' });
  const [companies, setCompanies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const API_URL = '/api/companies';

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Fetch companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(API_URL);
      setCompanies(res.data);
    } catch (err) {
      err.showToast('Failed to fetch companies', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showToast('Company name is required', 'error');
      return false;
    }
    return true;
  };

  const addCompany = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const res = await axios.post(API_URL, { name: formData.name });
      setCompanies((prev) => [res.data, ...prev]);
      showToast('Company added successfully!', 'success');
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      err.showToast('Failed to add company', 'error');
    }
  };

  const editCompany = (id) => {
    const company = companies.find((c) => c._id === id);
    if (!company) return;
    setFormData({ name: company.name });
    setEditId(id);
    setIsModalOpen(true);
  };

  const updateCompany = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const res = await axios.put(`${API_URL}/${editId}`, { name: formData.name });
      setCompanies((prev) =>
        prev.map((c) => (c._id === editId ? res.data : c))
      );
      showToast('Company updated successfully!', 'info');
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      err.howToast('Failed to update company', 'error');
    }
  };

  const deleteCompany = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setCompanies((prev) => prev.filter((c) => c._id !== id));
      showToast('Company deleted.', 'warning');
    } catch (err) {
      err.showToast('Failed to delete company', 'error');
    }
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setEditId(null);
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${toast.type === 'success' ? 'bg-green-500' :
          toast.type === 'error' ? 'bg-red-500' :
            toast.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
          } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Manage Companies
        </h1>
        <p className="text-gray-600 mt-1">Add, view, edit or delete registered companies</p>
      </div>

      {/* Controls */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full sm:w-1/3">
          <input
            type="text"
            placeholder="Search by company name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold shadow-md flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Company
        </button>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto overflow-x-auto bg-white rounded-xl shadow-md border">
        <table className="min-w-full table-auto text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company) => (
                <tr key={company._id}>
                  <td className="px-6 py-4">{company._id}</td>
                  <td className="px-6 py-4">{company.name}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => editCompany(company._id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteCompany(company._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                  No companies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editId ? 'Edit Company' : 'Add New Company'}
            </h2>
            <form onSubmit={editId ? updateCompany : addCompany}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">
                  <Building className="inline w-4 h-4 mr-2 text-blue-500" />
                  Company Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:opacity-90"
                >
                  {editId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
