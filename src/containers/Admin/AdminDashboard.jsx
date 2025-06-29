import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Auth Pages
import Login from './containers/Home/Login';
import Register from './containers/Home/Register';
import ForgotPassword from './containers/Home/ForgotPassword';
import logout from './functions/Logout';

// Admin Layout + Pages
import AdminDashboard from './containers/Admin/AdminDashboard';
import Home from './containers/Home';
import AddDriver from './containers/AddDriver';
import AddCompany from './containers/AddCompany';
import AddTruckType from './containers/AddTruckType';
import AddProduct from './containers/AddProduct';
import DepartedTrucks from './containers/DepartedTrucks';
import ArrivedTrucks from './containers/ArrivedTrucks';
import DriverHistory from './containers/DriversHistory';
import CompaniesHistory from './containers/CompaniesHistory';
import Summary from './containers/Summary';
import DriverManagement from './containers/DriverManagement';

// Client Layout + Pages
import ClientDashboard from './containers/Client/ClientDashboard';
import AddDriverClient from './containers/AddDriversClient';

// Error Page
import Error404 from './errors/Error404';

// 🔁 Logout Redirect Component
function LogoutRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    logout(navigate);
  }, [navigate]);
  return null;
}

export default function App() {
  return (
    <div className="App flex flex-col min-h-screen bg-gray-100">
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/logout" element={<LogoutRedirect />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="add-driver" element={<AddDriver />} />
          <Route path="add-company" element={<AddCompany />} />
          <Route path="add-truck-type" element={<AddTruckType />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="departed" element={<DepartedTrucks />} />
          <Route path="arrived" element={<ArrivedTrucks />} />
          <Route path="drivers" element={<DriverHistory />} />
          <Route path="driver-management" element={<DriverManagement />} />
          <Route path="summary" element={<Summary />} />
          <Route path="history/companies" element={<CompaniesHistory />} />
          <Route path="*" element={<Error404 />} /> {/* Admin fallback */}
        </Route>

        {/* Client Routes */}
        <Route path="/client" element={<ClientDashboard />}>
          <Route index element={<AddDriverClient />} />
          <Route path="add-driver-client" element={<AddDriverClient />} />
          <Route path="*" element={<Error404 />} /> {/* Client fallback */}
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </div>
  );
}
