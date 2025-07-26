import React, { useState } from 'react';
import { Search, Calendar, X } from 'lucide-react';

const RecordArrivalModal = ({
    showModal,
    setShowModal,
    driversData,
    selectedDriver,
    setSelectedDriver,
    trucks,
    formData,
    setFormData,
    handleInputChange,
    handleSubmit,
    isDuplicate,
}) => {
    const [modalSearchTerm, setModalSearchTerm] = useState('');
    const [modalFilteredDrivers, setModalFilteredDrivers] = useState([]);

    const getFormattedTimestamp = () => {
        return new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setModalSearchTerm(value);

        if (!value.trim()) {
            setModalFilteredDrivers([]);
            return;
        }

        const matchedDrivers = driversData.filter((d) =>
            d.name?.toLowerCase().includes(value.toLowerCase()) ||
            (d.companyId?.name || d.company || '').toLowerCase().includes(value.toLowerCase()) ||
            (d.haulerId?.name || d.hauler || '').toLowerCase().includes(value.toLowerCase())
        );

        setModalFilteredDrivers(matchedDrivers);
    };

    const handleSelectDriver = (driver) => {
        setSelectedDriver(driver);
        setModalSearchTerm(driver.name); // Update local modal search only
        setModalFilteredDrivers([]);

        // Auto-fill form data including haulerId
        setFormData((prev) => ({
            ...prev,
            driversData: driver._id,
            company: driver.companyId?.name || driver.company || '',
            companyId: driver.companyId?._id || driver.companyId || null,
            hauler: driver.haulerId?.name || driver.hauler || '',
            haulerId: driver.haulerId?._id || driver.haulerId || null,
            truckType: driver.truckType || '',
            plateNumber: driver.plateNumber || '',
        }));
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
            <div
                className="relative bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl"
                style={{ minWidth: 500, maxWidth: 800 }}
            >
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-200 bg-emerald-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-100">
                                <Calendar className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Record Arrival</h3>
                                <p className="text-sm text-slate-600">Log driver arrival time</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowModal(false)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    {/* Search Driver */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Search Driver</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                value={modalSearchTerm}
                                onChange={handleSearchChange}
                                placeholder="Type driver name..."
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {modalFilteredDrivers.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-slate-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-auto z-10">
                                    {modalFilteredDrivers.map((d) => (
                                        <button
                                            key={d._id}
                                            className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                                            onClick={() => handleSelectDriver(d)}
                                        >
                                            <div className="font-medium text-slate-900">{d.name}</div>
                                            <div className="text-sm text-slate-500">
                                                {d.companyId?.name || d.company || ''} • {d.haulerId?.name || d.hauler || ''}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Selected Driver */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Selected Driver</label>
                        <input
                            type="text"
                            readOnly
                            value={selectedDriver?.name || 'No driver selected'}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
                        />
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Company (Read Only) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Company</label>
                            <input
                                type="text"
                                readOnly
                                value={formData.company}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
                            />
                        </div>

                        {/* Hauler (Read Only) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Hauler</label>
                            <input
                                type="text"
                                readOnly
                                value={formData.hauler}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
                            />
                        </div>

                        {/* Truck Type (Editable) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Truck Type</label>
                            <select
                                name="truckType"
                                value={formData.truckType}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Truck</option>
                                {trucks.map((t) => (
                                    <option key={t._id} value={t.type}>
                                        {t.type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Plate Number (Editable) */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-700">Plate Number</label>
                            <input
                                type="text"
                                name="plateNumber"
                                value={formData.plateNumber}
                                onChange={handleInputChange}
                                placeholder="Enter plate number"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Arrival Time */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-700">Arrival Time</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="arrivalTime"
                                    value={formData.arrivalTime}
                                    onChange={handleInputChange}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg"
                                />
                                <button
                                    onClick={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            arrivalTime: getFormattedTimestamp(),
                                        }))
                                    }
                                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
                                    title="Set current time"
                                >
                                    <Calendar className="w-4 h-4 text-slate-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <p className="text-sm text-yellow-800 bg-yellow-100 border border-yellow-300 px-3 py-2 rounded-md font-medium">
                            ⚠️ Double check all details before proceeding.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!selectedDriver || isDuplicate}
                                className={`px-6 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDuplicate ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'
                                    }`}
                            >
                                Save Arrival
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecordArrivalModal;