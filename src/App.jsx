import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Records from './pages/Records';
import EdgeDevices from './pages/EdgeDevices';
import NotifyAlerts from './pages/NotifyAlerts';
import CommunityDirectory from './pages/CommunityDirectory';
import './App.css';
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="records" element={<Records />} />
          <Route path="edge-devices" element={<EdgeDevices />} />
          <Route path="notify-alerts" element={<NotifyAlerts />} />
          <Route path="directory" element={<CommunityDirectory />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
