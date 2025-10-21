import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  vehicleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle', 
    required: true 
  },
  driverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  origin: { 
    type: String, 
    required: true,
    trim: true 
  },
  destination: { 
    type: String, 
    required: true,
    trim: true 
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'], 
    default: 'scheduled' 
  },
  startTime: { 
    type: Date, 
    required: true 
  },
  endTime: { 
    type: Date 
  },
  distance: { 
    type: Number, 
    min: 0 
  },
  fuelConsumed: { 
    type: Number, 
    min: 0 
  },
  notes: { 
    type: String, 
    trim: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, {
  timestamps: true
});

// Index for better query performance
tripSchema.index({ vehicleId: 1, status: 1 });
tripSchema.index({ driverId: 1, status: 1 });
tripSchema.index({ startTime: 1 });

// Virtual for trip duration
tripSchema.virtual('duration').get(function() {
  if (this.startTime && this.endTime) {
    return this.endTime - this.startTime;
  }
  return null;
});

// Ensure virtual fields are serialized
tripSchema.set('toJSON', { virtuals: true });

// Pre-save middleware to validate trip logic
tripSchema.pre('save', function(next) {
  // If trip is completed, endTime should be set
  if (this.status === 'completed' && !this.endTime) {
    this.endTime = new Date();
  }
  
  // If trip is in progress, endTime should not be set
  if (this.status === 'in_progress' && this.endTime) {
    this.endTime = undefined;
  }
  
  // End time should be after start time
  if (this.endTime && this.startTime && this.endTime <= this.startTime) {
    return next(new Error('End time must be after start time'));
  }
  
  next();
});

export default mongoose.model('Trip', tripSchema);
