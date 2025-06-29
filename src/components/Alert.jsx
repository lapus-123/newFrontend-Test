import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

export default function Alert({ message, type = 'success', onClose }) {
    const baseStyles =
        'fixed top-6 right-6 z-50 flex items-center px-5 py-3 rounded-xl shadow-xl text-sm transition-all duration-300 animate-slide-fade gap-3';
    const typeStyles = {
        success: 'bg-green-50 text-green-800 border border-green-300',
        error: 'bg-red-50 text-red-800 border border-red-300',
        warning: 'bg-yellow-50 text-yellow-800 border border-yellow-300'
    };
    const iconMap = {
        success: <CheckCircle size={20} className="text-green-600" />,
        error: <XCircle size={20} className="text-red-600" />,
        warning: <AlertTriangle size={20} className="text-yellow-600" />
    };

    return (
        <div className={`${baseStyles} ${typeStyles[type]}`}>
            {iconMap[type]}
            <span className="flex-1 font-medium">{message}</span>
            <button onClick={onClose}>
                <X size={18} className="text-gray-400 hover:text-gray-600 transition" />
            </button>
        </div>
    );
}
