import mongoose from 'mongoose';

const SiteSchema = new mongoose.Schema({
  siteId: { 
    type: String, 
    required: true, 
    unique: true 
  }, // e.g., "IHS_LOS_042"
  region: { 
    type: String, 
    required: false
  }, // e.g., "Lagos", "Kano", "Port Harcourt"
  coordinates: {
    lat: Number,
    lng: Number
  },
  assets: {
    generatorModel: String,
    fuelTankCapacity: Number,    // Volumetric capacity in Liters
    batteryBankCapacity: Number, // Rated capacity in Ah
    solarMaxYield: Number        // Peak capacity in kW
  },
  status: { 
    type: String, 
    enum: ['ONLINE', 'COMM_LOSS', 'SITE_DOWN'], 
    default: 'ONLINE' 
  }
}, { timestamps: true });

export default mongoose.model('Site', SiteSchema);