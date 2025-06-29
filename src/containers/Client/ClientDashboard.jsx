import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/sidebar';

export default function ClientDashboard() {
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 md:ml-64 p-6 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
