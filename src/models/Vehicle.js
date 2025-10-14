import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  status: { type: String, enum: ['available', 'assigned', 'maintenance'], default: 'available' },
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});

export default mongoose.model('Vehicle', vehicleSchema);
