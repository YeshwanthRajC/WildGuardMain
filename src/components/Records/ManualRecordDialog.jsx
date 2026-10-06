import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Clock, AlertTriangle, FileText, Info } from 'lucide-react';

const CASE_TYPES = [
  'Wildlife Sighting',
  'Elephant Intrusion',
  'Leopard Sighting',
  'Human Death',
  'Human Injury',
  'Crop Damage',
  'Property Damage',
  'Village Intrusion',
  'Livestock Attack',
  'Other'
];

const THREAT_LEVELS = [
  { level: 'Low', color: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' },
  { level: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200' },
  { level: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200' },
  { level: 'Critical', color: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200' }
];

const ManualRecordDialog = ({ isOpen, onClose, onSubmit, onDelete, initialData }) => {
  const [formData, setFormData] = useState({
    location_name: '',
    case_type: CASE_TYPES[0],
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    threat_level: 'Medium'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        location_name: initialData.location_name || '',
        case_type: initialData.case_type || CASE_TYPES[0],
        description: initialData.description || '',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: initialData.time || new Date().toTimeString().split(' ')[0].substring(0, 5),
        threat_level: initialData.threat_level || 'Medium'
      });
    } else {
      setFormData({
        location_name: '',
        case_type: CASE_TYPES[0],
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        threat_level: 'Medium'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-2000 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>{initialData ? 'Edit Manual Record' : 'Add Manual Record'}</span>
            </h2>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white transition-colors p-1 hover:bg-blue-500 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto">
            <form id="record-form" onSubmit={handleSubmit} className="space-y-5">
              
              {/* Location Name */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>Location Name</span>
                </label>
                <input
                  type="text"
                  name="location_name"
                  value={formData.location_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. South Farm District"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              {/* Case Type */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Info className="w-4 h-4 text-gray-500" />
                  <span>Case Type</span>
                </label>
                <select
                  name="case_type"
                  value={formData.case_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none"
                >
                  {CASE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Date and Time Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>Date</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>Time</span>
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Threat Level */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-gray-500" />
                  <span>Threat Level</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {THREAT_LEVELS.map(({ level, color }) => (
                    <button
                      type="button"
                      key={level}
                      onClick={() => setFormData(prev => ({ ...prev, threat_level: level }))}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                        formData.threat_level === level
                          ? `${color} ring-2 ring-offset-1 ring-${color.split('-')[1]}-500`
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>Description</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
                  placeholder="Provide incident details..."
                ></textarea>
              </div>

            </form>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center sticky bottom-0 z-10">
            {initialData ? (
              <button
                type="button"
                onClick={() => onDelete(initialData.id)}
                className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors border border-red-100"
              >
                Delete Record
              </button>
            ) : <div></div>}
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="record-form"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md shadow-blue-200 transition-all"
              >
                {initialData ? 'Save Changes' : 'Save Record'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ManualRecordDialog;
