# 🧪 COMPREHENSIVE TESTING GUIDE
## Fleet & Vehicle Management System (Backend)

This guide provides step-by-step testing instructions for every functionality in the system. Follow these tests in order and take screenshots for documentation.

---

## 📋 **PREREQUISITES**

### Setup Before Testing:
1. **Start MongoDB** - Ensure MongoDB is running
2. **Start the Server** - Run `npm start` or `npm run dev`
3. **Install Dependencies** - Ensure `npm install` has been run
4. **Tools Needed:**
   - **Postman** / **Insomnia** / **Thunder Client** (for API testing)
   - **Browser** (for Socket.IO testing)
   - **Terminal/Command Prompt** (for server logs)

### Test Data Preparation:
Create test users for each role:
- **Admin User** (for admin-only endpoints)
- **Fleet Manager User** (for fleet manager endpoints)
- **Driver User** (for driver endpoints)

---

## 🔐 **WEEK 1: SETUP & AUTHENTICATION**

### ✅ Test 1.1: Server Health Check

**Endpoint:** `GET /`

**Request:**
```
GET http://localhost:4000/
```

**Expected Response:**
```json
"Fleet & Vehicle Management API is running..."
```

**Screenshot Points:**
- ✅ Server running message
- ✅ Terminal showing server started

---

### ✅ Test 1.2: User Registration (All Roles)

#### Test 1.2.1: Register Admin User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@fleet.com",
  "password": "Admin@123",
  "role": "admin"
}
```

**Expected Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "...",
    "name": "Admin User",
    "email": "admin@fleet.com",
    "role": "admin"
  }
}
```

**Screenshot Points:**
- ✅ Request body in Postman
- ✅ Response with user details (hide password)
- ✅ Database document in MongoDB Compass

---

#### Test 1.2.2: Register Fleet Manager User

**Request Body:**
```json
{
  "name": "Fleet Manager",
  "email": "manager@fleet.com",
  "password": "Manager@123",
  "role": "fleet_manager"
}
```

**Screenshot:** Same as above

---

#### Test 1.2.3: Register Driver User

**Request Body:**
```json
{
  "name": "Driver One",
  "email": "driver1@fleet.com",
  "password": "Driver@123",
  "role": "driver"
}
```

**Screenshot:** Same as above

---

#### Test 1.2.4: Register with Invalid Data (Validation Test)

**Request Body:**
```json
{
  "name": "",
  "email": "invalid-email",
  "password": "123"
}
```

**Expected Response:** `400 Bad Request`
```json
{
  "error": "Validation error",
  "details": "..."
}
```

**Screenshot Points:**
- ✅ Validation error message
- ✅ Details showing specific field errors

---

#### Test 1.2.5: Register Duplicate Email

**Request Body:**
```json
{
  "name": "Duplicate User",
  "email": "admin@fleet.com",
  "password": "Password@123",
  "role": "driver"
}
```

**Expected Response:** `400 Bad Request`
```json
{
  "error": "Email already exists"
}
```

**Screenshot:** Error message

---

### ✅ Test 1.3: User Login

#### Test 1.3.1: Login as Admin

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "admin@fleet.com",
  "password": "Admin@123"
}
```

**Expected Response:** `200 OK`
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "Admin User",
    "email": "admin@fleet.com",
    "role": "admin"
  }
}
```

**Screenshot Points:**
- ✅ Request body
- ✅ Response with JWT token (highlight token)
- ✅ **Save the token** for subsequent tests

---

#### Test 1.3.2: Login as Fleet Manager

**Request Body:**
```json
{
  "email": "manager@fleet.com",
  "password": "Manager@123"
}
```

**Action:** Save the Fleet Manager token

---

#### Test 1.3.3: Login as Driver

**Request Body:**
```json
{
  "email": "driver1@fleet.com",
  "password": "Driver@123"
}
```

**Action:** Save the Driver token

---

#### Test 1.3.4: Login with Wrong Credentials

**Request Body:**
```json
{
  "email": "admin@fleet.com",
  "password": "WrongPassword"
}
```

**Expected Response:** `401 Unauthorized`
```json
{
  "error": "Invalid credentials"
}
```

**Screenshot:** Error response

---

### ✅ Test 1.4: Profile Access (JWT Authentication)

**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "message": "Profile retrieved successfully",
  "user": {
    "_id": "...",
    "name": "Admin User",
    "email": "admin@fleet.com",
    "role": "admin"
  }
}
```

**Screenshot Points:**
- ✅ Request headers showing Authorization
- ✅ Profile response

---

#### Test 1.4.1: Access Without Token (Should Fail)

**Headers:** None

**Expected Response:** `401 Unauthorized`
```json
{
  "error": "No token provided"
}
```

**Screenshot:** Error message

---

#### Test 1.4.2: Access with Invalid Token (Should Fail)

**Headers:**
```
Authorization: Bearer invalid_token_12345
```

**Expected Response:** `401 Unauthorized`
```json
{
  "error": "Invalid or expired token"
}
```

**Screenshot:** Error message

---

### ✅ Test 1.5: Role-Based Access Control

#### Test 1.5.1: Admin-Only Route

**Endpoint:** `GET /api/auth/admin-only`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "message": "Welcome Admin Admin User"
}
```

**Screenshot:** Success response

---

**Now Test with Fleet Manager Token (Should Fail):**

**Headers:**
```
Authorization: Bearer <FLEET_MANAGER_TOKEN>
```

**Expected Response:** `403 Forbidden`
```json
{
  "error": "Access denied. Admin role required."
}
```

**Screenshot:** Error message

---

#### Test 1.5.2: Fleet Manager-Only Route

**Endpoint:** `GET /api/auth/fleet-manager-only`

**Headers:**
```
Authorization: Bearer <FLEET_MANAGER_TOKEN>
```

**Expected Response:** `200 OK`

**Screenshot:** Success response

---

#### Test 1.5.3: Driver-Only Route

**Endpoint:** `GET /api/auth/driver-only`

**Headers:**
```
Authorization: Bearer <DRIVER_TOKEN>
```

**Expected Response:** `200 OK`

**Screenshot:** Success response

---

### ✅ Test 1.6: Password Reset Flow

#### Test 1.6.1: Request Password Reset

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "admin@fleet.com"
}
```

**Expected Response:** `200 OK`
```json
{
  "message": "Password reset email sent successfully"
}
```

**Screenshot Points:**
- ✅ Request and response
- ✅ Check email inbox for reset link (if configured)

---

#### Test 1.6.2: Reset Password with Token

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "token": "<RESET_TOKEN_FROM_EMAIL>",
  "newPassword": "NewPassword@123"
}
```

**Expected Response:** `200 OK`
```json
{
  "message": "Password reset successful"
}
```

**Screenshot:** Success response

---

### ✅ **WEEK 1 SCREENSHOT CHECKLIST:**
- [ ] Server running message
- [ ] Register Admin user (success)
- [ ] Register Fleet Manager user (success)
- [ ] Register Driver user (success)
- [ ] Validation error on invalid input
- [ ] Duplicate email error
- [ ] Login Admin (with token)
- [ ] Login Fleet Manager (with token)
- [ ] Login Driver (with token)
- [ ] Wrong credentials error
- [ ] Profile access with token
- [ ] Profile access without token (error)
- [ ] Admin-only route (success)
- [ ] Admin-only route with Fleet Manager token (error)
- [ ] Fleet Manager-only route (success)
- [ ] Driver-only route (success)
- [ ] Password reset request
- [ ] Password reset completion

---

## 🚛 **WEEK 2: VEHICLES & TRIPS MANAGEMENT**

### ✅ Test 2.1: Vehicle CRUD Operations

#### Test 2.1.1: Create Vehicle (Admin/Fleet Manager Only)

**Endpoint:** `POST /api/vehicles`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "vehicleNumber": "VEH-001",
  "type": "Truck",
  "status": "available",
  "make": "Volvo",
  "model": "FH16",
  "year": 2023,
  "capacity": "10 tons"
}
```

**Expected Response:** `201 Created`
```json
{
  "message": "Vehicle created successfully",
  "vehicle": {
    "_id": "...",
    "vehicleNumber": "VEH-001",
    "type": "Truck",
    "status": "available",
    ...
  }
}
```

**Screenshot Points:**
- ✅ Request with headers
- ✅ Response with created vehicle
- ✅ **Save vehicle ID** for later tests

---

#### Test 2.1.2: Create Vehicle as Driver (Should Fail)

**Headers:**
```
Authorization: Bearer <DRIVER_TOKEN>
```

**Expected Response:** `403 Forbidden`
```json
{
  "error": "Access denied. Admin or Fleet Manager role required."
}
```

**Screenshot:** Error message

---

#### Test 2.1.3: Create Multiple Vehicles

Create 3-5 vehicles with different types and statuses:
- VEH-002 (Van, available)
- VEH-003 (Car, maintenance)
- VEH-004 (Truck, in_use)

**Screenshot:** List of created vehicles

---

#### Test 2.1.4: Get All Vehicles (Pagination Test)

**Endpoint:** `GET /api/vehicles?page=1&limit=10`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "vehicles": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalVehicles": 5,
    "limit": 10
  }
}
```

**Screenshot Points:**
- ✅ Response with vehicles array
- ✅ Pagination metadata
- ✅ Test with different page numbers

---

#### Test 2.1.5: Get Vehicle by ID

**Endpoint:** `GET /api/vehicles/<VEHICLE_ID>`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "vehicle": {
    "_id": "...",
    "vehicleNumber": "VEH-001",
    ...
  }
}
```

**Screenshot:** Vehicle details

---

#### Test 2.1.6: Update Vehicle

**Endpoint:** `PUT /api/vehicles/<VEHICLE_ID>`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Request Body:**
```json
{
  "status": "in_use",
  "make": "Mercedes",
  "model": "Actros"
}
```

**Expected Response:** `200 OK`
```json
{
  "message": "Vehicle updated successfully",
  "vehicle": {...}
}
```

**Screenshot:** Updated vehicle

---

#### Test 2.1.7: Delete Vehicle (Admin Only)

**Endpoint:** `DELETE /api/vehicles/<VEHICLE_ID>`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "message": "Vehicle deleted successfully"
}
```

**Screenshot:** Success message

---

#### Test 2.1.8: Get Available Vehicles

**Endpoint:** `GET /api/vehicles/available`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "vehicles": [...]
}
```

**Screenshot:** List of available vehicles

---

#### Test 2.1.9: Get Vehicles by Status

**Endpoint:** `GET /api/vehicles/status/maintenance`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "vehicles": [...]
}
```

**Screenshot:** Filtered vehicles

---

### ✅ Test 2.2: Assign Vehicle to Driver

#### Test 2.2.1: Assign Vehicle

**Endpoint:** `POST /api/vehicles/<VEHICLE_ID>/assign`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Request Body:**
```json
{
  "driverId": "<DRIVER_USER_ID>"
}
```

**Expected Response:** `200 OK`
```json
{
  "message": "Vehicle assigned to driver successfully",
  "vehicle": {
    "_id": "...",
    "assignedDriver": "<DRIVER_USER_ID>",
    ...
  }
}
```

**Screenshot Points:**
- ✅ Request with driver ID
- ✅ Response showing assigned driver
- ✅ Vehicle document in database with assignedDriver field

---

#### Test 2.2.2: Unassign Vehicle

**Endpoint:** `POST /api/vehicles/<VEHICLE_ID>/unassign`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "message": "Vehicle unassigned successfully",
  "vehicle": {
    "_id": "...",
    "assignedDriver": null,
    ...
  }
}
```

**Screenshot:** Unassigned vehicle

---

### ✅ Test 2.3: Trip CRUD Operations

#### Test 2.3.1: Create Trip (Fleet Manager/Admin Only)

**Endpoint:** `POST /api/trips`

**Headers:**
```
Authorization: Bearer <FLEET_MANAGER_TOKEN>
```

**Request Body:**
```json
{
  "vehicleId": "<VEHICLE_ID>",
  "driverId": "<DRIVER_USER_ID>",
  "origin": "Warehouse A, 123 Main St",
  "destination": "Delivery Point B, 456 Oak Ave",
  "startTime": "2024-01-15T09:00:00Z",
  "estimatedEndTime": "2024-01-15T15:00:00Z",
  "status": "pending"
}
```

**Expected Response:** `201 Created`
```json
{
  "message": "Trip created successfully",
  "trip": {
    "_id": "...",
    "vehicleId": {...},
    "driverId": {...},
    "origin": "Warehouse A, 123 Main St",
    "destination": "Delivery Point B, 456 Oak Ave",
    "status": "pending",
    ...
  }
}
```

**Screenshot Points:**
- ✅ Request with populated vehicle and driver
- ✅ Response showing trip with nested data (Mongoose population)
- ✅ **Save trip ID** for later tests

---

#### Test 2.3.2: Create Multiple Trips

Create 5-7 trips with different statuses:
- Trip 1: pending
- Trip 2: in_progress
- Trip 3: completed
- Trip 4: cancelled

**Screenshot:** List of trips

---

#### Test 2.3.3: Get All Trips (Pagination)

**Endpoint:** `GET /api/trips?page=1&limit=10`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "trips": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalTrips": 7,
    "limit": 10
  }
}
```

**Screenshot:** Paginated trips list

---

#### Test 2.3.4: Get Trip by ID (With Population)

**Endpoint:** `GET /api/trips/<TRIP_ID>`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "trip": {
    "_id": "...",
    "vehicleId": {
      "_id": "...",
      "vehicleNumber": "VEH-001",
      "type": "Truck",
      ...
    },
    "driverId": {
      "_id": "...",
      "name": "Driver One",
      "email": "driver1@fleet.com",
      ...
    },
    ...
  }
}
```

**Screenshot Points:**
- ✅ Trip details with populated vehicle
- ✅ Trip details with populated driver
- ✅ Nested relationship data visible

---

#### Test 2.3.5: Update Trip

**Endpoint:** `PUT /api/trips/<TRIP_ID>`

**Headers:**
```
Authorization: Bearer <FLEET_MANAGER_TOKEN>
```

**Request Body:**
```json
{
  "destination": "Updated Destination, 789 New St",
  "estimatedEndTime": "2024-01-15T16:00:00Z"
}
```

**Expected Response:** `200 OK`

**Screenshot:** Updated trip

---

#### Test 2.3.6: Delete Trip

**Endpoint:** `DELETE /api/trips/<TRIP_ID>`

**Headers:**
```
Authorization: Bearer <FLEET_MANAGER_TOKEN>
```

**Expected Response:** `200 OK`

**Screenshot:** Success message

---

### ✅ Test 2.4: Trip Status Management

#### Test 2.4.1: Start Trip

**Endpoint:** `PATCH /api/trips/<TRIP_ID>/start`

**Headers:**
```
Authorization: Bearer <DRIVER_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "message": "Trip started successfully",
  "trip": {
    "_id": "...",
    "status": "in_progress",
    "startTime": "2024-01-15T09:05:00Z",
    ...
  }
}
```

**Screenshot Points:**
- ✅ Status changed to "in_progress"
- ✅ startTime populated automatically

---

#### Test 2.4.2: Complete Trip

**Endpoint:** `PATCH /api/trips/<TRIP_ID>/complete`

**Headers:**
```
Authorization: Bearer <DRIVER_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "message": "Trip completed successfully",
  "trip": {
    "_id": "...",
    "status": "completed",
    "endTime": "2024-01-15T15:30:00Z",
    ...
  }
}
```

**Screenshot:** Completed trip with endTime

---

#### Test 2.4.3: Cancel Trip

**Endpoint:** `PATCH /api/trips/<TRIP_ID>/cancel`

**Headers:**
```
Authorization: Bearer <FLEET_MANAGER_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "message": "Trip cancelled successfully",
  "trip": {
    "_id": "...",
    "status": "cancelled",
    ...
  }
}
```

**Screenshot:** Cancelled trip

---

### ✅ Test 2.5: Relationship Queries

#### Test 2.5.1: Get Trips by Driver

**Endpoint:** `GET /api/trips/driver/<DRIVER_USER_ID>`

**Headers:**
```
Authorization: Bearer <DRIVER_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "trips": [
    {
      "_id": "...",
      "vehicleId": {...},
      "driverId": {...},
      ...
    }
  ]
}
```

**Screenshot Points:**
- ✅ All trips for specific driver
- ✅ Shows one driver → many trips relationship

---

#### Test 2.5.2: Get Trips by Vehicle

**Endpoint:** `GET /api/trips/vehicle/<VEHICLE_ID>`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "trips": [...]
}
```

**Screenshot Points:**
- ✅ All trips for specific vehicle
- ✅ Shows one vehicle → many trips relationship

---

#### Test 2.5.3: Get Vehicle with Trip History

**Endpoint:** `GET /api/vehicles/<VEHICLE_ID>/trips`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "vehicle": {
    "_id": "...",
    "vehicleNumber": "VEH-001",
    ...
  },
  "trips": [...]
}
```

**Screenshot:** Vehicle with associated trips

---

#### Test 2.5.4: Fleet Manager Dashboard (Aggregation)

**Endpoint:** `GET /api/vehicles/dashboard/overview`

**Headers:**
```
Authorization: Bearer <FLEET_MANAGER_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "totalVehicles": 5,
  "availableVehicles": 2,
  "inUseVehicles": 2,
  "maintenanceVehicles": 1,
  "totalDrivers": 3,
  ...
}
```

**Screenshot:** Dashboard statistics

---

### ✅ **WEEK 2 SCREENSHOT CHECKLIST:**
- [ ] Create vehicle (success)
- [ ] Create vehicle as driver (error)
- [ ] Multiple vehicles created
- [ ] Get all vehicles (with pagination)
- [ ] Get vehicle by ID
- [ ] Update vehicle
- [ ] Delete vehicle
- [ ] Get available vehicles
- [ ] Get vehicles by status
- [ ] Assign vehicle to driver
- [ ] Unassign vehicle
- [ ] Create trip (with populated data)
- [ ] Multiple trips created
- [ ] Get all trips (with pagination)
- [ ] Get trip by ID (with population)
- [ ] Update trip
- [ ] Delete trip
- [ ] Start trip (status change)
- [ ] Complete trip (status change)
- [ ] Cancel trip
- [ ] Get trips by driver (relationship)
- [ ] Get trips by vehicle (relationship)
- [ ] Vehicle with trip history
- [ ] Fleet Manager dashboard

---

## 🔔 **WEEK 3: REAL-TIME UPDATES & NOTIFICATIONS**

### ✅ Test 3.1: Socket.IO Real-Time Connection

#### Test 3.1.1: Connect to Socket.IO Server

**Tool:** Open `socket-test.html` in browser

**Steps:**
1. Get JWT token from login endpoint
2. Paste token in the HTML form
3. Click "Connect"
4. Verify connection status shows "Connected"

**Expected:**
- ✅ Connection status: "Connected"
- ✅ Message: "✅ Connected to server successfully!"
- ✅ Connection indicator (green)

**Screenshot Points:**
- ✅ HTML page showing connected state
- ✅ Messages area showing connection success

---

#### Test 3.1.2: Test Trip Status Update via Socket.IO

**Prerequisites:** 
- Connected to Socket.IO
- Valid trip ID

**Steps:**
1. Enter trip ID in the form
2. Click "Test Trip Status Update"
3. Monitor messages area

**Expected Events:**
- ✅ `trip_status_update` sent
- ✅ `trip_status_changed` received
- ✅ `trip_status_confirmed` received

**Screenshot Points:**
- ✅ Message showing status update sent
- ✅ Real-time confirmation messages
- ✅ JSON data in messages

---

#### Test 3.1.3: Test Location Update

**Steps:**
1. Enter trip ID
2. Click "Test Location Update"

**Expected:**
- ✅ `location_update` sent
- ✅ `driver_location_update` received with coordinates

**Screenshot:** Location update messages

---

#### Test 3.1.4: Test Emergency Alert

**Steps:**
1. Enter trip ID
2. Click "Test Emergency Alert"

**Expected:**
- ✅ `emergency_alert` sent
- ✅ `emergency_alert` broadcast received
- ✅ Alert message displayed

**Screenshot:** Emergency alert messages

---

#### Test 3.1.5: Test Maintenance Alert

**Steps:**
1. Enter vehicle ID
2. Click "Test Maintenance Alert"

**Expected:**
- ✅ `maintenance_alert` sent
- ✅ `maintenance_alert` broadcast received

**Screenshot:** Maintenance alert messages

---

### ✅ Test 3.2: Real-Time Trip Tracking (Multiple Clients)

#### Test 3.2.1: Driver Updates Trip Status

**Setup:**
- Client 1: Driver connected (Socket.IO)
- Client 2: Fleet Manager connected (Socket.IO or API)

**Steps:**
1. Driver updates trip status via Socket.IO
2. Fleet Manager should receive real-time update

**Screenshot Points:**
- ✅ Driver client sending update
- ✅ Fleet Manager client receiving update
- ✅ Both clients showing synchronized data

---

### ✅ Test 3.3: Email Notifications

#### Test 3.3.1: Trip Assignment Email

**Prerequisites:** Nodemailer configured with SMTP settings

**Steps:**
1. Create a new trip assigned to a driver
2. Check driver's email inbox

**Expected:**
- ✅ Email received with trip details
- ✅ Email contains: trip ID, origin, destination, vehicle info

**Screenshot Points:**
- ✅ Email in inbox
- ✅ Email content with trip details
- ✅ Server logs showing email sent

---

#### Test 3.3.2: Password Reset Email

**Steps:**
1. Request password reset via API
2. Check email inbox

**Expected:**
- ✅ Password reset email received
- ✅ Contains reset link/token

**Screenshot:** Password reset email

---

### ✅ Test 3.4: Analytics Endpoints

#### Test 3.4.1: Driver Trip Statistics

**Endpoint:** `GET /api/analytics/driver/<DRIVER_ID>/stats`

**Headers:**
```
Authorization: Bearer <DRIVER_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "driver": {
    "_id": "...",
    "name": "Driver One",
    ...
  },
  "totalTrips": 10,
  "completedTrips": 8,
  "pendingTrips": 1,
  "inProgressTrips": 1,
  "cancelledTrips": 0,
  "completionRate": 80
}
```

**Screenshot:** Driver statistics

---

#### Test 3.4.2: Driver Performance Analytics (Advanced)

**Endpoint:** `GET /api/analytics/driver/<DRIVER_ID>/performance`

**Headers:**
```
Authorization: Bearer <FLEET_MANAGER_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "driver": {...},
  "performance": {
    "averageTripDuration": 6.5,
    "totalDistance": 1500,
    "onTimeDeliveryRate": 85,
    "tripHistory": [...]
  }
}
```

**Screenshot:** Advanced driver analytics

---

#### Test 3.4.3: Vehicle Usage Statistics

**Endpoint:** `GET /api/analytics/vehicle/<VEHICLE_ID>/stats`

**Headers:**
```
Authorization: Bearer <FLEET_MANAGER_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "vehicle": {...},
  "totalTrips": 15,
  "totalDistance": 2500,
  "averageTripsPerMonth": 5,
  "utilizationRate": 75
}
```

**Screenshot:** Vehicle statistics

---

#### Test 3.4.4: Vehicle Utilization Analytics

**Endpoint:** `GET /api/analytics/vehicle/<VEHICLE_ID>/utilization`

**Headers:**
```
Authorization: Bearer <FLEET_MANAGER_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "vehicle": {...},
  "utilization": {
    "dailyUtilization": [...],
    "monthlyUtilization": [...],
    "peakHours": [...]
  }
}
```

**Screenshot:** Utilization analytics

---

#### Test 3.4.5: Pending and Overdue Trips

**Endpoint:** `GET /api/analytics/trips/pending-overdue`

**Headers:**
```
Authorization: Bearer <FLEET_MANAGER_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "pendingTrips": [...],
  "overdueTrips": [...],
  "summary": {
    "totalPending": 3,
    "totalOverdue": 1
  }
}
```

**Screenshot Points:**
- ✅ List of pending trips
- ✅ List of overdue trips
- ✅ Summary statistics

---

#### Test 3.4.6: Fleet-Wide Analytics Dashboard

**Endpoint:** `GET /api/analytics/fleet/dashboard`

**Headers:**
```
Authorization: Bearer <FLEET_MANAGER_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "fleetOverview": {
    "totalVehicles": 10,
    "totalDrivers": 5,
    "activeTrips": 3,
    "completedTripsToday": 12
  },
  "performance": {
    "averageTripDuration": 6.2,
    "onTimeDeliveryRate": 88
  },
  "alerts": {
    "overdueTrips": 1,
    "maintenanceDue": 2
  }
}
```

**Screenshot:** Complete fleet dashboard

---

#### Test 3.4.7: Maintenance Analytics

**Endpoint:** `GET /api/analytics/maintenance/analytics`

**Headers:**
```
Authorization: Bearer <FLEET_MANAGER_TOKEN>
```

**Expected Response:** `200 OK`
```json
{
  "maintenanceStats": {
    "vehiclesDue": [...],
    "vehiclesInMaintenance": [...],
    "maintenanceCost": 5000
  }
}
```

**Screenshot:** Maintenance analytics

---

### ✅ Test 3.5: Alert System

#### Test 3.5.1: Trigger Maintenance Alert

**Endpoint:** `POST /api/analytics/maintenance/alert`

**Headers:**
```
Authorization: Bearer <DRIVER_TOKEN>
```

**Request Body:**
```json
{
  "vehicleId": "<VEHICLE_ID>",
  "maintenanceType": "oil_change",
  "description": "Oil change due - 5000 miles exceeded"
}
```

**Expected Response:** `200 OK`
```json
{
  "message": "Maintenance alert triggered successfully",
  "alert": {...}
}
```

**Screenshot Points:**
- ✅ API response
- ✅ Alert notification (if email configured)
- ✅ Socket.IO broadcast (check connected clients)

---

### ✅ **WEEK 3 SCREENSHOT CHECKLIST:**
- [ ] Socket.IO connection successful
- [ ] Trip status update via Socket.IO
- [ ] Location update via Socket.IO
- [ ] Emergency alert via Socket.IO
- [ ] Maintenance alert via Socket.IO
- [ ] Real-time update received by Fleet Manager
- [ ] Trip assignment email notification
- [ ] Password reset email
- [ ] Driver trip statistics
- [ ] Driver performance analytics
- [ ] Vehicle usage statistics
- [ ] Vehicle utilization analytics
- [ ] Pending/overdue trips
- [ ] Fleet-wide dashboard
- [ ] Maintenance analytics
- [ ] Maintenance alert trigger

---

## ✅ **WEEK 4: TESTING & OPTIMIZATION**

### ✅ Test 4.1: Input Validation

#### Test 4.1.1: Vehicle Creation Validation (Joi)

**Endpoint:** `POST /api/vehicles`

**Test Case 1: Missing Required Fields**
```json
{
  "vehicleNumber": "VEH-999"
}
```

**Expected:** `400 Bad Request` with validation errors

**Screenshot:** Validation error details

---

**Test Case 2: Invalid Vehicle Type**
```json
{
  "vehicleNumber": "VEH-999",
  "type": "Spaceship",
  "status": "available"
}
```

**Expected:** `400 Bad Request` - Invalid type

**Screenshot:** Type validation error

---

**Test Case 3: Invalid Status**
```json
{
  "vehicleNumber": "VEH-999",
  "type": "Truck",
  "status": "invalid_status"
}
```

**Expected:** `400 Bad Request` - Invalid status

**Screenshot:** Status validation error

---

#### Test 4.1.2: Trip Creation Validation

**Test Case 1: Missing Driver ID**
```json
{
  "vehicleId": "<VEHICLE_ID>",
  "origin": "Location A",
  "destination": "Location B"
}
```

**Expected:** `400 Bad Request`

**Screenshot:** Validation error

---

**Test Case 2: Invalid Date Format**
```json
{
  "vehicleId": "<VEHICLE_ID>",
  "driverId": "<DRIVER_ID>",
  "origin": "Location A",
  "destination": "Location B",
  "startTime": "invalid-date"
}
```

**Expected:** `400 Bad Request`

**Screenshot:** Date validation error

---

### ✅ Test 4.2: Error Handling

#### Test 4.2.1: Non-Existent Resource

**Endpoint:** `GET /api/vehicles/invalid_id_12345`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Expected Response:** `404 Not Found`
```json
{
  "error": "Vehicle not found"
}
```

**Screenshot:** Not found error

---

#### Test 4.2.2: Unauthorized Access

**Endpoint:** `DELETE /api/vehicles/<VEHICLE_ID>`

**Headers:**
```
Authorization: Bearer <DRIVER_TOKEN>
```

**Expected Response:** `403 Forbidden`
```json
{
  "error": "Access denied. Admin role required."
}
```

**Screenshot:** Forbidden error

---

#### Test 4.2.3: Server Error Handling

Test with invalid data that causes server error (if possible)

**Screenshot:** Server error response (500) with proper error message

---

### ✅ Test 4.3: Database Optimization

#### Test 4.3.1: Verify MongoDB Indexes

**Tool:** MongoDB Compass or MongoDB shell

**Commands:**
```javascript
use fleet_management
db.vehicles.getIndexes()
db.trips.getIndexes()
db.users.getIndexes()
```

**Expected:**
- ✅ Indexes on `email` in users
- ✅ Indexes on `vehicleNumber` in vehicles
- ✅ Indexes on `driverId` in trips
- ✅ Indexes on `vehicleId` in trips
- ✅ Indexes on `status` in trips

**Screenshot:** Index list from MongoDB

---

#### Test 4.3.2: Query Performance Test

**Test:** Get all trips with populated data

**Endpoint:** `GET /api/trips`

**Measure:**
- Response time
- Database query time (if visible in logs)

**Screenshot:** 
- ✅ Response time in Postman
- ✅ Server logs showing query execution time

---

### ✅ Test 4.4: Pagination

#### Test 4.4.1: Trip Pagination

**Endpoint:** `GET /api/trips?page=1&limit=5`

**Expected Response:**
```json
{
  "trips": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalTrips": 15,
    "limit": 5
  }
}
```

**Screenshot Points:**
- ✅ Page 1 results
- ✅ Pagination metadata

**Test Multiple Pages:**
- `?page=2&limit=5`
- `?page=3&limit=5`

**Screenshot:** Different pages showing different results

---

#### Test 4.4.2: Vehicle Pagination

**Endpoint:** `GET /api/vehicles?page=1&limit=3`

**Screenshot:** Paginated vehicle list

---

### ✅ Test 4.5: Filtering

#### Test 4.5.1: Filter Trips by Status

**Endpoint:** `GET /api/trips?status=completed`

**Expected:** Only completed trips

**Screenshot:** Filtered results

---

#### Test 4.5.2: Filter Vehicles by Type

**Endpoint:** `GET /api/vehicles?type=Truck`

**Expected:** Only trucks

**Screenshot:** Filtered results

---

#### Test 4.5.3: Analytics with Date Range

**Endpoint:** `GET /api/analytics/driver/<DRIVER_ID>/performance?startDate=2024-01-01&endDate=2024-01-31`

**Expected:** Analytics filtered by date range

**Screenshot:** Filtered analytics

---

### ✅ Test 4.6: Unit & Integration Tests

#### Test 4.6.1: Run Test Suite

**Command:**
```bash
npm test
```

**Expected:** All tests pass

**Screenshot Points:**
- ✅ Terminal showing test results
- ✅ Test coverage report
- ✅ All passing tests (green checkmarks)

---

#### Test 4.6.2: Test Coverage Report

**Command:**
```bash
npm run test:coverage
```

**Expected:** Coverage report generated

**Screenshot:**
- ✅ Coverage summary
- ✅ Coverage by file
- ✅ HTML coverage report (if generated)

---

### ✅ Test 4.7: API Documentation Test

#### Test 4.7.1: All Endpoints Accessible

Create a comprehensive list of all endpoints and verify each:

**Authentication:**
- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] GET /api/auth/profile
- [ ] POST /api/auth/forgot-password
- [ ] POST /api/auth/reset-password

**Vehicles:**
- [ ] GET /api/vehicles
- [ ] GET /api/vehicles/:id
- [ ] POST /api/vehicles
- [ ] PUT /api/vehicles/:id
- [ ] DELETE /api/vehicles/:id
- [ ] POST /api/vehicles/:id/assign
- [ ] POST /api/vehicles/:id/unassign
- [ ] GET /api/vehicles/available
- [ ] GET /api/vehicles/status/:status

**Trips:**
- [ ] GET /api/trips
- [ ] GET /api/trips/:id
- [ ] POST /api/trips
- [ ] PUT /api/trips/:id
- [ ] DELETE /api/trips/:id
- [ ] PATCH /api/trips/:id/start
- [ ] PATCH /api/trips/:id/complete
- [ ] PATCH /api/trips/:id/cancel
- [ ] GET /api/trips/driver/:driverId
- [ ] GET /api/trips/vehicle/:vehicleId

**Analytics:**
- [ ] GET /api/analytics/driver/:driverId/stats
- [ ] GET /api/analytics/driver/:driverId/performance
- [ ] GET /api/analytics/vehicle/:vehicleId/stats
- [ ] GET /api/analytics/vehicle/:vehicleId/utilization
- [ ] GET /api/analytics/trips/pending-overdue
- [ ] GET /api/analytics/fleet/dashboard
- [ ] GET /api/analytics/maintenance/analytics
- [ ] POST /api/analytics/maintenance/alert

**Screenshot:** Checklist with all endpoints verified

---

### ✅ **WEEK 4 SCREENSHOT CHECKLIST:**
- [ ] Input validation errors (multiple scenarios)
- [ ] 404 Not Found error
- [ ] 403 Forbidden error
- [ ] 500 Server error (if applicable)
- [ ] MongoDB indexes list
- [ ] Query performance metrics
- [ ] Pagination (multiple pages)
- [ ] Filtering results
- [ ] Test suite execution (all passing)
- [ ] Test coverage report
- [ ] All endpoints verified

---

## 📊 **COMPREHENSIVE TESTING SUMMARY**

### **Complete Feature Verification Checklist:**

#### **Week 1: Authentication ✅**
- [x] User registration (all roles)
- [x] User login (all roles)
- [x] JWT token authentication
- [x] Role-based access control
- [x] Password reset flow
- [x] Input validation
- [x] Error handling

#### **Week 2: Vehicles & Trips ✅**
- [x] Vehicle CRUD operations
- [x] Trip CRUD operations
- [x] Vehicle assignment/unassignment
- [x] Trip status management
- [x] Mongoose population (nested queries)
- [x] Relationship queries (driver → trips, vehicle → trips)
- [x] Pagination
- [x] Filtering

#### **Week 3: Real-Time & Notifications ✅**
- [x] Socket.IO connection
- [x] Real-time trip status updates
- [x] Real-time location updates
- [x] Emergency alerts
- [x] Maintenance alerts
- [x] Email notifications (trip assignment, password reset)
- [x] Driver analytics
- [x] Vehicle analytics
- [x] Fleet dashboard
- [x] Pending/overdue trips
- [x] Maintenance analytics

#### **Week 4: Testing & Optimization ✅**
- [x] Input validation (Joi)
- [x] Error handling
- [x] MongoDB indexes
- [x] Query optimization
- [x] Pagination
- [x] Filtering
- [x] Unit tests
- [x] Integration tests
- [x] Test coverage

---

## 🎯 **SCREENSHOT ORGANIZATION TIPS**

### Folder Structure:
```
screenshots/
├── Week1_Authentication/
│   ├── 1_registration_admin.png
│   ├── 2_login_success.png
│   └── ...
├── Week2_Vehicles_Trips/
│   ├── 1_create_vehicle.png
│   ├── 2_trip_with_population.png
│   └── ...
├── Week3_Realtime_Notifications/
│   ├── 1_socket_connection.png
│   ├── 2_email_notification.png
│   └── ...
└── Week4_Testing_Optimization/
    ├── 1_validation_errors.png
    ├── 2_test_results.png
    └── ...
```

### Naming Convention:
- `Week{Number}_{Category}_{TestNumber}_{Description}.png`
- Example: `Week1_Authentication_01_Register_Admin.png`

---

## 🔍 **QUICK TEST COMMANDS**

### Start Server:
```bash
npm start
# or
npm run dev
```

### Run Tests:
```bash
npm test
npm run test:coverage
```

### Check MongoDB Connection:
```bash
mongosh
use fleet_management
db.vehicles.countDocuments()
db.trips.countDocuments()
db.users.countDocuments()
```

---

## ✅ **FINAL VERIFICATION**

Before considering testing complete, ensure:

1. **All endpoints tested** - Every route in all route files
2. **All roles tested** - Admin, Fleet Manager, Driver
3. **All error cases tested** - Validation, unauthorized, not found
4. **Real-time features working** - Socket.IO connections and updates
5. **Email notifications working** - If SMTP configured
6. **Analytics returning data** - All aggregation queries
7. **Database relationships correct** - Population working
8. **Security working** - Authentication and authorization
9. **Performance acceptable** - Queries optimized with indexes
10. **Tests passing** - All unit and integration tests

---

## 📝 **NOTES**

- **Take screenshots at every major step** - Better to have more than less
- **Document any issues** - Note bugs or unexpected behavior
- **Test edge cases** - Empty data, invalid inputs, boundary values
- **Test with real data** - Create realistic scenarios
- **Verify database changes** - Check MongoDB after operations
- **Monitor server logs** - Watch for errors or warnings
- **Test across different roles** - Ensure proper access control

---

**Good luck with your testing! 🚀**

