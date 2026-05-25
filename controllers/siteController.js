import Site from '../models/Site.js';
import Telemetry from '../models/Telemetry.js';
import Alarm from '../models/Alarm.js';
import MaintenanceLog from '../models/MaintenanceLog.js';

// 1. Ingest Telemetry Metrics & Run Anomaly Engine
exports.ingestTelemetry = async (req, res) => {
  try {
    const { siteId, metrics } = req.body;
    const timestamp = new Date();

    // Fetch the previous entry to compare data states (e.g., fuel monitoring)
    const lastReading = await Telemetry.findOne({ siteId }).sort({ timestamp: -1 });
    
    // Write new entry into the MongoDB Time Series collection
    await Telemetry.create({ siteId, timestamp, metrics });

    if (lastReading) {
      const fuelDrop = lastReading.metrics.fuel.liters - metrics.fuel.liters;
      const isGenRunning = metrics.generator.running;

      // Anomaly Check: Fuel drops more than 15L while the Generator is OFF
      if (fuelDrop > 15 && !isGenRunning) {
        await Alarm.create({ 
          siteId, 
          alarmType: 'FUEL_THEFT', 
          severity: 'CRITICAL' 
        });
      }
    }

    // Set or refresh site status to ONLINE
    await Site.findOneAndUpdate({ siteId }, { status: 'ONLINE' }, { upsert: true });
    
    res.status(201).json({ success: true, message: "Metrics recorded successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 2. Log Physical Site Maintenance and Upload Cloudinary Evidence Image
exports.logMaintenance = async (req, res) => {
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
exports.getActiveAlarms = async (req, res) => {
  try {
    const activeAlarms = await Alarm.find({ isCleared: false });
    res.status(200).json({ success: true, data: activeAlarms });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};