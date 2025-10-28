import Vehicle from '../models/Vehicle.js';

// Get all vehicles
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('assignedDriver', 'name email');
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get vehicle by ID
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('assignedDriver', 'name email');
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new vehicle
export const createVehicle = async (req, res) => {
  try {
    const { 
      vehicleNumber, 
      type, 
      make, 
      model, 
      year, 
      color, 
      licensePlate, 
      vin,
      fuelType,
      fuelCapacity,
      mileage,
      lastServiceDate,
      nextServiceDue,
      insuranceExpiry,
      registrationExpiry,
      notes,
      status, 
      assignedDriver 
    } = req.body;

    // Validate required fields
    const requiredFields = ['vehicleNumber', 'type', 'make', 'model', 'year', 'color', 'licensePlate', 'vin'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    const vehicle = await Vehicle.create({
      vehicleNumber,
      type,
      make,
      model,
      year,
      color,
      licensePlate,
      vin,
      fuelType: fuelType || 'gasoline',
      fuelCapacity,
      mileage: mileage || 0,
      lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : undefined,
      nextServiceDue: nextServiceDue ? new Date(nextServiceDue) : undefined,
      insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : undefined,
      registrationExpiry: registrationExpiry ? new Date(registrationExpiry) : undefined,
      notes,
      status: status || 'available',
      assignedDriver: assignedDriver || null,
      createdBy: req.user.id
    });

    const populatedVehicle = await Vehicle.findById(vehicle._id)
      .populate('assignedDriver', 'name email role')
      .populate('createdBy', 'name email role');

    res.status(201).json({
      message: 'Vehicle created successfully',
      vehicle: populatedVehicle
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field} already exists` 
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update vehicle
export const updateVehicle = async (req, res) => {
  try {
    const { 
      vehicleNumber, 
      type, 
      make, 
      model, 
      year, 
      color, 
      licensePlate, 
      vin,
      fuelType,
      fuelCapacity,
      mileage,
      lastServiceDate,
      nextServiceDue,
      insuranceExpiry,
      registrationExpiry,
      notes,
      status, 
      assignedDriver 
    } = req.body;
    
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const updateData = {};
    if (vehicleNumber) updateData.vehicleNumber = vehicleNumber;
    if (type) updateData.type = type;
    if (make) updateData.make = make;
    if (model) updateData.model = model;
    if (year) updateData.year = year;
    if (color) updateData.color = color;
    if (licensePlate) updateData.licensePlate = licensePlate;
    if (vin) updateData.vin = vin;
    if (fuelType) updateData.fuelType = fuelType;
    if (fuelCapacity !== undefined) updateData.fuelCapacity = fuelCapacity;
    if (mileage !== undefined) updateData.mileage = mileage;
    if (lastServiceDate) updateData.lastServiceDate = new Date(lastServiceDate);
    if (nextServiceDue) updateData.nextServiceDue = new Date(nextServiceDue);
    if (insuranceExpiry) updateData.insuranceExpiry = new Date(insuranceExpiry);
    if (registrationExpiry) updateData.registrationExpiry = new Date(registrationExpiry);
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;
    if (assignedDriver !== undefined) updateData.assignedDriver = assignedDriver;

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedDriver', 'name email role')
     .populate('createdBy', 'name email role');

    res.json({
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field} already exists` 
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete vehicle
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
  
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Assign vehicle to driver
export const assignVehicle = async (req, res) => {
  try {
    const { driverId } = req.body;
    
    if (!driverId) {
      return res.status(400).json({ message: 'Driver ID is required' });
    }

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.status === 'assigned') {
      return res.status(400).json({ message: 'Vehicle is already assigned' });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { 
        assignedDriver: driverId, 
        status: 'assigned' 
      },
      { new: true, runValidators: true }
    ).populate('assignedDriver', 'name email');

    res.json({
      message: 'Vehicle assigned successfully',
      vehicle: updatedVehicle
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Unassign vehicle from driver
export const unassignVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { 
        assignedDriver: null, 
        status: 'available' 
      },
      { new: true, runValidators: true }
    ).populate('assignedDriver', 'name email');

    res.json({
      message: 'Vehicle unassigned successfully',
      vehicle: updatedVehicle
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get vehicles available for assignment
export const getAvailableVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ status: 'available' })
      .populate('assignedDriver', 'name email');
    
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get vehicles by status
export const getVehiclesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!['available', 'assigned', 'maintenance'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const vehicles = await Vehicle.find({ status })
      .populate('assignedDriver', 'name email');
    
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get vehicle with trip history
export const getVehicleWithTrips = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('assignedDriver', 'name email role')
      .populate('createdBy', 'name email role');
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    // Import Trip model here to avoid circular dependency
    const Trip = (await import('../models/Trip.js')).default;
    
    const trips = await Trip.find({ vehicleId: req.params.id })
      .populate('driverId', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ startTime: -1 })
      .limit(10); // Last 10 trips
    
    res.json({
      vehicle,
      recentTrips: trips
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get fleet manager dashboard data
export const getFleetManagerDashboard = async (req, res) => {
  try {
    const Trip = (await import('../models/Trip.js')).default;
    const User = (await import('../models/User.js')).default;
    
    // Get vehicle statistics
    const totalVehicles = await Vehicle.countDocuments();
    const availableVehicles = await Vehicle.countDocuments({ status: 'available' });
    const assignedVehicles = await Vehicle.countDocuments({ status: 'assigned' });
    const maintenanceVehicles = await Vehicle.countDocuments({ status: 'maintenance' });
    
    // Get trip statistics
    const totalTrips = await Trip.countDocuments();
    const scheduledTrips = await Trip.countDocuments({ status: 'scheduled' });
    const inProgressTrips = await Trip.countDocuments({ status: 'in_progress' });
    const completedTrips = await Trip.countDocuments({ status: 'completed' });
    
    // Get driver statistics
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    const assignedDrivers = await Vehicle.countDocuments({ 
      assignedDriver: { $exists: true, $ne: null } 
    });
    
    // Get recent trips
    const recentTrips = await Trip.find()
      .populate('vehicleId', 'vehicleNumber type make model')
      .populate('driverId', 'name email')
      .populate('createdBy', 'name email')
      .sort({ startTime: -1 })
      .limit(5);
    
    // Get vehicles needing service
    const vehiclesNeedingService = await Vehicle.find({
      nextServiceDue: { $lte: new Date() }
    }).populate('assignedDriver', 'name email')
      .limit(5);
    
    // Get vehicles with expiring insurance/registration
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const vehiclesWithExpiringDocs = await Vehicle.find({
      $or: [
        { insuranceExpiry: { $lte: thirtyDaysFromNow } },
        { registrationExpiry: { $lte: thirtyDaysFromNow } }
      ]
    }).populate('assignedDriver', 'name email')
      .limit(5);
    
    res.json({
      statistics: {
        vehicles: {
          total: totalVehicles,
          available: availableVehicles,
          assigned: assignedVehicles,
          maintenance: maintenanceVehicles
        },
        trips: {
          total: totalTrips,
          scheduled: scheduledTrips,
          inProgress: inProgressTrips,
          completed: completedTrips
        },
        drivers: {
          total: totalDrivers,
          assigned: assignedDrivers
        }
      },
      recentTrips,
      vehiclesNeedingService,
      vehiclesWithExpiringDocs
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get driver with their assigned vehicle and trips
export const getDriverWithVehicleAndTrips = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const User = (await import('../models/User.js')).default;
    const Trip = (await import('../models/Trip.js')).default;
    
    // Get driver info
    const driver = await User.findById(driverId).select('-password');
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    if (driver.role !== 'driver') {
      return res.status(400).json({ message: 'User is not a driver' });
    }
    
    // Get assigned vehicle
    const assignedVehicle = await Vehicle.findOne({ assignedDriver: driverId })
      .populate('assignedDriver', 'name email role');
    
    // Get driver's trips
    const trips = await Trip.find({ driverId })
      .populate('vehicleId', 'vehicleNumber type make model')
      .populate('createdBy', 'name email role')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const totalTrips = await Trip.countDocuments({ driverId });
    
    res.json({
      driver,
      assignedVehicle,
      trips: {
        data: trips,
        totalPages: Math.ceil(totalTrips / limit),
        currentPage: page,
        total: totalTrips
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get vehicles by type with statistics
export const getVehiclesByTypeWithStats = async (req, res) => {
  try {
    const { type } = req.params;
    
    const vehicles = await Vehicle.find({ type })
      .populate('assignedDriver', 'name email role')
      .populate('createdBy', 'name email role');
    
    const Trip = (await import('../models/Trip.js')).default;
    
    // Get statistics for this vehicle type
    const vehicleIds = vehicles.map(v => v._id);
    const totalTrips = await Trip.countDocuments({ vehicleId: { $in: vehicleIds } });
    const completedTrips = await Trip.countDocuments({ 
      vehicleId: { $in: vehicleIds }, 
      status: 'completed' 
    });
    
    // Calculate average mileage for this type
    const avgMileage = vehicles.reduce((sum, v) => sum + (v.mileage || 0), 0) / vehicles.length;
    
    res.json({
      type,
      vehicles,
      statistics: {
        totalVehicles: vehicles.length,
        totalTrips,
        completedTrips,
        averageMileage: Math.round(avgMileage)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};