import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Get completed trips per driver
export const getDriverTripStats = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.endTime = {};
      if (startDate) dateFilter.endTime.$gte = new Date(startDate);
      if (endDate) dateFilter.endTime.$lte = new Date(endDate);
    }
    
    // Get driver info
    const driver = await User.findById(driverId).select('name email role');
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    // Get completed trips
    const completedTrips = await Trip.find({
      driverId,
      status: 'completed',
      ...dateFilter
    }).populate('vehicleId', 'vehicleNumber type');
    
    // Calculate statistics
    const totalTrips = completedTrips.length;
    const totalDistance = completedTrips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
    const totalFuelConsumed = completedTrips.reduce((sum, trip) => sum + (trip.fuelConsumed || 0), 0);
    const averageDistance = totalTrips > 0 ? totalDistance / totalTrips : 0;
    const averageFuelConsumption = totalTrips > 0 ? totalFuelConsumed / totalTrips : 0;
    
    // Get recent trips (last 10)
    const recentTrips = await Trip.find({
      driverId,
      status: 'completed',
      ...dateFilter
    })
    .populate('vehicleId', 'vehicleNumber type')
    .sort({ endTime: -1 })
    .limit(10);
    
    res.json({
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email
      },
      statistics: {
        totalTrips,
        totalDistance,
        totalFuelConsumed,
        averageDistance: Math.round(averageDistance * 100) / 100,
        averageFuelConsumption: Math.round(averageFuelConsumption * 100) / 100
      },
      recentTrips,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get vehicle usage statistics
export const getVehicleUsageStats = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.endTime = {};
      if (startDate) dateFilter.endTime.$gte = new Date(startDate);
      if (endDate) dateFilter.endTime.$lte = new Date(endDate);
    }
    
    // Get vehicle info
    const vehicle = await Vehicle.findById(vehicleId)
      .populate('assignedDriver', 'name email');
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    // Get all trips for this vehicle
    const allTrips = await Trip.find({
      vehicleId,
      ...dateFilter
    }).populate('driverId', 'name email');
    
    // Calculate statistics by status
    const tripsByStatus = {
      scheduled: allTrips.filter(trip => trip.status === 'scheduled'),
      in_progress: allTrips.filter(trip => trip.status === 'in_progress'),
      completed: allTrips.filter(trip => trip.status === 'completed'),
      cancelled: allTrips.filter(trip => trip.status === 'cancelled')
    };
    
    // Calculate usage metrics
    const completedTrips = tripsByStatus.completed;
    const totalTrips = allTrips.length;
    const totalDistance = completedTrips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
    const totalFuelConsumed = completedTrips.reduce((sum, trip) => sum + (trip.fuelConsumed || 0), 0);
    const utilizationRate = totalTrips > 0 ? (completedTrips.length / totalTrips) * 100 : 0;
    
    // Get most frequent drivers
    const driverStats = {};
    completedTrips.forEach(trip => {
      const driverId = trip.driverId._id.toString();
      if (!driverStats[driverId]) {
        driverStats[driverId] = {
          driver: trip.driverId,
          tripCount: 0,
          totalDistance: 0
        };
      }
      driverStats[driverId].tripCount++;
      driverStats[driverId].totalDistance += trip.distance || 0;
    });
    
    const topDrivers = Object.values(driverStats)
      .sort((a, b) => b.tripCount - a.tripCount)
      .slice(0, 5);
    
    // Get recent trips
    const recentTrips = await Trip.find({
      vehicleId,
      ...dateFilter
    })
    .populate('driverId', 'name email')
    .sort({ startTime: -1 })
    .limit(10);
    
    res.json({
      vehicle: {
        id: vehicle._id,
        vehicleNumber: vehicle.vehicleNumber,
        type: vehicle.type,
        status: vehicle.status,
        assignedDriver: vehicle.assignedDriver
      },
      statistics: {
        totalTrips,
        tripsByStatus: {
          scheduled: tripsByStatus.scheduled.length,
          in_progress: tripsByStatus.in_progress.length,
          completed: tripsByStatus.completed.length,
          cancelled: tripsByStatus.cancelled.length
        },
        totalDistance,
        totalFuelConsumed,
        utilizationRate: Math.round(utilizationRate * 100) / 100,
        averageDistancePerTrip: completedTrips.length > 0 ? Math.round((totalDistance / completedTrips.length) * 100) / 100 : 0
      },
      topDrivers,
      recentTrips,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get pending and overdue trips
export const getPendingOverdueTrips = async (req, res) => {
  try {
    const { type = 'all' } = req.query; // 'pending', 'overdue', 'all'
    const currentTime = new Date();
    
    let filter = {};
    
    if (type === 'pending') {
      filter = { status: 'scheduled' };
    } else if (type === 'overdue') {
      filter = {
        status: 'scheduled',
        startTime: { $lt: currentTime }
      };
    } else {
      // All pending and overdue
      filter = {
        status: 'scheduled'
      };
    }
    
    const trips = await Trip.find(filter)
      .populate('vehicleId', 'vehicleNumber type status')
      .populate('driverId', 'name email')
      .populate('createdBy', 'name email')
      .sort({ startTime: 1 });
    
    // Categorize trips
    const categorizedTrips = {
      pending: trips.filter(trip => trip.status === 'scheduled' && trip.startTime >= currentTime),
      overdue: trips.filter(trip => trip.status === 'scheduled' && trip.startTime < currentTime)
    };
    
    // Calculate statistics
    const stats = {
      totalPending: categorizedTrips.pending.length,
      totalOverdue: categorizedTrips.overdue.length,
      totalScheduled: trips.length
    };
    
    // Get drivers with most overdue trips
    const driverOverdueStats = {};
    categorizedTrips.overdue.forEach(trip => {
      const driverId = trip.driverId._id.toString();
      if (!driverOverdueStats[driverId]) {
        driverOverdueStats[driverId] = {
          driver: trip.driverId,
          overdueCount: 0,
          oldestOverdue: trip.startTime
        };
      }
      driverOverdueStats[driverId].overdueCount++;
      if (trip.startTime < driverOverdueStats[driverId].oldestOverdue) {
        driverOverdueStats[driverId].oldestOverdue = trip.startTime;
      }
    });
    
    const driversWithOverdue = Object.values(driverOverdueStats)
      .sort((a, b) => b.overdueCount - a.overdueCount);
    
    res.json({
      statistics: stats,
      trips: type === 'all' ? trips : categorizedTrips[type] || trips,
      categorizedTrips: type === 'all' ? categorizedTrips : null,
      driversWithOverdue,
      currentTime
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get fleet-wide analytics dashboard
export const getFleetAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.endTime = {};
      if (startDate) dateFilter.endTime.$gte = new Date(startDate);
      if (endDate) dateFilter.endTime.$lte = new Date(endDate);
    }
    
    // Get all trips in date range
    const allTrips = await Trip.find(dateFilter)
      .populate('vehicleId', 'vehicleNumber type')
      .populate('driverId', 'name email');
    
    // Calculate fleet-wide statistics
    const tripsByStatus = {
      scheduled: allTrips.filter(trip => trip.status === 'scheduled'),
      in_progress: allTrips.filter(trip => trip.status === 'in_progress'),
      completed: allTrips.filter(trip => trip.status === 'completed'),
      cancelled: allTrips.filter(trip => trip.status === 'cancelled')
    };
    
    const completedTrips = tripsByStatus.completed;
    const totalDistance = completedTrips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
    const totalFuelConsumed = completedTrips.reduce((sum, trip) => sum + (trip.fuelConsumed || 0), 0);
    
    // Get vehicle statistics
    const vehicles = await Vehicle.find({});
    const vehicleStats = {
      total: vehicles.length,
      available: vehicles.filter(v => v.status === 'available').length,
      assigned: vehicles.filter(v => v.status === 'assigned').length,
      maintenance: vehicles.filter(v => v.status === 'maintenance').length,
      outOfService: vehicles.filter(v => v.status === 'out_of_service').length
    };
    
    // Get driver statistics
    const drivers = await User.find({ role: 'driver' });
    const activeDrivers = new Set(completedTrips.map(trip => trip.driverId._id.toString()));
    
    // Get top performing drivers
    const driverPerformance = {};
    completedTrips.forEach(trip => {
      const driverId = trip.driverId._id.toString();
      if (!driverPerformance[driverId]) {
        driverPerformance[driverId] = {
          driver: trip.driverId,
          tripCount: 0,
          totalDistance: 0,
          totalFuelConsumed: 0
        };
      }
      driverPerformance[driverId].tripCount++;
      driverPerformance[driverId].totalDistance += trip.distance || 0;
      driverPerformance[driverId].totalFuelConsumed += trip.fuelConsumed || 0;
    });
    
    const topDrivers = Object.values(driverPerformance)
      .sort((a, b) => b.tripCount - a.tripCount)
      .slice(0, 10);
    
    // Get vehicle utilization
    const vehicleUtilization = {};
    completedTrips.forEach(trip => {
      const vehicleId = trip.vehicleId._id.toString();
      if (!vehicleUtilization[vehicleId]) {
        vehicleUtilization[vehicleId] = {
          vehicle: trip.vehicleId,
          tripCount: 0,
          totalDistance: 0
        };
      }
      vehicleUtilization[vehicleId].tripCount++;
      vehicleUtilization[vehicleId].totalDistance += trip.distance || 0;
    });
    
    const topVehicles = Object.values(vehicleUtilization)
      .sort((a, b) => b.tripCount - a.tripCount)
      .slice(0, 10);
    
    res.json({
      overview: {
        totalTrips: allTrips.length,
        completedTrips: completedTrips.length,
        totalDistance,
        totalFuelConsumed,
        averageDistancePerTrip: completedTrips.length > 0 ? Math.round((totalDistance / completedTrips.length) * 100) / 100 : 0,
        fuelEfficiency: totalDistance > 0 ? Math.round((totalFuelConsumed / totalDistance) * 100) / 100 : 0
      },
      tripsByStatus: {
        scheduled: tripsByStatus.scheduled.length,
        in_progress: tripsByStatus.in_progress.length,
        completed: tripsByStatus.completed.length,
        cancelled: tripsByStatus.cancelled.length
      },
      vehicleStats,
      driverStats: {
        totalDrivers: drivers.length,
        activeDrivers: activeDrivers.size,
        inactiveDrivers: drivers.length - activeDrivers.size
      },
      topPerformers: {
        drivers: topDrivers,
        vehicles: topVehicles
      },
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Advanced aggregation pipeline for driver performance analytics
export const getDriverPerformanceAnalytics = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { startDate, endDate, groupBy = 'month' } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.endTime = {};
      if (startDate) dateFilter.endTime.$gte = new Date(startDate);
      if (endDate) dateFilter.endTime.$lte = new Date(endDate);
    }
    
    // Aggregation pipeline for driver performance
    const pipeline = [
      // Match completed trips for the driver
      {
        $match: {
          driverId: new mongoose.Types.ObjectId(driverId),
          status: 'completed',
          ...dateFilter
        }
      },
      // Lookup vehicle details
      {
        $lookup: {
          from: 'vehicles',
          localField: 'vehicleId',
          foreignField: '_id',
          as: 'vehicle'
        }
      },
      // Unwind vehicle array
      {
        $unwind: '$vehicle'
      },
      // Add calculated fields
      {
        $addFields: {
          duration: {
            $divide: [
              { $subtract: ['$endTime', '$startTime'] },
              1000 * 60 * 60 // Convert to hours
            ]
          },
          fuelEfficiency: {
            $cond: {
              if: { $gt: ['$distance', 0] },
              then: { $divide: ['$fuelConsumed', '$distance'] },
              else: 0
            }
          },
          year: { $year: '$endTime' },
          month: { $month: '$endTime' },
          week: { $week: '$endTime' },
          day: { $dayOfMonth: '$endTime' }
        }
      },
      // Group by time period
      {
        $group: {
          _id: groupBy === 'day' ? { year: '$year', month: '$month', day: '$day' } :
               groupBy === 'week' ? { year: '$year', week: '$week' } :
               groupBy === 'month' ? { year: '$year', month: '$month' } :
               { year: '$year' },
          totalTrips: { $sum: 1 },
          totalDistance: { $sum: '$distance' },
          totalFuelConsumed: { $sum: '$fuelConsumed' },
          totalDuration: { $sum: '$duration' },
          avgDistance: { $avg: '$distance' },
          avgFuelConsumption: { $avg: '$fuelEfficiency' },
          avgDuration: { $avg: '$duration' },
          vehicles: { $addToSet: '$vehicle.vehicleNumber' },
          vehicleTypes: { $addToSet: '$vehicle.type' }
        }
      },
      // Sort by date
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ];
    
    const performanceData = await Trip.aggregate(pipeline);
    
    // Get driver info
    const driver = await User.findById(driverId).select('name email role');
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    // Calculate overall statistics
    const overallStats = await Trip.aggregate([
      {
        $match: {
          driverId: new mongoose.Types.ObjectId(driverId),
          status: 'completed',
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalDistance: { $sum: '$distance' },
          totalFuelConsumed: { $sum: '$fuelConsumed' },
          avgDistance: { $avg: '$distance' },
          avgFuelConsumption: { $avg: { $divide: ['$fuelConsumed', '$distance'] } },
          minDistance: { $min: '$distance' },
          maxDistance: { $max: '$distance' }
        }
      }
    ]);
    
    res.json({
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email
      },
      performanceData,
      overallStats: overallStats[0] || {},
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null,
        groupBy
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Advanced aggregation pipeline for vehicle utilization analytics
export const getVehicleUtilizationAnalytics = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.endTime = {};
      if (startDate) dateFilter.endTime.$gte = new Date(startDate);
      if (endDate) dateFilter.endTime.$lte = new Date(endDate);
    }
    
    // Aggregation pipeline for vehicle utilization
    const pipeline = [
      // Match trips for the vehicle
      {
        $match: {
          vehicleId: new mongoose.Types.ObjectId(vehicleId),
          ...dateFilter
        }
      },
      // Lookup driver details
      {
        $lookup: {
          from: 'users',
          localField: 'driverId',
          foreignField: '_id',
          as: 'driver'
        }
      },
      // Unwind driver array
      {
        $unwind: '$driver'
      },
      // Add calculated fields
      {
        $addFields: {
          duration: {
            $cond: {
              if: { $ne: ['$endTime', null] },
              then: {
                $divide: [
                  { $subtract: ['$endTime', '$startTime'] },
                  1000 * 60 * 60 // Convert to hours
                ]
              },
              else: 0
            }
          },
          isCompleted: { $eq: ['$status', 'completed'] },
          isOverdue: {
            $and: [
              { $eq: ['$status', 'scheduled'] },
              { $lt: ['$startTime', new Date()] }
            ]
          }
        }
      },
      // Group by status and calculate metrics
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDistance: { $sum: { $cond: ['$isCompleted', '$distance', 0] } },
          totalFuelConsumed: { $sum: { $cond: ['$isCompleted', '$fuelConsumed', 0] } },
          totalDuration: { $sum: { $cond: ['$isCompleted', '$duration', 0] } },
          avgDistance: { $avg: { $cond: ['$isCompleted', '$distance', null] } },
          drivers: { $addToSet: '$driver.name' },
          overdueCount: { $sum: { $cond: ['$isOverdue', 1, 0] } }
        }
      }
    ];
    
    const utilizationData = await Trip.aggregate(pipeline);
    
    // Get vehicle info
    const vehicle = await Vehicle.findById(vehicleId)
      .populate('assignedDriver', 'name email');
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    // Calculate utilization percentage
    const totalDays = Math.ceil((new Date(endDate || new Date()) - new Date(startDate || new Date(0))) / (1000 * 60 * 60 * 24));
    const completedTrips = utilizationData.find(item => item._id === 'completed');
    const utilizationPercentage = totalDays > 0 ? ((completedTrips?.totalDuration || 0) / (totalDays * 24)) * 100 : 0;
    
    res.json({
      vehicle: {
        id: vehicle._id,
        vehicleNumber: vehicle.vehicleNumber,
        type: vehicle.type,
        status: vehicle.status,
        assignedDriver: vehicle.assignedDriver
      },
      utilizationData,
      utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null,
        totalDays
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Advanced aggregation pipeline for maintenance analytics
export const getMaintenanceAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.lastServiceDate = {};
      if (startDate) dateFilter.lastServiceDate.$gte = new Date(startDate);
      if (endDate) dateFilter.lastServiceDate.$lte = new Date(endDate);
    }
    
    // Aggregation pipeline for maintenance analytics
    const pipeline = [
      // Match vehicles with service dates
      {
        $match: {
          lastServiceDate: { $exists: true, $ne: null },
          ...dateFilter
        }
      },
      // Add calculated fields
      {
        $addFields: {
          daysSinceLastService: {
            $divide: [
              { $subtract: [new Date(), '$lastServiceDate'] },
              1000 * 60 * 60 * 24
            ]
          },
          daysUntilNextService: {
            $cond: {
              if: { $ne: ['$nextServiceDue', null] },
              then: {
                $divide: [
                  { $subtract: ['$nextServiceDue', new Date()] },
                  1000 * 60 * 60 * 24
                ]
              },
              else: null
            }
          },
          isOverdue: {
            $and: [
              { $ne: ['$nextServiceDue', null] },
              { $lt: ['$nextServiceDue', new Date()] }
            ]
          },
          serviceInterval: {
            $cond: {
              if: { $and: ['$lastServiceDate', '$nextServiceDue'] },
              then: {
                $divide: [
                  { $subtract: ['$nextServiceDue', '$lastServiceDate'] },
                  1000 * 60 * 60 * 24
                ]
              },
              else: null
            }
          }
        }
      },
      // Group by vehicle type and status
      {
        $group: {
          _id: {
            type: '$type',
            status: '$status'
          },
          count: { $sum: 1 },
          avgDaysSinceService: { $avg: '$daysSinceLastService' },
          avgServiceInterval: { $avg: '$serviceInterval' },
          overdueCount: { $sum: { $cond: ['$isOverdue', 1, 0] } },
          totalMileage: { $sum: '$mileage' },
          avgMileage: { $avg: '$mileage' }
        }
      },
      // Sort by type and status
      {
        $sort: { '_id.type': 1, '_id.status': 1 }
      }
    ];
    
    const maintenanceData = await Vehicle.aggregate(pipeline);
    
    // Get vehicles needing immediate attention
    const urgentMaintenance = await Vehicle.find({
      $or: [
        { nextServiceDue: { $lt: new Date() } },
        { 
          lastServiceDate: { 
            $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
          }
        }
      ]
    }).populate('assignedDriver', 'name email');
    
    res.json({
      maintenanceData,
      urgentMaintenance,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
