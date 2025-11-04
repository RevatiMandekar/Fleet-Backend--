import request from 'supertest';
import express from 'express';
import { setupTestDB, teardownTestDB, clearDatabase } from './setup.js';
import tripRoutes from '../routes/trip.routes.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import Trip from '../models/Trip.js';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';

const app = express();
app.use(express.json());
app.use('/api/trips', tripRoutes);

describe('Trip API Tests', () => {
  let authToken;
  let testUser;
  let testDriver;
  let testVehicle;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Create test user (fleet manager)
    testUser = new User({
      name: 'Fleet Manager',
      email: 'manager@test.com',
      password: 'Test123!@#',
      role: 'fleet_manager'
    });
    await testUser.save();

    // Create test driver
    testDriver = new User({
      name: 'Test Driver',
      email: 'driver@test.com',
      password: 'Test123!@#',
      role: 'driver'
    });
    await testDriver.save();

    // Create test vehicle
    testVehicle = new Vehicle({
      vehicleNumber: 'VH001',
      type: 'sedan',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      color: 'White',
      licensePlate: 'ABC123',
      vin: '1HGBH41JXMN109186',
      fuelType: 'gasoline',
      status: 'available',
      createdBy: testUser._id
    });
    await testVehicle.save();

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'manager@test.com',
        password: 'Test123!@#'
      });

    authToken = loginResponse.body.token;
  });

  describe('POST /api/trips', () => {
    it('should create a new trip successfully', async () => {
      const tripData = {
        vehicleId: testVehicle._id.toString(),
        driverId: testDriver._id.toString(),
        origin: 'New York',
        destination: 'Boston',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        distance: 200,
        notes: 'Test trip'
      };

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tripData)
        .expect(201);

      expect(response.body).toHaveProperty('trip');
      expect(response.body.trip.origin).toBe(tripData.origin);
      expect(response.body.trip.destination).toBe(tripData.destination);
    });

    it('should reject trip with invalid vehicle ID', async () => {
      const tripData = {
        vehicleId: 'invalid-id',
        driverId: testDriver._id.toString(),
        origin: 'New York',
        destination: 'Boston',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tripData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should reject trip with past start time', async () => {
      const tripData = {
        vehicleId: testVehicle._id.toString(),
        driverId: testDriver._id.toString(),
        origin: 'New York',
        destination: 'Boston',
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
      };

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tripData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/trips', () => {
    beforeEach(async () => {
      // Create some test trips
      const trips = [
        {
          vehicleId: testVehicle._id,
          driverId: testDriver._id,
          origin: 'New York',
          destination: 'Boston',
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'scheduled',
          createdBy: testUser._id
        },
        {
          vehicleId: testVehicle._id,
          driverId: testDriver._id,
          origin: 'Boston',
          destination: 'Washington',
          startTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
          status: 'scheduled',
          createdBy: testUser._id
        }
      ];

      await Trip.insertMany(trips);
    });

    it('should get all trips with pagination', async () => {
      const response = await request(app)
        .get('/api/trips?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('trips');
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body).toHaveProperty('currentPage', 1);
      expect(response.body.trips.length).toBeGreaterThan(0);
    });

    it('should filter trips by status', async () => {
      const response = await request(app)
        .get('/api/trips?status=scheduled')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.trips.every(trip => trip.status === 'scheduled')).toBe(true);
    });
  });
});

