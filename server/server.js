import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import hotspotRoutes from './routes/hotspots.js';
import conflictCaseRoutes from './routes/conflictCases.js';
import manualRecordRoutes from './routes/manualRecords.js';
import edgeDeviceRoutes from './routes/edgeDevices.js';
import notificationRoutes from './routes/notifications.js';
import newsRoutes from './routes/news.js';
import contactRoutes from './routes/contacts.js';
import { initMQTT } from './services/mqttService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/hotspots', hotspotRoutes);
app.use('/api/conflict-cases', conflictCaseRoutes);
app.use('/api/manual-records', manualRecordRoutes);
app.use('/api/edge-devices', edgeDeviceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/contacts', contactRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Elephant Intrusion Alert System API is running.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Initialize MQTT connections in the background
    initMQTT();
  });
}

export default app;

