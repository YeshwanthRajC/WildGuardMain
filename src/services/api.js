import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend base URL
  headers: {
    'Content-Type': 'application/json'
  }
});

export const hotspotService = {
  getAllHotspots: async () => {
    const response = await api.get('/hotspots');
    return response.data;
  },
  createHotspot: async (hotspotData) => {
    const response = await api.post('/hotspots', hotspotData);
    return response.data;
  },
  updateHotspotAnimals: async (id, animals) => {
    const response = await api.put(`/hotspots/${id}`, { animals });
    return response.data;
  },
  deleteHotspot: async (id) => {
    const response = await api.delete(`/hotspots/${id}`);
    return response.data;
  }
};

export const conflictCaseService = {
  getAllConflictCases: async () => {
    const response = await api.get('/conflict-cases');
    return response.data;
  },
  createConflictCase: async (caseData) => {
    const response = await api.post('/conflict-cases', caseData);
    return response.data;
  },
  updateConflictCase: async (id, caseData) => {
    const response = await api.put(`/conflict-cases/${id}`, caseData);
    return response.data;
  },
  deleteConflictCase: async (id) => {
    const response = await api.delete(`/conflict-cases/${id}`);
    return response.data;
  }
};

export const manualRecordService = {
  getAllManualRecords: async () => {
    const response = await api.get('/manual-records');
    return response.data;
  },
  createManualRecord: async (recordData) => {
    const response = await api.post('/manual-records', recordData);
    return response.data;
  },
  updateManualRecord: async (id, recordData) => {
    const response = await api.put(`/manual-records/${id}`, recordData);
    return response.data;
  },
  deleteManualRecord: async (id) => {
    const response = await api.delete(`/manual-records/${id}`);
    return response.data;
  }
};

export const edgeDeviceService = {
  getAllDevices: async () => {
    const response = await api.get('/edge-devices');
    return response.data;
  },
  createDevice: async (deviceData) => {
    const response = await api.post('/edge-devices', deviceData);
    return response.data;
  },
  updateDevice: async (id, deviceData) => {
    const response = await api.put(`/edge-devices/${id}`, deviceData);
    return response.data;
  },
  deleteDevice: async (id) => {
    const response = await api.delete(`/edge-devices/${id}`);
    return response.data;
  }
};

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
  checkMaintenance: async () => {
    const response = await api.post('/notifications/check-maintenance');
    return response.data;
  }
};

export default api;
