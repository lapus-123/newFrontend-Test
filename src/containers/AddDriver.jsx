import { useEffect, useState } from 'react';
import {
  User, Truck, Package, MapPin, Calendar, Search, Download, Edit2, Trash2
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from '../utils/axios';

export default function AddDriver() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [truckTypes, setTruckTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [filterTruckType, setFilterTruckType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const PAGE_SIZE = 5;

  // Fetch all data on load
  useEffect(() => {
    async function fetchData() {
      try {
        const [dRes, tRes, pRes, cRes] = await Promise.all([
          axios.get('/api/drivers'),
          axios.get('/api/trucks'),
          axios.get('/api/products'),
          axios.get('/api/companies/dropdown')
        ]);
        setDrivers(dRes.data);
        setTruckTypes(tRes.data);
        setProducts(pRes.data);
        setCompanies(cRes.data);
      } catch (err) {
        toast.error('Failed to fetch data');
      }
    }

    fetchData();
  }, []);

  // Validate form
  const validate = () => {
    const e = {};
    const requiredFields = ['name', 'plateNumber', 'age', 'address', 'truckTypeId', 'companyId'];
    requiredFields.forEach(field => {
      if (!formData[field]?.toString().trim()) {
        e[field] = `${field.replace(/([A-Z])/g, ' $1')} is required`;
      }
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openNew = () => {
    setFormData({});
    setEditingId(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (d) => {
    const truckType = truckTypes.find(t => t._id === d.truckTypeId?._id)?.type || '';
    const productType = products.find(p => p._id === d.productId?._id)?.name || '';
    const company = companies.find(c => c._id === d.companyId?._id)?.name || '';

    setFormData({
      name: d.name,
      plateNumber: d.plateNumber,
      age: d.age,
      address: d.address,
      truckTypeId: d.truckTypeId?._id || '',
      truckType,
      productId: d.productId?._id || '',
      productType,
      companyId: d.companyId?._id || '',
      company
    });

    setEditingId(d._id);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleTruckTypeChange = (e) => {
    const selectedId = e.target.value;
    const selectedTruck = truckTypes.find(t => t._id === selectedId);
    setFormData(prev => ({
      ...prev,
      truckTypeId: selectedId,
      truckType: selectedTruck ? selectedTruck.type : ''
    }));
  };

  const handleProductChange = (e) => {
    const selectedId = e.target.value;
    const selectedProduct = products.find(p => p._id === selectedId);
    setFormData(prev => ({
      ...prev,
      productId: selectedId,
      productType: selectedProduct ? selectedProduct.name : ''
    }));
  };

  const handleCompanyChange = (e) => {
    const selectedId = e.target.value;
    const selectedCompany = companies.find(c => c._id === selectedId);
    setFormData(prev => ({
      ...prev,
      companyId: selectedId,
      company: selectedCompany ? selectedCompany.name : ''
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return toast.error('Fix the errors in the form');
    setIsLoading(true);

    try {
      const url = editingId ? `/api/drivers/${editingId}` : '/api/drivers';
      const method = editingId ? 'put' : 'post';

      const res = await axios[method](url, formData);

      if (method === 'post') {
        setDrivers([res.data, ...drivers]);
        toast.success('Driver added');
      } else {
        setDrivers(drivers.map(d => d._id === editingId ? res.data : d));
        toast.success('Driver updated');
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(editingId ? 'Failed to update driver' : 'Failed to add driver');
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this driver?')) return;
    try {
      await axios.delete(`/api/drivers/${id}`);
      setDrivers(drivers.filter(d => d._id !== id));
      toast.warning('Driver deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  // Filtering logic
  const filtered = drivers
    .filter(d =>
      (d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       d.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!ageMin || d.age >= +ageMin) &&
      (!ageMax || d.age <= +ageMax) &&
      (!filterTruckType || d.truckTypeId === filterTruckType)
    )
    .sort((a, b) => {
      const valA = (a[sortField] || '').toString().toLowerCase();
      const valB = (b[sortField] || '').toString().toLowerCase();
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportExcel = () => {
    setTimeout(() => {
      const ws = XLSX.utils.json_to_sheet(filtered);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Drivers');
      const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([buf]), 'drivers.xlsx');
    }, 500);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <ToastContainer />

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded w-full sm:w-auto"
        />
        <div className="flex flex-wrap gap-2">
          <input
            type="number"
            placeholder="Min Age"
            value={ageMin}
            onChange={e => setAgeMin(e.target.value)}
            className="px-4 py-2 border rounded"
          />
          <input
            type="number"
            placeholder="Max Age"
            value={ageMax}
            onChange={e => setAgeMax(e.target.value)}
            className="px-4 py-2 border rounded"
          />
          <select
            value={filterTruckType}
            onChange={e => setFilterTruckType(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="">All Truck Types</option>
            {truckTypes.map(t => (
              <option key={t._id} value={t._id}>{t.type}</option>
            ))}
          </select>
        </div>
        <button onClick={openNew} className="ml-auto px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
          <User size={18} /> Add Driver
        </button>
        <button onClick={exportExcel} className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2">
          <Download size={18} /> Export
        </button>
      </div>

      {/* Table */}
        <div className="overflow-x-auto bg-white shadow rounded-md">
          <table className="w-full table-auto text-left">
            <thead className="bg-gray-200">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Plate Number</th>
            <th className="p-3">Age</th>
            <th className="p-3">Address</th>
            <th className="p-3">Truck Type</th>
            <th className="p-3">Product Type</th>
            <th className="p-3">Company</th>
            <th className="p-3">Actions</th>
          </tr>
            </thead>
            <tbody>
          {pageItems.length > 0 ? (
            pageItems.map(d => (
              <tr key={d._id} className="border-b hover:bg-gray-50">
            <td className="p-3">{d.name}</td>
            <td className="p-3">{d.plateNumber}</td>
            <td className="p-3">{d.age}</td>
            <td className="p-3">{d.address}</td>
            <td className="p-3">{d.truckType}</td>
            <td className="p-3">{d.productType}</td>
            <td className="p-3">{d.company}</td>
            <td className="p-3 flex gap-2">
              <button
                onClick={() => openEdit(d)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                <Edit2 size={18} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onDelete(d._id)}
                className="flex items-center gap-1 text-red-600 hover:text-red-800"
              >
                <Trash2 size={18} />
                <span>Delete</span>
              </button>
            </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="8" className="p-4 text-center">No drivers found.</td></tr>
          )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center gap-2 my-4">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded">Prev</button>
          {[...Array(pageCount)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded ${page === i + 1 ? 'bg-gray-300' : ''}`}
            >
              {i + 1}
            </button>
          ))}
          <button disabled={page === pageCount} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded">Next</button>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add'} Driver</h2>
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['name', 'plateNumber', 'age', 'address'].map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700">{field}</label>
                  <input
                    type={field === 'age' ? 'number' : 'text'}
                    value={formData[field] || ''}
                    onChange={e => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                    className={`w-full p-2 border rounded ${errors[field] ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
                </div>
              ))}

              <div>
                <label className="block mb-1">Truck Type</label>
                <select
                  value={formData.truckTypeId || ''}
                  onChange={handleTruckTypeChange}
                  className={`w-full p-2 border rounded ${errors.truckTypeId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">-- Select Truck --</option>
                  {truckTypes.map(t => (
                    <option key={t._id} value={t._id}>{t.type}</option>
                  ))}
                </select>
                {errors.truckTypeId && <p className="text-red-500 text-sm mt-1">{errors.truckTypeId}</p>}
              </div>

              <div>
                <label className="block mb-1">Product (Optional)</label>
                <select
                  value={formData.productId || ''}
                  onChange={handleProductChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">-- Select Product --</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block mb-1">Company</label>
                <select
                  value={formData.companyId || ''}
                  onChange={handleCompanyChange}
                  className={`w-full p-2 border rounded ${errors.companyId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">-- Select Company --</option>
                  {companies.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                {errors.companyId && <p className="text-red-500 text-sm mt-1">{errors.companyId}</p>}
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}