import React, { useState, useEffect } from 'react';
import truckImage from '../../assets/truck.jpg';
import axios from '../../utils/axios';
import Alert from '../../components/Alert';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: 'success' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.role) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const { username, password, role } = formData;
      await axios.post('/api/users/register', { username: username.trim(), password, role });
      setAlert({ message: 'Registration successful!', type: 'success' });
      setFormData({ username: '', password: '', confirmPassword: '', role: '' });
    } catch (error) {
      const message = error?.response?.data?.message || 'Registration failed';
      setAlert({ message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => setAlert({ message: '', type: 'success' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans">
      {alert.message && <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ message: '', type: 'success' })} />}

      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${truckImage})` }} />
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, rgba(32,35,45,0.85), rgba(0,0,0,0.9))' }} />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between h-full max-w-7xl mx-auto px-6 py-12">
        <div className="text-white max-w-2xl lg:pr-16 mb-16 lg:mb-0">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            <span className="block">Create Your</span>
            <span className="text-red-400 text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 block">Account</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed max-w-md">
            Join the platform and start managing your trucks efficiently.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <h2 className="text-2xl text-center font-bold text-red-700 mb-6">Register</h2>
          <div className="space-y-4">
            <input
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              autoFocus
              className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
            />
            {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
            />
            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}

            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}

            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="guard">Guard</option>
            </select>
            {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}

            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-full text-sm transition disabled:opacity-50"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>

            <div className="text-center text-sm text-gray-600 mt-2">
              Already registered?{' '}
              <a href="/login" className="text-red-600 hover:underline">
                Log in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
