import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Store connected users by role
const connectedUsers = {
  drivers: new Map(),
  fleetManagers: new Map(),
  admins: new Map()
};

export const setupSocketHandlers = (io) => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.userName = user.name;
      
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userName} (${socket.userRole}) - Socket ID: ${socket.id}`);

    // Add user to appropriate role-based room
    const userInfo = {
      socketId: socket.id,
      userId: socket.userId,
      userName: socket.userName,
      role: socket.userRole,
      connectedAt: new Date()
    };

    // Join role-specific rooms
    socket.join(socket.userRole);
    socket.join(socket.userId); // Personal room for individual updates

    // Store user info
    connectedUsers[socket.userRole + 's'].set(socket.userId, userInfo);

    // Notify fleet managers and admins about driver connections
    if (socket.userRole === 'driver') {
      io.to('fleet_manager').to('admin').emit('driver_connected', {
        driverId: socket.userId,
        driverName: socket.userName,
        connectedAt: userInfo.connectedAt
      });
    }

    // Handle trip status updates
    socket.on('trip_status_update', async (data) => {
      try {
        const { tripId, status, location, notes } = data;
        
        console.log(`📍 Trip status update from ${socket.userName}: Trip ${tripId} -> ${status}`);
        
        // Emit to fleet managers and admins
        io.to('fleet_manager').to('admin').emit('trip_status_changed', {
          tripId,
          status,
          driverId: socket.userId,
          driverName: socket.userName,
          location,
          notes,
          timestamp: new Date()
        });

        // Emit to the specific driver
        socket.emit('trip_status_confirmed', {
          tripId,
          status,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('Error handling trip status update:', error);
        socket.emit('error', { message: 'Failed to update trip status' });
      }
    });

    // Handle location updates
    socket.on('location_update', (data) => {
      const { tripId, latitude, longitude, speed, heading } = data;
      
      // Emit to fleet managers and admins
      io.to('fleet_manager').to('admin').emit('driver_location_update', {
        driverId: socket.userId,
        driverName: socket.userName,
        tripId,
        location: { latitude, longitude },
        speed,
        heading,
        timestamp: new Date()
      });
    });

    // Handle emergency alerts
    socket.on('emergency_alert', (data) => {
      const { tripId, emergencyType, message, location } = data;
      
      console.log(`🚨 Emergency alert from ${socket.userName}: ${emergencyType}`);
      
      // Emit to all fleet managers and admins immediately
      io.to('fleet_manager').to('admin').emit('emergency_alert', {
        driverId: socket.userId,
        driverName: socket.userName,
        tripId,
        emergencyType,
        message,
        location,
        timestamp: new Date()
      });
    });

    // Handle maintenance alerts
    socket.on('maintenance_alert', (data) => {
      const { vehicleId, maintenanceType, description } = data;
      
      // Emit to fleet managers and admins
      io.to('fleet_manager').to('admin').emit('maintenance_alert', {
        driverId: socket.userId,
        driverName: socket.userName,
        vehicleId,
        maintenanceType,
        description,
        timestamp: new Date()
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.userName} (${socket.userRole}) - Socket ID: ${socket.id}`);
      
      // Remove user from connected users
      connectedUsers[socket.userRole + 's'].delete(socket.userId);
      
      // Notify fleet managers and admins about driver disconnections
      if (socket.userRole === 'driver') {
        io.to('fleet_manager').to('admin').emit('driver_disconnected', {
          driverId: socket.userId,
          driverName: socket.userName,
          disconnectedAt: new Date()
        });
      }
    });
  });

  // Helper function to get connected users count
  const getConnectedUsersCount = () => {
    return {
      drivers: connectedUsers.drivers.size,
      fleetManagers: connectedUsers.fleetManagers.size,
      admins: connectedUsers.admins.size,
      total: connectedUsers.drivers.size + connectedUsers.fleetManagers.size + connectedUsers.admins.size
    };
  };

  // Make io instance available globally
  global.io = io;
  global.getConnectedUsersCount = getConnectedUsersCount;
};

// Export helper functions
export const emitToRole = (role, event, data) => {
  if (global.io) {
    global.io.to(role).emit(event, data);
  }
};

export const emitToUser = (userId, event, data) => {
  if (global.io) {
    global.io.to(userId).emit(event, data);
  }
};

export const emitToAll = (event, data) => {
  if (global.io) {
    global.io.emit(event, data);
  }
};
