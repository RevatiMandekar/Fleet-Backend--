import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';

// Get all trips with population
export const getAllTrips = async (req, res) => {
  try {
    const { status, driverId, vehicleId, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (driverId) filter.driverId = driverId;
    if (vehicleId) filter.vehicleId = vehicleId;
    
    const trips = await Trip.find(filter)
      .populate('vehicleId', 'vehicleNumber type status')
      .populate('driverId', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Trip.countDocuments(filter);
    
    res.json({
      trips,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get trip by ID with full population
export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicleId', 'vehicleNumber type status assignedDriver')
      .populate('driverId', 'name email role')
      .populate('createdBy', 'name email role');
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new trip
export const createTrip = async (req, res) => {
  try {
    const { 
      vehicleId, 
      driverId, 
      origin, 
      destination, 
      startTime, 
      endTime,
      distance,
      fuelConsumed,
      notes 
    } = req.body;
    
    // Validate required fields
    if (!vehicleId || !driverId || !origin || !destination || !startTime) {
      return res.status(400).json({ 
        message: 'Vehicle ID, Driver ID, origin, destination, and start time are required' 
      });
    }
    
    // Check if vehicle exists and is available
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    if (vehicle.status === 'maintenance') {
      return res.status(400).json({ message: 'Vehicle is under maintenance and cannot be assigned' });
    }
    
    // Check if driver exists and is a driver
    const driver = await User.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    if (driver.role !== 'driver') {
      return res.status(400).json({ message: 'User must be a driver to be assigned to trips' });
    }
    
    // Check for overlapping trips for the same vehicle
    const overlappingTrip = await Trip.findOne({
      vehicleId,
      status: { $in: ['scheduled', 'in_progress'] },
      $or: [
        {
          startTime: { $lte: new Date(startTime) },
          endTime: { $gte: new Date(startTime) }
        },
        {
          startTime: { $lte: endTime ? new Date(endTime) : new Date(startTime) },
          endTime: { $gte: endTime ? new Date(endTime) : new Date(startTime) }
        }
      ]
    });
    
    if (overlappingTrip) {
      return res.status(400).json({ 
        message: 'Vehicle is already assigned to another trip during this time period' 
      });
    }
    
    const trip = await Trip.create({
      vehicleId,
      driverId,
      origin,
      destination,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : undefined,
      distance,
      fuelConsumed,
      notes,
      createdBy: req.user.id
    });
    
    // Update vehicle status to assigned if not already
    if (vehicle.status === 'available') {
      await Vehicle.findByIdAndUpdate(vehicleId, { 
        status: 'assigned',
        assignedDriver: driverId 
      });
    }
    
    const populatedTrip = await Trip.findById(trip._id)
      .populate('vehicleId', 'vehicleNumber type status')
      .populate('driverId', 'name email role')
      .populate('createdBy', 'name email role');
    
    res.status(201).json({
      message: 'Trip created successfully',
      trip: populatedTrip
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update trip
export const updateTrip = async (req, res) => {
  try {
    const { 
      vehicleId, 
      driverId, 
      origin, 
      destination, 
      status, 
      startTime, 
      endTime,
      distance,
      fuelConsumed,
      notes 
    } = req.body;
    
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Only allow updates to scheduled trips or in_progress trips
    if (trip.status === 'completed' || trip.status === 'cancelled') {
      return res.status(400).json({ 
        message: 'Cannot update completed or cancelled trips' 
      });
    }
    
    const updateData = {};
    if (vehicleId) updateData.vehicleId = vehicleId;
    if (driverId) updateData.driverId = driverId;
    if (origin) updateData.origin = origin;
    if (destination) updateData.destination = destination;
    if (status) updateData.status = status;
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);
    if (distance !== undefined) updateData.distance = distance;
    if (fuelConsumed !== undefined) updateData.fuelConsumed = fuelConsumed;
    if (notes !== undefined) updateData.notes = notes;
    
    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('vehicleId', 'vehicleNumber type status')
     .populate('driverId', 'name email role')
     .populate('createdBy', 'name email role');
    
    res.json({
      message: 'Trip updated successfully',
      trip: updatedTrip
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete trip
export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Only allow deletion of scheduled trips
    if (trip.status !== 'scheduled') {
      return res.status(400).json({ 
        message: 'Only scheduled trips can be deleted' 
      });
    }
    
    await Trip.findByIdAndDelete(req.params.id);
    
    // Update vehicle status back to available if no other trips
    const otherTrips = await Trip.findOne({
      vehicleId: trip.vehicleId,
      status: { $in: ['scheduled', 'in_progress'] }
    });
    
    if (!otherTrips) {
      await Vehicle.findByIdAndUpdate(trip.vehicleId, { 
        status: 'available',
        assignedDriver: null 
      });
    }
    
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Start trip
export const startTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    if (trip.status !== 'scheduled') {
      return res.status(400).json({ 
        message: 'Only scheduled trips can be started' 
      });
    }
    
    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'in_progress',
        startTime: new Date() // Update actual start time
      },
      { new: true, runValidators: true }
    ).populate('vehicleId', 'vehicleNumber type status')
     .populate('driverId', 'name email role')
     .populate('createdBy', 'name email role');
    
    res.json({
      message: 'Trip started successfully',
      trip: updatedTrip
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Complete trip
export const completeTrip = async (req, res) => {
  try {
    const { distance, fuelConsumed, notes } = req.body;
    
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    if (trip.status !== 'in_progress') {
      return res.status(400).json({ 
        message: 'Only in-progress trips can be completed' 
      });
    }
    
    const updateData = {
      status: 'completed',
      endTime: new Date()
    };
    
    if (distance !== undefined) updateData.distance = distance;
    if (fuelConsumed !== undefined) updateData.fuelConsumed = fuelConsumed;
    if (notes !== undefined) updateData.notes = notes;
    
    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('vehicleId', 'vehicleNumber type status')
     .populate('driverId', 'name email role')
     .populate('createdBy', 'name email role');
    
    // Check if vehicle has other trips, if not, make it available
    const otherTrips = await Trip.findOne({
      vehicleId: trip.vehicleId,
      status: { $in: ['scheduled', 'in_progress'] }
    });
    
    if (!otherTrips) {
      await Vehicle.findByIdAndUpdate(trip.vehicleId, { 
        status: 'available',
        assignedDriver: null 
      });
    }
    
    res.json({
      message: 'Trip completed successfully',
      trip: updatedTrip
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel trip
export const cancelTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    if (trip.status === 'completed') {
      return res.status(400).json({ 
        message: 'Cannot cancel completed trips' 
      });
    }
    
    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true, runValidators: true }
    ).populate('vehicleId', 'vehicleNumber type status')
     .populate('driverId', 'name email role')
     .populate('createdBy', 'name email role');
    
    // Check if vehicle has other trips, if not, make it available
    const otherTrips = await Trip.findOne({
      vehicleId: trip.vehicleId,
      status: { $in: ['scheduled', 'in_progress'] }
    });
    
    if (!otherTrips) {
      await Vehicle.findByIdAndUpdate(trip.vehicleId, { 
        status: 'available',
        assignedDriver: null 
      });
    }
    
    res.json({
      message: 'Trip cancelled successfully',
      trip: updatedTrip
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get trips by driver
export const getTripsByDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { driverId };
    if (status) filter.status = status;
    
    const trips = await Trip.find(filter)
      .populate('vehicleId', 'vehicleNumber type status')
      .populate('createdBy', 'name email role')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Trip.countDocuments(filter);
    
    res.json({
      trips,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get trips by vehicle
export const getTripsByVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { vehicleId };
    if (status) filter.status = status;
    
    const trips = await Trip.find(filter)
      .populate('driverId', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Trip.countDocuments(filter);
    
    res.json({
      trips,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
