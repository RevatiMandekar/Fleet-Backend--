import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: { 
    type: String, 
    required: true, 
    trim: true,
    uppercase: true
  },
  type: { 
    type: String, 
    required: true,
    enum: ['sedan', 'suv', 'truck', 'van', 'bus', 'motorcycle'],
    trim: true
  },
  make: { 
    type: String, 
    required: true,
    trim: true
  },
  model: { 
    type: String, 
    required: true,
    trim: true
  },
  year: { 
    type: Number, 
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  color: { 
    type: String, 
    required: true,
    trim: true
  },
  licensePlate: { 
    type: String, 
    required: true, 
    trim: true,
    uppercase: true
  },
  vin: { 
    type: String, 
    required: true, 
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^[A-HJ-NPR-Z0-9]{17}$/.test(v);
      },
      message: 'Invalid VIN format'
    }
  },
  status: { 
    type: String, 
    enum: ['available', 'assigned', 'maintenance', 'out_of_service'], 
    default: 'available' 
  },
  assignedDriver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  fuelType: {
    type: String,
    enum: ['gasoline', 'diesel', 'electric', 'hybrid', 'lpg'],
    default: 'gasoline'
  },
  fuelCapacity: {
    type: Number,
    min: 0
  },
  mileage: {
    type: Number,
    min: 0,
    default: 0
  },
  lastServiceDate: {
    type: Date
  },
  nextServiceDue: {
    type: Date
  },
  insuranceExpiry: {
    type: Date
  },
  registrationExpiry: {
    type: Date
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

// Indexes for better query performance
// Unique indexes for fields that must be unique
vehicleSchema.index({ vehicleNumber: 1 }, { unique: true });
vehicleSchema.index({ licensePlate: 1 }, { unique: true });
vehicleSchema.index({ vin: 1 }, { unique: true });

// Compound and additional indexes for query optimization
vehicleSchema.index({ status: 1, type: 1 }); // Compound index for status + type queries
vehicleSchema.index({ assignedDriver: 1, status: 1 }); // Compound index for driver assignments
vehicleSchema.index({ nextServiceDue: 1 }); // Index for maintenance queries
vehicleSchema.index({ insuranceExpiry: 1 }); // Index for insurance queries
vehicleSchema.index({ registrationExpiry: 1 }); // Index for registration queries
vehicleSchema.index({ createdAt: -1 }); // Index for sorting by creation date

// Virtual for vehicle age
vehicleSchema.virtual('age').get(function() {
  return new Date().getFullYear() - this.year;
});

// Virtual for days since last service
vehicleSchema.virtual('daysSinceLastService').get(function() {
  if (this.lastServiceDate) {
    return Math.floor((new Date() - this.lastServiceDate) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for days until next service
vehicleSchema.virtual('daysUntilNextService').get(function() {
  if (this.nextServiceDue) {
    return Math.floor((this.nextServiceDue - new Date()) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Ensure virtual fields are serialized
vehicleSchema.set('toJSON', { virtuals: true });

// Pre-save middleware
vehicleSchema.pre('save', function(next) {
  // Convert strings to uppercase
  if (this.vehicleNumber) this.vehicleNumber = this.vehicleNumber.toUpperCase();
  if (this.licensePlate) this.licensePlate = this.licensePlate.toUpperCase();
  if (this.vin) this.vin = this.vin.toUpperCase();
  
  next();
});

export default mongoose.model('Vehicle', vehicleSchema);
