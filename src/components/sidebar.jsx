import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useLogout from '../functions/Logout';

const sidebarLinks = [
  { type: 'section', label: 'Add Section' },
  { label: 'Driver Management', iconClass: 'bx bxs-user-plus', path: '/client/add-driver-client' },
];

// Define known paths for validation
const validPaths = new Set(sidebarLinks.filter(item => item.path).map(item => item.path));

function MenuItem({ item, collapsed, isActive, handleLinkClick }) {
  if (item.type === 'section') {
    return (
      <li className={`text-xs uppercase text-gray-400 mt-4 mb-2 px-3 ${collapsed ? 'hidden' : ''}`}>
        {item.label}
      </li>
    );
  }

  return (
    <li className="relative mb-2">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleLinkClick(item.path);
        }}
        className={`flex items-center h-12 rounded-xl transition duration-300 px-3 ${isActive ? 'bg-white text-slate-900' : 'hover:bg-white/10 text-white'
          }`}
      >
        <i
          className={`${item.iconClass} text-lg`}
          style={{ minWidth: '40px', textAlign: 'center' }}
        ></i>
        <span className={`text-sm transition-opacity duration-300 ${collapsed ? 'hidden' : 'inline'}`}>
          {item.label}
        </span>
      </a>
    </li>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useLogout();

  const handleLinkClick = (path) => {
    // ✅ Check if path is valid; else go to error page
    if (validPaths.has(path)) {
      navigate(path);
    } else {
      navigate('/error/404');
    }
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', mobileOpen);
  }, [mobileOpen]);

  const Sidebar = (
    <div
      className={`h-full bg-slate-900 text-white transition-all duration-300 flex flex-col ${collapsed ? 'w-16' : 'w-64'
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
        {sidebarLinks.map((item, idx) => (
          <MenuItem
            key={item.path ? item.label + item.path : `section-${item.label}-${idx}`}
            item={item}
            collapsed={collapsed}
            isActive={item.path ? isActive(item.path) : false}
            handleLinkClick={handleLinkClick}
          />
        ))}
      </ul>

      {/* Logout + Footer */}
      <div className="px-4 py-4 bg-gray-800 flex flex-col items-center gap-3">
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg w-full"
        >
          Logout
        </button>
        <div className="text-center text-xs text-gray-300">Truck Management System</div>
      </div>
    </div>
  );

  return (
    <>
      <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white px-4 py-3">
        <i className="bx bx-menu text-2xl" onClick={() => setMobileOpen(true)}></i>
        <h1 className="text-lg font-semibold">Truck Management</h1>
        <div />
      </div>

      {/* Layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block fixed h-full z-20">{Sidebar}</div>

        {/* Mobile Sidebar */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black bg-opacity-50"
              onClick={() => setMobileOpen(false)}
            ></div>
            <div className="fixed z-50 h-full bg-slate-900 text-white w-64">{Sidebar}</div>
          </>
        )}
      </div>
    </>
  );
}
