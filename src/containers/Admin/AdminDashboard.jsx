import React from 'react';
import AdminSidebar from '../../components/adminsidebar';
import { Outlet } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <main className="flex-1 md:ml-64 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
