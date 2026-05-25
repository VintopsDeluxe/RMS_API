import mongoose from 'mongoose';

const MaintenanceLogSchema = new mongoose.Schema({
  siteId: { 
    type: String, 
    required: true,
    index: true
  },
  engineerName: { 
    type: String, 
    required: true 
  },
  notes: { 
    type: String, 
    required: true 
  },
  evidenceImage: { 
    type: String // Holds the secure text URL link returned from Cloudinary
  }
}, { timestamps: true });

export default mongoose.model('MaintenanceLog', MaintenanceLogSchema);