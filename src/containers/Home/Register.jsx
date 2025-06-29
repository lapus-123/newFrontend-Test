import React, { useState } from 'react';
import truckImage from '../../assets/truck.jpg';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Registration successful!');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

return (
    <div className="relative w-full h-screen overflow-hidden font-sans">
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
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                    />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}

                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                    />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

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
