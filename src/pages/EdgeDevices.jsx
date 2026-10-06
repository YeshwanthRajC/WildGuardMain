import React, { useState, useEffect, useMemo } from 'react';
import { edgeDeviceService } from '../services/api';
import EditDeviceDialog from '../components/Devices/EditDeviceDialog';
import { Plus, Search, HardDrive, ChevronLeft, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const getStatusBadge = (status) => {
  if (status === 'Online' || status === 'Serviced') return 'bg-green-100 text-green-800';
  if (status === 'Maintenance Overdue') return 'bg-red-100 text-red-800 border border-red-200';
  if (status === 'Offline') return 'bg-gray-100 text-gray-800';
  return 'bg-yellow-100 text-yellow-800'; // Unknown or Maintenance Due
};

const EdgeDevices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const data = await edgeDeviceService.getAllDevices();
      
      // On frontend, dynamically flag overdue if not already
      const today = new Date().toISOString().split('T')[0];
      const processed = data.map(device => {
        if (device.next_service_date && device.next_service_date <= today && device.status !== 'Maintenance Overdue') {
          return { ...device, status: 'Maintenance Overdue' };
        }
        return device;
      });
      
      setDevices(processed);
    } catch (error) {
      console.error('Failed to fetch edge devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = useMemo(() => {
    let result = devices;
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(d => 
        (d.device_name && d.device_name.toLowerCase().includes(lowerSearch)) ||
        (d.location && d.location.toLowerCase().includes(lowerSearch)) ||
        (d.mqtt_topic && d.mqtt_topic.toLowerCase().includes(lowerSearch))
      );
    }
    return result;
  }, [devices, searchTerm]);

  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
  const paginatedDevices = filteredDevices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddClick = () => {
    setSelectedDevice(null);
    setDialogOpen(true);
  };

  const handleRowClick = (device) => {
    setSelectedDevice(device);
    setDialogOpen(true);
  };

  const handleDialogSubmit = async (formData) => {
    try {
      if (selectedDevice) {
        await edgeDeviceService.updateDevice(selectedDevice.id, formData);
      } else {
        await edgeDeviceService.createDevice(formData);
      }
      await fetchDevices();
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to save edge device:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this edge device?')) {
      try {
        await edgeDeviceService.deleteDevice(id);
        await fetchDevices();
        setDialogOpen(false);
      } catch (error) {
        console.error('Failed to delete edge device:', error);
      }
    }
  };

  return (
    <div className="h-full w-full max-w-7xl mx-auto p-4 sm:p-8 flex flex-col overflow-hidden">
      
      <PageHeader
        icon={HardDrive}
        title="Edge Devices"
        description="Manage Edge AI nodes, MQTT configurations, and maintenance schedules."
        stats={[
          { label: 'Total devices', value: devices.length },
          { label: 'Online', value: devices.filter((d) => d.status === 'Online').length },
        ]}
      >
        <Button onClick={handleAddClick} className="bg-white text-emerald-900 hover:bg-emerald-50">
          <Plus className="w-4 h-4" />
          Register Device
        </Button>
      </PageHeader>

      {/* Controls */}
      <div className="flex mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by device name, location, or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 rounded-xl bg-white pl-10 shadow-sm"
          />
        </div>
      </div>

      {/* Table Container */}
      <Card className="flex-1 gap-0 overflow-hidden rounded-2xl p-0 shadow-sm flex flex-col min-h-0">
        {loading ? (
          <div className="flex-1 space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredDevices.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <HardDrive className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-lg font-medium text-gray-600">No edge devices registered</p>
            <p className="text-sm">Click "Register Device" to add a new node to the network.</p>
          </div>
        ) : (
          <>
            <div className="overflow-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Device</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">MQTT Configuration</th>
                    <th className="px-6 py-4">Maintenance</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedDevices.map((device) => {
                    const isOverdue = device.status === 'Maintenance Overdue';
                    return (
                      <tr 
                        key={device.id} 
                        onClick={() => handleRowClick(device)}
                        className="hover:bg-slate-50/50 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{device.device_name}</p>
                          <p className="text-xs text-gray-400 truncate max-w-37.5 mt-1" title={device.id}>{device.id}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {device.location}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded inline-block text-slate-700">
                            {device.mqtt_broker}:{device.mqtt_port}
                          </p>
                          <p className="text-xs text-gray-500 mt-2 flex items-center">
                            <span className="font-semibold mr-1">Topic:</span>
                            <span className="truncate max-w-50" title={device.mqtt_topic}>{device.mqtt_topic}</span>
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <div className="text-sm flex items-center text-gray-600">
                              <CheckCircle className="w-3.5 h-3.5 mr-1 text-green-500" />
                              <span className="text-xs">Last: {device.last_service_date || 'N/A'}</span>
                            </div>
                            <div className={`text-sm flex items-center font-medium ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                              <Clock className={`w-3.5 h-3.5 mr-1 ${isOverdue ? 'text-red-600' : 'text-gray-400'}`} />
                              <span className="text-xs">Next: {device.next_service_date || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`font-bold ${getStatusBadge(device.status)}`}>
                            {device.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between mt-auto">
              <span className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredDevices.length)} of {filteredDevices.length} devices
              </span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded bg-white border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-1 rounded bg-white border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      <EditDeviceDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        onDelete={handleDelete}
        initialData={selectedDevice}
      />
    </div>
  );
};

export default EdgeDevices;
