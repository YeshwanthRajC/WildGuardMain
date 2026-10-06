import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, HardDrive, Wifi, Calendar, CheckCircle } from 'lucide-react';

const EditDeviceDialog = ({ isOpen, onClose, onSubmit, onDelete, initialData }) => {
  const [formData, setFormData] = useState({
    device_name: '',
    location: '',
    latitude: '',
    longitude: '',
    mqtt_broker: 'broker.emqx.io',
    mqtt_port: 1883,
    mqtt_topic: '',
    last_service_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        device_name: initialData.device_name || '',
        location: initialData.location || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
        mqtt_broker: initialData.mqtt_broker || 'broker.emqx.io',
        mqtt_port: initialData.mqtt_port || 1883,
        mqtt_topic: initialData.mqtt_topic || '',
        last_service_date: initialData.last_service_date ? new Date(initialData.last_service_date).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        device_name: '',
        location: '',
        latitude: '',
        longitude: '',
        mqtt_broker: 'broker.emqx.io',
        mqtt_port: 1883,
        mqtt_topic: '',
        last_service_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      mqtt_port: parseInt(formData.mqtt_port, 10)
    });
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMarkServiced = () => {
    setFormData(prev => ({
      ...prev,
      last_service_date: new Date().toISOString().split('T')[0]
    }));
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
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <HardDrive className="w-5 h-5" />
              <span>{initialData ? 'Edit Edge Device' : 'Add Edge Device'}</span>
            </h2>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto">
            <form id="device-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* General Information */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>General Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Device Name</label>
                    <input type="text" name="device_name" value={formData.device_name} onChange={handleChange} required placeholder="e.g. Node 1" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Location</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="e.g. Prototype Area" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Latitude</label>
                    <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="Optional" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Longitude</label>
                    <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="Optional" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* MQTT Configuration */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <Wifi className="w-4 h-4 text-gray-500" />
                  <span>MQTT Configuration</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="text-sm font-semibold text-gray-700">MQTT Broker URL</label>
                    <input type="text" name="mqtt_broker" value={formData.mqtt_broker} onChange={handleChange} required className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Port</label>
                    <input type="number" name="mqtt_port" value={formData.mqtt_port} onChange={handleChange} required className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" />
                  </div>
                  <div className="space-y-1 col-span-3">
                    <label className="text-sm font-semibold text-gray-700">Topic</label>
                    <input type="text" name="mqtt_topic" value={formData.mqtt_topic} onChange={handleChange} required placeholder="elephantalert/device/xyz" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* Maintenance */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>Maintenance Information</span>
                  </h3>
                  {initialData && (
                    <button type="button" onClick={handleMarkServiced} className="text-xs bg-green-100 hover:bg-green-200 text-green-700 font-medium px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark as Serviced Today</span>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Last Service Date</label>
                    <input type="date" name="last_service_date" value={formData.last_service_date} onChange={handleChange} required className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" />
                  </div>
                  <div className="space-y-1 flex flex-col justify-end">
                    <p className="text-xs text-gray-500 italic">Next service date is automatically calculated (+2 months from Last Service Date).</p>
                  </div>
                </div>
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
                Delete Device
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
                form="device-form"
                className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium shadow-md shadow-slate-200 transition-all"
              >
                {initialData ? 'Save Changes' : 'Register Device'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditDeviceDialog;
