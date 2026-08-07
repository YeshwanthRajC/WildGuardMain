import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Records from './pages/Records';
import EdgeDevices from './pages/EdgeDevices';
import './App.css';
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="records" element={<Records />} />
          <Route path="edge-devices" element={<EdgeDevices />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
