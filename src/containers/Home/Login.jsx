import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import truckImage from '../../assets/truck.jpg';
import Alert from '../../components/Alert';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const { email, password } = formData;
      const res = await axios.post('/api/users/login', {
        username: email.trim(),
        password
      });

      const user = res.data.user;
      setAlert({ message: 'Login successful!', type: 'success' });

      setTimeout(() => {
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'guard') {
          navigate('/client');
        } else {
          setErrors({ email: 'Unauthorized role' });
        }
      }, 1000);
    } catch (error) {
      const message = error?.response?.data?.message || 'Invalid credentials';
      setAlert({ message, type: 'error' });
      setErrors({ password: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans" onKeyDown={handleKeyDown}>
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${truckImage})` }}
      />
      <div className="absolute inset-0 z-0 bg-black/80" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between h-full max-w-7xl mx-auto px-6 py-12">
        <div className="text-white max-w-2xl lg:pr-16 mb-16 lg:mb-0">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            <span className="block">Truck Management</span>
            <span className="text-red-400 text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 block">System</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed max-w-md">
            Streamline your fleet operations with a powerful and intuitive interface for tracking, scheduling, and analysis.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <h2 className="text-2xl text-center font-bold text-red-700 mb-6">Welcome</h2>

          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <div className="text-center">
                <div className="loader border-4 border-red-600 border-t-transparent rounded-full w-12 h-12 animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Logging in...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-700">Username:</label>
                <input
                  name="email"
                  type="text"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  className="w-full mt-1 px-4 py-2 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div className="relative">
                <label className="text-sm text-gray-700">Password:</label>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full mt-1 px-4 py-2 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-9 right-3 text-gray-600 hover:text-gray-800"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-red-600"
                  />
                  Remember Me
                </label>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-full text-sm transition"
              >
                Log in
              </button>

              <div className="text-center text-sm text-gray-600 mt-2">
                Don’t have an Account?{' '}
                <a href="/register" className="text-red-600 hover:underline">
                  Sign up
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
