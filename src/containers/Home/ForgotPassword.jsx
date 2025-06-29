import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import truckImage from '../../assets/truck.jpg';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Password reset link sent!');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans">
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${truckImage})` }}
      />
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, rgba(32,35,45,0.85), rgba(0,0,0,0.9))',
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between h-full max-w-7xl mx-auto px-6 py-12">
        {/* Left text */}
        <div className="text-white max-w-2xl lg:pr-16 mb-16 lg:mb-0">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            <span className="block">Reset Your</span>
            <span className="text-red-400 text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 block">
              Password
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed max-w-md">
            Enter your email address and we’ll send you a link to reset your password.
          </p>
        </div>

        {/* Right form */}
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <h2 className="text-2xl text-center font-bold text-red-700 mb-6">Forgot Password</h2>

          <div className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-full text-sm transition disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>

            {/* ✅ Remember password link */}
            <p className="text-sm text-center text-gray-600 mt-4">
              Remember your password?{' '}
              <span
                className="text-red-600 hover:underline cursor-pointer font-medium"
                onClick={() => navigate('/login')}
              >
                Log in
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
