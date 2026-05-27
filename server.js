import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cron from 'node-cron';
import siteRoutes from './routes/siteRoutes.js';
import Site from './models/Site.js';
import Telemetry from './models/Telemetry.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Main Modular Route Linkage
app.use('/api/v1', siteRoutes);

// A simple welcoming route for the root URL
app.get('/', (req, res) => {
  res.status(200).json({
    message: "Welcome to the RMS Core Infrastructure API!",
    status: "Healthy & Online"
  });
});

// AUTOMATED CRON JOB: Scan for Lost Communication every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log("Running background automated communication health check...");
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeSites = await Site.find({ status: 'ONLINE' });

    for (let site of activeSites) {
      // Find the latest telemetry log entry for this specific site
      const latestLog = await Telemetry.findOne({ siteId: site.siteId }).sort({ timestamp: -1 });
      
      if (!latestLog || latestLog.timestamp < fiveMinutesAgo) {
        site.status = 'COMM_LOSS';
        await site.save();
        console.log(`[ALERT] Communication loss detected for Site ID: ${site.siteId}. Status updated.`);
      }
    }
  } catch (cronError) {
    // Safely catch errors here so the backend application doesn't crash
    console.error("CRITICAL BACKGROUND ENGINE ERROR:", cronError.message);
  }
});


// Database Setup and Bootstrapping Server
mongoose.connect(process.env.LIVE_URL)
  .then(() => {
    console.log("Connected securely to IHS Remote Database Container.");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
  })
  .catch(err => console.error("Database connection failure:", err));