import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import { 
  sendMaintenanceAlertEmail, 
  sendOverdueTripAlertEmail,
  sendMaintenanceAlertEmailDev,
  sendOverdueTripAlertEmailDev
} from '../services/emailService.js';
import { emitToRole } from '../socket/socketHandlers.js';

// Check for overdue trips and send alerts
export const checkOverdueTrips = async () => {
  try {
    const currentTime = new Date();
    
    // Find overdue trips (scheduled but past start time)
    const overdueTrips = await Trip.find({
      status: 'scheduled',
      startTime: { $lt: currentTime }
    })
    .populate('vehicleId', 'vehicleNumber type status')
    .populate('driverId', 'name email')
    .populate('createdBy', 'name email');
    
    if (overdueTrips.length === 0) {
      console.log('✅ No overdue trips found');
      return;
    }
    
    console.log(`⚠️ Found ${overdueTrips.length} overdue trip(s)`);
    
    // Get fleet manager emails
    const fleetManagers = await User.find({ role: 'fleet_manager' }).select('email');
    const fleetManagerEmails = fleetManagers.map(fm => fm.email);
    
    if (fleetManagerEmails.length === 0) {
      console.log('⚠️ No fleet managers found to send alerts to');
      return;
    }
    
    // Send alerts for each overdue trip
    for (const trip of overdueTrips) {
      const emailSent = process.env.NODE_ENV === 'production'
        ? await sendOverdueTripAlertEmail(fleetManagerEmails, {
            origin: trip.origin,
            destination: trip.destination,
            startTime: trip.startTime,
            status: trip.status,
            driver: trip.driverId,
            vehicle: trip.vehicleId
          })
        : await sendOverdueTripAlertEmailDev(fleetManagerEmails, {
            origin: trip.origin,
            destination: trip.destination,
            startTime: trip.startTime,
            status: trip.status,
            driver: trip.driverId,
            vehicle: trip.vehicleId
          });
      
      // Emit Socket.IO alert
      emitToRole('fleet_manager', 'overdue_trip_alert', {
        tripId: trip._id,
        origin: trip.origin,
        destination: trip.destination,
        driver: trip.driverId,
        vehicle: trip.vehicleId,
        scheduledStart: trip.startTime,
        overdueBy: Math.round((currentTime - new Date(trip.startTime)) / (1000 * 60)),
        timestamp: new Date()
      });
      
      emitToRole('admin', 'overdue_trip_alert', {
        tripId: trip._id,
        origin: trip.origin,
        destination: trip.destination,
        driver: trip.driverId,
        vehicle: trip.vehicleId,
        scheduledStart: trip.startTime,
        overdueBy: Math.round((currentTime - new Date(trip.startTime)) / (1000 * 60)),
        timestamp: new Date()
      });
      
      console.log(`📧 Overdue trip alert sent for trip ${trip._id}: ${trip.origin} → ${trip.destination}`);
    }
    
  } catch (error) {
    console.error('Error checking overdue trips:', error);
  }
};

// Check for vehicles needing maintenance
export const checkMaintenanceAlerts = async () => {
  try {
    const currentDate = new Date();
    
    // Find vehicles with overdue maintenance
    const vehiclesNeedingMaintenance = await Vehicle.find({
      $or: [
        { nextServiceDue: { $lt: currentDate } },
        { insuranceExpiry: { $lt: currentDate } },
        { registrationExpiry: { $lt: currentDate } }
      ]
    }).populate('assignedDriver', 'name email');
    
    if (vehiclesNeedingMaintenance.length === 0) {
      console.log('✅ No vehicles need maintenance');
      return;
    }
    
    console.log(`⚠️ Found ${vehiclesNeedingMaintenance.length} vehicle(s) needing maintenance`);
    
    // Get fleet manager emails
    const fleetManagers = await User.find({ role: 'fleet_manager' }).select('email');
    const fleetManagerEmails = fleetManagers.map(fm => fm.email);
    
    if (fleetManagerEmails.length === 0) {
      console.log('⚠️ No fleet managers found to send alerts to');
      return;
    }
    
    // Send alerts for each vehicle
    for (const vehicle of vehiclesNeedingMaintenance) {
      let alertType = 'General Maintenance';
      let description = 'Vehicle requires maintenance attention';
      
      if (vehicle.nextServiceDue && vehicle.nextServiceDue < currentDate) {
        alertType = 'Service Overdue';
        description = `Service was due on ${vehicle.nextServiceDue.toLocaleDateString()}`;
      } else if (vehicle.insuranceExpiry && vehicle.insuranceExpiry < currentDate) {
        alertType = 'Insurance Expired';
        description = `Insurance expired on ${vehicle.insuranceExpiry.toLocaleDateString()}`;
      } else if (vehicle.registrationExpiry && vehicle.registrationExpiry < currentDate) {
        alertType = 'Registration Expired';
        description = `Registration expired on ${vehicle.registrationExpiry.toLocaleDateString()}`;
      }
      
      const emailSent = process.env.NODE_ENV === 'production'
        ? await sendMaintenanceAlertEmail(fleetManagerEmails, vehicle, alertType, description)
        : await sendMaintenanceAlertEmailDev(fleetManagerEmails, vehicle, alertType, description);
      
      // Emit Socket.IO alert
      emitToRole('fleet_manager', 'maintenance_alert', {
        vehicleId: vehicle._id,
        vehicleNumber: vehicle.vehicleNumber,
        vehicleType: vehicle.type,
        alertType,
        description,
        assignedDriver: vehicle.assignedDriver,
        timestamp: new Date()
      });
      
      emitToRole('admin', 'maintenance_alert', {
        vehicleId: vehicle._id,
        vehicleNumber: vehicle.vehicleNumber,
        vehicleType: vehicle.type,
        alertType,
        description,
        assignedDriver: vehicle.assignedDriver,
        timestamp: new Date()
      });
      
      console.log(`📧 Maintenance alert sent for vehicle ${vehicle.vehicleNumber}: ${alertType}`);
    }
    
  } catch (error) {
    console.error('Error checking maintenance alerts:', error);
  }
};

// Manual maintenance alert trigger
export const triggerMaintenanceAlert = async (req, res) => {
  try {
    const { vehicleId, alertType, description } = req.body;
    
    if (!vehicleId || !alertType || !description) {
      return res.status(400).json({
        message: 'Vehicle ID, alert type, and description are required'
      });
    }
    
    const vehicle = await Vehicle.findById(vehicleId).populate('assignedDriver', 'name email');
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    // Get fleet manager emails
    const fleetManagers = await User.find({ role: 'fleet_manager' }).select('email');
    const fleetManagerEmails = fleetManagers.map(fm => fm.email);
    
    if (fleetManagerEmails.length === 0) {
      return res.status(400).json({ message: 'No fleet managers found to send alerts to' });
    }
    
    // Send email alert
    const emailSent = process.env.NODE_ENV === 'production'
      ? await sendMaintenanceAlertEmail(fleetManagerEmails, vehicle, alertType, description)
      : await sendMaintenanceAlertEmailDev(fleetManagerEmails, vehicle, alertType, description);
    
    // Emit Socket.IO alert
    emitToRole('fleet_manager', 'maintenance_alert', {
      vehicleId: vehicle._id,
      vehicleNumber: vehicle.vehicleNumber,
      vehicleType: vehicle.type,
      alertType,
      description,
      assignedDriver: vehicle.assignedDriver,
      triggeredBy: req.user.name,
      timestamp: new Date()
    });
    
    emitToRole('admin', 'maintenance_alert', {
      vehicleId: vehicle._id,
      vehicleNumber: vehicle.vehicleNumber,
      vehicleType: vehicle.type,
      alertType,
      description,
      assignedDriver: vehicle.assignedDriver,
      triggeredBy: req.user.name,
      timestamp: new Date()
    });
    
    res.json({
      message: 'Maintenance alert sent successfully',
      vehicle: {
        id: vehicle._id,
        vehicleNumber: vehicle.vehicleNumber,
        type: vehicle.type
      },
      alertType,
      description,
      emailSent
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Schedule periodic checks (run every 5 minutes)
export const startAlertScheduler = () => {
  console.log('🕐 Starting maintenance and overdue trip alert scheduler...');
  
  // Check every 5 minutes
  setInterval(async () => {
    console.log('\n🔍 Running scheduled alert checks...');
    await checkOverdueTrips();
    await checkMaintenanceAlerts();
    console.log('✅ Alert checks completed\n');
  }, 5 * 60 * 1000); // 5 minutes
  
  // Initial check
  setTimeout(async () => {
    console.log('🔍 Running initial alert checks...');
    await checkOverdueTrips();
    await checkMaintenanceAlerts();
    console.log('✅ Initial alert checks completed');
  }, 10000); // 10 seconds after startup
};
