import axios from 'axios';
import { loadingStore } from '../utils/loadingStore';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Show the centered loader for every request, except silent background notification checks.
const isSilent = (config) =>
  config.url?.startsWith('/news') ||
  (config.url?.startsWith('/notifications') &&
  (config.method === 'get' || config.url.endsWith('/check-maintenance')));

api.interceptors.request.use((config) => {
  if (!isSilent(config)) loadingStore.start();
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (!isSilent(response.config)) loadingStore.stop();
    return response;
  },
  (error) => {
    if (error.config && !isSilent(error.config)) loadingStore.stop();
    return Promise.reject(error);
  }
);

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

export const newsService = {
  getWildlifeNews: async () => {
    const response = await api.get('/news');
    return response.data;
  }
};

export const contactService = {
  getGroups: async () => {
    const response = await api.get('/contacts/groups');
    return response.data;
  },
  createGroup: async (groupData) => {
    const response = await api.post('/contacts/groups', groupData);
    return response.data;
  },
  deleteGroup: async (id) => {
    const response = await api.delete(`/contacts/groups/${id}`);
    return response.data;
  },
  addMember: async (groupId, memberData) => {
    const response = await api.post(`/contacts/groups/${groupId}/members`, memberData);
    return response.data;
  },
  updateMember: async (id, memberData) => {
    const response = await api.put(`/contacts/members/${id}`, memberData);
    return response.data;
  },
  deleteMember: async (id) => {
    const response = await api.delete(`/contacts/members/${id}`);
    return response.data;
  }
};

export default api;
