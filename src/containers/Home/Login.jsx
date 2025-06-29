import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import truckImage from '../../assets/truck.jpg';

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdminLogin = () => navigate('/admin');
  const handleClientLogin = () => navigate('/client');

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const { email, password } = formData;
    if (email === 'admin' && password === 'admin') {
      handleAdminLogin();
    } else if (email === 'guard' && password === 'guard') {
      handleClientLogin();
    } else {
      setErrors({ password: 'Invalid credentials' });
    }

    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full font-sans overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${truckImage})` }}
      />
      <div
        className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(135deg, rgba(32,35,45,0.85), rgba(0,0,0,0.9))' }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col-reverse lg:flex-row items-center justify-center min-h-screen w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Left Panel */}
        <div className="text-white text-center lg:text-left max-w-xl mb-12 lg:mb-0 lg:mr-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
            Truck Management
            <span className="block text-red-400 text-3xl sm:text-4xl lg:text-5xl mt-2">System</span>
          </h1>
          <p className="mt-6 text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed">
            Streamline your fleet operations with a powerful and intuitive interface for tracking, scheduling, and analysis.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8">
          <h2 className="text-2xl text-center font-bold text-red-700 mb-6">Welcome</h2>

          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <div className="text-center">
                <div className="border-4 border-red-600 border-t-transparent rounded-full w-12 h-12 animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Logging in...</p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-4"
            >
              {/* Email */}
              <div>
                <label className="text-sm text-gray-700">Email or Username:</label>
                <input
                  name="email"
                  type="text"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email or username"
                  className="w-full mt-1 px-4 py-2 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
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
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-[42px] text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Remember Me */}
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

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-full text-sm transition"
              >
                Log in
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
