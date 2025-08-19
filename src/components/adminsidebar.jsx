import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const sidebarLinks = [

    { type: 'section', label: 'Management' },
    { label: 'Driver Managememt', iconClass: 'bx bxs-user-plus', path: '/admin/driver-management' },
    { type: 'section', label: 'Add Section' },
    { label: 'Add Driver', iconClass: 'bx bxs-user-plus', path: '/admin/add-driver' },
    { label: 'Add Hauler', iconClass: 'bx bxs-truck', path: '/admin/add-hauler' },
    { label: 'Add Truck Type', iconClass: 'bx bxs-truck', path: '/admin/add-truck-type' },
    { label: 'Add Company', iconClass: 'bx bxs-buildings', path: '/admin/add-company' },
    { label: 'Add Product', iconClass: 'bx bxs-package', path: '/admin/add-product' },

    { type: 'section', label: 'History' },
    { label: 'Driver and Truck History', iconClass: 'bx bxs-user-voice', path: '/admin/drivers' },
    { label: 'Companies History', iconClass: 'bx bxs-archive-in', path: '/admin/history/companies' },

    { type: 'section', label: 'Summary' },
    { label: 'Arrived Trucks', iconClass: 'bx bxs-truck', path: '/admin/arrived' },
    { label: 'Departed Trucks', iconClass: 'bx bxs-truck', path: '/admin/departed' },
    { label: 'Summary', iconClass: 'bx bxs-pie-chart-alt-2', path: '/admin/summary' }
];

function MenuItem({ item, isActive, handleLinkClick }) {
    if (item.type === 'section') {
        return (
            <li className="text-xs uppercase text-gray-400 mt-4 mb-2 px-3">
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
                className={`flex items-center h-12 rounded-xl transition duration-300 px-3 ${isActive ? 'bg-white text-slate-900' : 'hover:bg-white/10 text-white'}`}
            >
                <i className={`${item.iconClass} text-lg`} style={{ minWidth: '40px', textAlign: 'center' }}></i>
                <span className="text-sm transition-opacity duration-300">
                    {item.label}
                </span>
            </a>
        </li>
    );
}

export default function AdminSidebar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLinkClick = (path) => {
        navigate(path);
        setMobileOpen(false);
    };

    const handleLogout = () => {
        localStorage.clear(); // Remove token, role, etc.
        navigate('/login', { replace: true });
    };

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        document.body.classList.toggle('overflow-hidden', mobileOpen);
    }, [mobileOpen]);

    const Sidebar = (
        <div className="h-full bg-slate-900 text-white transition-all duration-300 flex flex-col w-64">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
                <div className="flex items-center">
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/10473/10473350.png"
                        style={{ width: '32px', height: '32px' }}
                    />
                    <span className="text-lg font-semibold ml-2">Truck Management</span>
                </div>
            </div>

            {/* Links */}
            <ul className="flex-1 overflow-auto px-2">
                {sidebarLinks.map((item, idx) => (
                    <MenuItem
                        key={item.path ? item.label + item.path : `section-${item.label}-${idx}`}
                        item={item}
                        isActive={item.path ? isActive(item.path) : false}
                        handleLinkClick={handleLinkClick}
                    />
                ))}
            </ul>

            {/* Logout + Footer */}
            <div className="px-4 py-4 bg-gray-800 flex flex-col items-center gap-3">
                <button
                    onClick={handleLogout}
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
                        <div
                            className="fixed inset-0 z-40 bg-black bg-opacity-50"
                            onClick={() => setMobileOpen(false)}
                        ></div>
                        <div className="fixed z-50 h-full left-0 top-0 bg-slate-900 text-white w-64">{Sidebar}</div>
                    </>
                )}
            </div>
        </>
    );
}
