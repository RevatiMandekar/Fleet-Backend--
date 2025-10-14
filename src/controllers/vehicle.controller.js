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
    const { vehicleNumber, type, status, assignedDriver } = req.body;

    if (!vehicleNumber || !type) {
      return res.status(400).json({ message: 'Vehicle number and type are required' });
    }

    const vehicle = await Vehicle.create({
      vehicleNumber,
      type,
      status: status || 'available',
      assignedDriver: assignedDriver || null
    });

    res.status(201).json({
      message: 'Vehicle created successfully',
      vehicle
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Vehicle number already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update vehicle
export const updateVehicle = async (req, res) => {
  try {
    const { vehicleNumber, type, status, assignedDriver } = req.body;
    
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const updateData = {};
    if (vehicleNumber) updateData.vehicleNumber = vehicleNumber;
    if (type) updateData.type = type;
    if (status) updateData.status = status;
    if (assignedDriver !== undefined) updateData.assignedDriver = assignedDriver;

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedDriver', 'name email');

    res.json({
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Vehicle number already exists' });
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
