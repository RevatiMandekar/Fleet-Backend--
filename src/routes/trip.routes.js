import express from 'express';
import { 
  getAllTrips, 
  getTripById, 
  createTrip, 
  updateTrip, 
  deleteTrip,
  startTrip,
  completeTrip,
  cancelTrip,
  getTripsByDriver,
  getTripsByVehicle
} from '../controllers/trip.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validateTrip, validateTripUpdate } from '../middlewares/joiValidation.middleware.js';

const router = express.Router();

// All trip routes require authentication
router.use(authenticate);

// Public trip routes (authenticated users can view)
router.get('/', getAllTrips);
router.get('/:id', getTripById);

// Driver-specific routes
router.get('/driver/:driverId', getTripsByDriver);

// Vehicle-specific routes
router.get('/vehicle/:vehicleId', getTripsByVehicle);

// Fleet Manager and Admin routes
router.post('/', authorize('fleet_manager', 'admin'), validateTrip, createTrip);
router.put('/:id', authorize('fleet_manager', 'admin'), validateTripUpdate, updateTrip);
router.delete('/:id', authorize('fleet_manager', 'admin'), deleteTrip);

// Trip status management routes
router.patch('/:id/start', authorize('driver', 'fleet_manager', 'admin'), startTrip);
router.patch('/:id/complete', authorize('driver', 'fleet_manager', 'admin'), completeTrip);
router.patch('/:id/cancel', authorize('fleet_manager', 'admin'), cancelTrip);

export default router;
