import mongoose from 'mongoose';

const AlarmSchema = new mongoose.Schema({
  siteId: { 
    type: String, 
    required: true, 
    index: true 
  },
  alarmType: { 
    type: String, 
    enum: ['FUEL_THEFT', 'GRID_OUTAGE', 'LOW_BATTERY', 'COMM_LOSS'],
    required: true
  },
  severity: { 
    type: String, 
    enum: ['CRITICAL', 'MAJOR', 'WARNING'], 
    required: true 
  },
  isCleared: { 
    type: Boolean, 
    default: false 
  },
  triggeredAt: { 
    type: Date, 
    default: Date.now 
  },
  clearedAt: { 
    type: Date 
  }
});

export default mongoose.model('Alarm', AlarmSchema);