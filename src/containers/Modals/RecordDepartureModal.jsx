// RecordDepartureModal.jsx
import React from 'react';
import { Calendar, X, Plus, Trash2 } from 'lucide-react';

const RecordDepartureModal = ({
    showModal,
    setShowModal,
    selectedDriver,
    products,
    formData,
    setFormData,
    handleInputChange,
    handleSubmit,
    addProductField,
    removeProductField,
    updateProductField
}) => {
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

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
            <div
                className="relative bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl"
                style={{ minWidth: 500, maxWidth: 800 }}
            >
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-200 bg-blue-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Record Departure</h3>
                                <p className="text-sm text-slate-600">Enter departure details</p>
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

                    {/* Company (Read Only) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Company</label>
                        <input
                            type="text"
                            readOnly
                            value={formData.company || 'Auto-filled from driver'}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
                        />
                    </div>

                    {/* Truck Type (Read Only) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Truck Type</label>
                        <input
                            type="text"
                            readOnly
                            value={formData.truckType || 'Auto-filled from driver'}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
                        />
                    </div>

                    {/* Plate Number */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Plate Number</label>
                        <input
                            name="plateNumber"
                            value={formData.plateNumber}
                            onChange={handleInputChange}
                            placeholder="Enter plate number"
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Departure Time */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Departure Time</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="departureTime"
                                value={formData.departureTime}
                                onChange={handleInputChange}
                                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg"
                            />
                            <button
                                onClick={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        departureTime: getFormattedTimestamp(),
                                    }))
                                }
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
                                title="Set current time"
                            >
                                <Calendar className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>
                    </div>

                    {/* Destination */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Destination</label>
                        <input
                            name="destination"
                            value={formData.destination}
                            onChange={handleInputChange}
                            placeholder="Enter destination"
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Products */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-700">Products</label>
                            {formData.products.length < 5 && (
                                <button
                                    type="button"
                                    onClick={addProductField}
                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Product
                                </button>
                            )}
                        </div>
                        <div className="space-y-3">
                            {formData.products.map((product, index) => (
                                <div key={index} className="border border-slate-200 rounded-lg p-3 relative">
                                    {formData.products.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeProductField(index)}
                                            className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                                            title="Remove product"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs text-slate-600">Product</label>
                                            <select
                                                value={product.productId}
                                                onChange={(e) => updateProductField(index, 'productId', e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                                            >
                                                <option value="">Select Product</option>
                                                {products.map((p) => (
                                                    <option key={p._id} value={p._id}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {formData.products.length === 0 && (
                                <div className="text-center py-2 text-sm text-slate-500 italic">
                                    No products added yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DN Number */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">DN Number</label>
                        <input
                            name="dnNumber"
                            value={formData.dnNumber}
                            onChange={handleInputChange}
                            placeholder="Enter DN number"
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
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
                                className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                            >
                                Save Departure
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecordDepartureModal;