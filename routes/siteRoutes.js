import express from 'express';
import Site from '../models/Site.js';
import Telemetry from '../models/Telemetry.js';
import Alarm from '../models/Alarm.js';
import MaintenanceLog from '../models/MaintenanceLog.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// 1. Ingest Telemetry Metrics & Run Anomaly Engine
export const ingestTelemetry = async (req, res) => {
  try {
    const { siteId, metrics } = req.body;
    const timestamp = new Date();

    const lastReading = await Telemetry.findOne({ siteId }).sort({ timestamp: -1 });
    await Telemetry.create({ siteId, timestamp, metrics });

    if (lastReading) {
      const fuelDrop = lastReading.metrics.fuel.liters - metrics.fuel.liters;
      const isGenRunning = metrics.generator.running;

      if (fuelDrop > 15 && !isGenRunning) {
        await Alarm.create({ 
          siteId, 
          alarmType: 'FUEL_THEFT', 
          severity: 'CRITICAL' 
        });
      }
    }

    await Site.findOneAndUpdate({ siteId }, { status: 'ONLINE' }, { upsert: true });
    res.status(201).json({ success: true, message: "Metrics recorded successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 2. Log Physical Site Maintenance and Upload Cloudinary Evidence Image
export const logMaintenance = async (req, res) => {
  try {
    const { siteId, engineerName, notes } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    const log = await MaintenanceLog.create({ 
      siteId, 
      engineerName, 
      notes, 
      evidenceImage: imageUrl 
    });
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 3. Retrieve All Active (Uncleared) Site Alarms
export const getActiveAlarms = async (req, res) => {
  try {
    const activeAlarms = await Alarm.find({ isCleared: false });
    res.status(200).json({ success: true, data: activeAlarms });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// --- ROUTE DEFINITIONS ---
router.post('/telemetry/ingest', ingestTelemetry);
router.post('/maintenance/log',upload.single('image'), logMaintenance); // Note: Add your multer upload middleware here if needed
router.get('/alarms/active', getActiveAlarms);

// Export the router as the default export
export default router;
