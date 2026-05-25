import mongoose from 'mongoose';

const TelemetrySchema = new mongoose.Schema({
  timestamp: { 
    type: Date, 
    required: true 
  },
  siteId: { 
    type: String, 
    required: true 
  }, // Used as the metaField for bucketing datasets
  metrics: {
    grid: { 
      v1: Number, 
      v2: Number, 
      v3: Number, 
      available: Boolean 
    },
    generator: { 
      running: Boolean, 
      runHours: Number, 
      batteryVoltage: Number 
    },
    fuel: { 
      liters: Number, 
      percentage: Number 
    },
    dcSystem: { 
      batteryVoltage: Number, 
      soc: Number, 
      siteLoadAmps: Number 
    },
    env: { 
      shelterTemp: Number 
    }
  }
});

// Explicitly compile as a native MongoDB Time Series Collection
export default mongoose.model('Telemetry', TelemetrySchema, 'telemetry', {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'siteId',
    granularity: 'minutes'
  }
});