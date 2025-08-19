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
  <div className="bg-slate-50">
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 sm:p-2 md:p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-1 md:gap-2">
          <div>
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900">Manage Companies</h1>
            <p className="text-slate-600 mt-0 text-[10px] sm:text-xs md:text-sm">Add, view, edit or delete registered companies</p>
          </div>
          <div>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="flex items-center gap-0.5 sm:gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-1 py-0.5 sm:px-2 sm:py-1 md:px-2 md:py-1.5 rounded-md font-medium transition-colors shadow-sm text-[10px] sm:text-xs md:text-sm min-w-[70px]"
            >
              <Plus className="w-3 h-3" /> <span>Add Company</span>
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
            placeholder="Search by company name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-1 py-0.5 sm:px-1 sm:py-1 md:px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[10px] sm:text-xs"
          />
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-1 sm:px-2 md:px-4 py-1 sm:py-1 md:py-2 border-b border-slate-200">
          <h2 className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-900">Companies List</h2>
        </div>
        <div className="border-t border-slate-200">
          <div style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'scroll', overflowX: 'scroll' }}>
            <table className="w-full min-w-[700px] text-[10px] sm:text-xs md:text-sm">
              <thead className="bg-slate-50 border-b border-slate-500 sticky top-0 z-10">
                <tr>
                  <th className="text-left px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1 text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="text-left px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1 text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="text-right px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1 text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <tr key={company._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1">{company._id}</td>
                      <td className="px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1">{company.name}</td>
                      <td className="px-1 sm:px-1 md:px-2 py-0.5 sm:py-1 md:py-1 whitespace-nowrap text-right text-[10px] sm:text-xs md:text-sm font-medium space-x-0.5 sm:space-x-1">
                        <button
                          onClick={() => editCompany(company._id)}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-1 py-0.5 sm:px-1 sm:py-0.5 md:px-2 md:py-1 rounded-md shadow transition duration-200 ease-in-out text-[10px] sm:text-xs md:text-sm min-w-[55px]"
                        >
                          <Edit className="w-3 h-3 inline-block mr-0.5" /> <span className="hidden xs:inline sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => deleteCompany(company._id)}
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
                          <Building className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium text-[10px] sm:text-xs md:text-sm">No companies found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl">
            <div className="p-1 sm:p-2 md:p-3 border-b border-slate-200">
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900">
                {editId ? 'Edit Company' : 'Add New Company'}
              </h2>
            </div>
            <form onSubmit={editId ? updateCompany : addCompany} className="p-1 sm:p-2 md:p-3 space-y-2">
              <div>
                <label className="block text-[10px] sm:text-xs font-medium text-slate-700 mb-0.5">
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <Building className="w-3 h-3 text-emerald-500" />
                    Company Name
                  </div>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                  className="w-full px-1 py-0.5 sm:px-1 sm:py-1 md:px-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[10px] sm:text-xs"
                />
              </div>
              <div className="flex justify-end gap-1 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-1 py-0.5 sm:px-2 sm:py-1 text-slate-600 hover:text-slate-900 text-[10px] sm:text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-1 py-0.5 sm:px-2 sm:py-1 rounded-md font-semibold shadow transition duration-200 ease-in-out text-[10px] sm:text-xs"
                >
                  {editId ? 'Update Company' : 'Add Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
