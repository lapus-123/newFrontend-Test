import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useRoutes } from 'react-router-dom';

// Route Components
import Home from '../containers/Home';
import AddDriver from '../containers/AddDriver';
import AddCompany from '../containers/AddCompany';
import AddTruckType from '../containers/AddTruckType';
import AddProduct from '../containers/AddProduct';
import Summary from '../containers/Summary';
import CompanySummary from '../containers/CompaniesSummary';
import DepartedTrucks from '../containers/DepartedTrucks';
import ArrivedTrucks from '../containers/ArrivedTrucks';
import DriverHistory from '../containers/DriversHistory';
import CompaniesHistory from '../containers/CompaniesHistory';

// Sidebar Link Configuration
const sidebarLinks = [
  { type: 'section', label: 'Main' },
  { label: 'Home', iconClass: 'bx bxs-home', path: '/home' },

  { type: 'section', label: 'Add Section' },
  { label: 'Add Driver', iconClass: 'bx bxs-user-plus', path: '/add-driver' },
  { label: 'Add Truck Type', iconClass: 'bx bxs-truck', path: '/add-truck-type' },
  { label: 'Add Company', iconClass: 'bx bxs-buildings', path: '/add-company' },
  { label: 'Add Product', iconClass: 'bx bxs-package', path: '/add-product' },

  { type: 'section', label: 'History' },
  { label: 'Drivers History', iconClass: 'bx bxs-user-voice', path: '/drivers' },
  { label: 'Companies History', iconClass: 'bx bxs-archive-in', path: '/history/companies' },

  { type: 'section', label: 'Dashboard' },
  { label: 'Arrived Trucks', iconClass: 'bx bxs-truck', path: '/arrived' },
  { label: 'Departed Trucks', iconClass: 'bx bxs-truck', path: '/departed' },
  { label: 'Summary', iconClass: 'bx bxs-pie-chart-alt-2', path: '/summary' },
  { label: 'Company Summary', iconClass: 'bx bxs-bar-chart-alt-2', path: '/summary/companies' },
];

function MenuItem({ item, collapsed, isActive, handleLinkClick }) {
  if (item.type === 'section') {
    return (
      <li className={`text-xs uppercase text-gray-400 mt-4 mb-2 px-3 ${collapsed ? 'hidden' : ''}`}>
        {item.label}
      </li>
    );
  }

  return (
    <li className={`relative mb-2`}>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleLinkClick(item.path);
        }}
        className={`flex items-center h-12 rounded-xl transition duration-300 px-3 ${
          isActive ? 'bg-white text-slate-900' : 'hover:bg-white/10 text-white'
        }`}
      >
        <i
          className={`${item.iconClass} text-lg`}
          style={{ minWidth: '40px', textAlign: 'center', fontSize: '18px' }}
        ></i>
        <span className={`text-sm transition-opacity duration-300 ${collapsed ? 'hidden' : 'inline'}`}>
          {item.label}
        </span>
      </a>
    </li>
  );
}

export default function ModernProSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const routes = [
    { path: '/', element: <Home /> },
    { path: '/home', element: <Home /> },
    { path: '/add-driver', element: <AddDriver /> },
    { path: '/add-company', element: <AddCompany /> },
    { path: '/add-truck-type', element: <AddTruckType /> },
    { path: '/add-product', element: <AddProduct /> },
    { path: '/summary', element: <Summary /> },
    { path: '/summary/companies', element: <CompanySummary /> },
    { path: '/departed', element: <DepartedTrucks /> },
    { path: '/arrived', element: <ArrivedTrucks /> },
    { path: '/drivers', element: <DriverHistory /> },
    { path: '/history/companies', element: <CompaniesHistory /> },
    { path: '*', element: <div className="text-white text-center text-xl">404 - Page Not Found</div> }
  ];

  const currentComponent = useRoutes(routes);

  const handleLinkClick = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', mobileOpen);
  }, [mobileOpen]);

  const Sidebar = (
    <div
      className={`h-full bg-slate-900 text-white transition-all duration-300 flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {!collapsed && <span className="text-lg font-semibold">Truck Management</span>}
        <i
          className={`bx cursor-pointer text-2xl ${collapsed ? 'bx-menu' : 'bx-menu-alt-right'}`}
          onClick={() => setCollapsed(!collapsed)}
        ></i>
      </div>

      {/* Links */}
      <ul className="flex-1 overflow-auto px-2">
        {sidebarLinks.map((item) => (
          <MenuItem
            key={item.label + item.path}
            item={item}
            collapsed={collapsed}
            isActive={isActive(item.path)}
            handleLinkClick={handleLinkClick}
          />
        ))}
      </ul>

      {/* Footer */}
      <div className="px-4 py-4 bg-gray-800 text-center text-xs text-gray-300">
        Truck Management System
      </div>
    </div>
  );

  return (
    <>
      <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white px-4 py-3">
        <i className="bx bx-menu text-2xl" onClick={() => setMobileOpen(true)}></i>
        <h1 className="text-lg font-semibold">TruckFlow</h1>
        <div />
      </div>

      {/* Layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block fixed h-full z-20">{Sidebar}</div>

        {/* Mobile Sidebar */}
        {mobileOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMobileOpen(false)}></div>
            <div className="fixed z-50 h-full bg-slate-900 text-white w-64">{Sidebar}</div>
          </>
        )}

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 overflow-y-auto ${
            collapsed ? 'md:ml-16' : 'md:ml-64'
          } p-6 pt-4`}
        >
          {currentComponent}
        </main>
      </div>
    </>
  );
}
