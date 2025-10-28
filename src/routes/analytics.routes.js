import express from 'express';
import { 
  getDriverTripStats,
  getVehicleUsageStats,
  getPendingOverdueTrips,
  getFleetAnalytics,
  getDriverPerformanceAnalytics,
  getVehicleUtilizationAnalytics,
  getMaintenanceAnalytics
} from '../controllers/analytics.controller.js';
import { triggerMaintenanceAlert } from '../services/alertService.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

// All analytics routes require authentication
router.use(authenticate);

// Driver trip statistics (accessible by driver, fleet_manager, admin)
router.get('/driver/:driverId/stats', 
  authorize('driver', 'fleet_manager', 'admin'),
  getDriverTripStats
);

// Vehicle usage statistics (accessible by fleet_manager, admin)
router.get('/vehicle/:vehicleId/stats', 
  authorize('fleet_manager', 'admin'),
  getVehicleUsageStats
);

// Pending and overdue trips (accessible by fleet_manager, admin)
router.get('/trips/pending-overdue', 
  authorize('fleet_manager', 'admin'),
  getPendingOverdueTrips
);

// Fleet-wide analytics dashboard (accessible by fleet_manager, admin)
router.get('/fleet/dashboard', 
  authorize('fleet_manager', 'admin'),
  getFleetAnalytics
);

// Manual maintenance alert trigger (accessible by driver, fleet_manager, admin)
router.post('/maintenance/alert', 
  authorize('driver', 'fleet_manager', 'admin'),
  triggerMaintenanceAlert
);

// Advanced analytics endpoints with aggregation pipelines

// Driver performance analytics with advanced aggregation
router.get('/driver/:driverId/performance', 
  authorize('driver', 'fleet_manager', 'admin'),
  getDriverPerformanceAnalytics
);

// Vehicle utilization analytics with advanced aggregation
router.get('/vehicle/:vehicleId/utilization', 
  authorize('fleet_manager', 'admin'),
  getVehicleUtilizationAnalytics
);

// Maintenance analytics with advanced aggregation
router.get('/maintenance/analytics', 
  authorize('fleet_manager', 'admin'),
  getMaintenanceAnalytics
);

export default router;
