import { useEffect, useState } from 'react';
import axios from '../utils/axios'; // Adjust the import path as needed
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Product() {
  const [formData, setFormData] = useState({ name: '' });
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);

  const API_URL = '/api/products';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      const mapped = res.data.map((p) => ({ ...p, id: p._id }));
      setProducts(mapped);
    } catch {
      toast.error('Failed to fetch products');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ name: e.target.value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return false;
    }
    return true;
  };

  const addProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const res = await axios.post(API_URL, { name: formData.name });
      setProducts((prev) => [{ ...res.data, id: res.data._id }, ...prev]);
      toast.success('Product added!');
      resetForm();
      setIsModalOpen(false);
    } catch {
      toast.error('Failed to add product');
    }
  };

  const editProduct = (id) => {
    const productToEdit = products.find((p) => p.id === id);
    if (!productToEdit) return;
    setFormData({ name: productToEdit.name });
    setEditId(id);
    setIsModalOpen(true);
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const res = await axios.put(`${API_URL}/${editId}`, { name: formData.name });
      setProducts((prev) =>
        prev.map((p) => (p.id === editId ? { ...res.data, id: res.data._id } : p))
      );
      toast.info('Product updated!');
      resetForm();
      setEditId(null);
      setIsModalOpen(false);
    } catch {
      toast.error('Failed to update product');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.warning('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setEditId(null);
  };

  const displayProducts = () =>
    products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer />
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
          Manage Products
        </h1>
        <p className="text-gray-600 mt-1">Add, edit, or delete products</p>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full sm:w-1/3">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      <div className="max-w-6xl mx-auto overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="min-w-full table-auto text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Product Name</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayProducts().length > 0 ? (
              displayProducts().map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">{p.id}</td>
                  <td className="px-6 py-4">{p.name}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => editProduct(p.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
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
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editId ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={editId ? updateProduct : addProduct}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Package className="w-4 h-4 text-green-500" />
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {editId ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
