# Thunder Client API Testing Guide

## Prerequisites
1. **Start the server**: `npm run dev`
2. **Set up environment variables** in `.env`:
   ```
   MONGO_URI=mongodb://localhost:27017/fleet-management
   JWT_SECRET=your-secret-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

## Step-by-Step Testing Guide

### 1. AUTHENTICATION ENDPOINTS

#### 1.1 Register Users (Create Test Data)
**Method**: `POST`
**URL**: `http://localhost:4000/api/auth/register`
**Headers**: 
```
Content-Type: application/json
```
**Body** (Admin):
```json
{
  "name": "Fleet Admin",
  "email": "admin@gmail.com",
  "password": "Admin@123",
  "role": "admin"
}
```

**Body** (Fleet Manager):
```json
{
  "name": "Fleet Manager",
  "email": "manager@yahoo.com",
  "password": "Manager@123",
  "role": "fleet_manager"
}
```

**Body** (Driver):
```json
{
  "name": "John Driver",
  "email": "driver@outlook.com",
  "password": "Driver@123",
  "role": "driver"
}
```

#### 1.2 Login (Get JWT Token)
**Method**: `POST`
**URL**: `http://localhost:4000/api/auth/login`
**Headers**: 
```
Content-Type: application/json
```
**Body**:
```json
{
  "email": "admin@gmail.com",
  "password": "Admin@123"
}
```
**Response**: Copy the `token` from response for Authorization header

#### 1.3 Test Role-Based Access
**Method**: `GET`
**URL**: `http://localhost:4000/api/auth/admin-only`
**Headers**: 
```
Authorization: Bearer <paste_token_here>
```

#### 1.4 Forgot Password Flow
**Method**: `POST`
**URL**: `http://localhost:4000/api/auth/forgot-password`
**Headers**: 
```
Content-Type: application/json
```
**Body**:
```json
{
  "email": "admin@gmail.com"
}
```

### 2. VEHICLE MANAGEMENT ENDPOINTS

#### 2.1 Create Vehicle (Admin/Fleet Manager)
**Method**: `POST`
**URL**: `http://localhost:4000/api/vehicles`
**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```
**Body**:
```json
{
  "vehicleNumber": "VH001",
  "type": "sedan",
  "make": "Toyota",
  "model": "Camry",
  "year": 2022,
  "color": "Silver",
  "licensePlate": "ABC123",
  "vin": "1HGBH41JXMN109186",
  "fuelType": "gasoline",
  "fuelCapacity": 60,
  "mileage": 15000,
  "lastServiceDate": "2024-01-15",
  "nextServiceDue": "2024-07-15",
  "insuranceExpiry": "2024-12-31",
  "registrationExpiry": "2024-12-31",
  "notes": "Regular fleet vehicle"
}
```

#### 2.2 Create Another Vehicle
**Method**: `POST`
**URL**: `http://localhost:4000/api/vehicles`
**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```
**Body**:
```json
{
  "vehicleNumber": "VH002",
  "type": "suv",
  "make": "Ford",
  "model": "Explorer",
  "year": 2023,
  "color": "Black",
  "licensePlate": "XYZ789",
  "vin": "1FMCU9GD5KUA12345",
  "fuelType": "gasoline",
  "fuelCapacity": 80,
  "mileage": 8000,
  "lastServiceDate": "2024-02-01",
  "nextServiceDue": "2024-08-01",
  "insuranceExpiry": "2024-11-30",
  "registrationExpiry": "2024-11-30",
  "notes": "Premium SUV for executives"
}
```

#### 2.3 Get All Vehicles
**Method**: `GET`
**URL**: `http://localhost:4000/api/vehicles`
**Headers**: 
```
Authorization: Bearer <any_token>
```

#### 2.4 Get Vehicle by ID
**Method**: `GET`
**URL**: `http://localhost:4000/api/vehicles/<vehicle_id_from_step_2.1>`
**Headers**: 
```
Authorization: Bearer <any_token>
```

#### 2.5 Assign Vehicle to Driver
**Method**: `POST`
**URL**: `http://localhost:4000/api/vehicles/<vehicle_id>/assign`
**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```
**Body**:
```json
{
  "driverId": "<driver_id_from_registration>"
}
```

#### 2.6 Get Available Vehicles
**Method**: `GET`
**URL**: `http://localhost:4000/api/vehicles/available`
**Headers**: 
```
Authorization: Bearer <any_token>
```

#### 2.7 Get Vehicles by Status
**Method**: `GET`
**URL**: `http://localhost:4000/api/vehicles/status/assigned`
**Headers**: 
```
Authorization: Bearer <any_token>
```

#### 2.8 Fleet Manager Dashboard
**Method**: `GET`
**URL**: `http://localhost:4000/api/vehicles/dashboard/overview`
**Headers**: 
```
Authorization: Bearer <fleet_manager_token>
```

### 3. TRIP MANAGEMENT ENDPOINTS

#### 3.1 Create Trip (Fleet Manager/Admin)
**Method**: `POST`
**URL**: `http://localhost:4000/api/trips`
**Headers**: 
```
Authorization: Bearer <fleet_manager_token>
Content-Type: application/json
```
**Body**:
```json
{
  "vehicleId": "<vehicle_id_from_step_2.1>",
  "driverId": "<driver_id_from_registration>",
  "origin": "New York",
  "destination": "Boston",
  "startTime": "2024-03-15T09:00:00Z",
  "endTime": "2024-03-15T14:00:00Z",
  "distance": 215,
  "fuelConsumed": 12.5,
  "notes": "Business trip to Boston"
}
```

#### 3.2 Create Another Trip
**Method**: `POST`
**URL**: `http://localhost:4000/api/trips`
**Headers**: 
```
Authorization: Bearer <fleet_manager_token>
Content-Type: application/json
```
**Body**:
```json
{
  "vehicleId": "<vehicle_id_from_step_2.2>",
  "driverId": "<driver_id_from_registration>",
  "origin": "Boston",
  "destination": "Philadelphia",
  "startTime": "2024-03-16T08:00:00Z",
  "endTime": "2024-03-16T16:00:00Z",
  "distance": 300,
  "fuelConsumed": 18.0,
  "notes": "Client meeting trip"
}
```

#### 3.3 Get All Trips
**Method**: `GET`
**URL**: `http://localhost:4000/api/trips`
**Headers**: 
```
Authorization: Bearer <any_token>
```

#### 3.4 Get Trips with Filtering
**Method**: `GET`
**URL**: `http://localhost:4000/api/trips?status=scheduled&page=1&limit=10`
**Headers**: 
```
Authorization: Bearer <any_token>
```

#### 3.5 Get Trip by ID
**Method**: `GET`
**URL**: `http://localhost:4000/api/trips/<trip_id_from_step_3.1>`
**Headers**: 
```
Authorization: Bearer <any_token>
```

#### 3.6 Start Trip (Driver/Fleet Manager/Admin)
**Method**: `PATCH`
**URL**: `http://localhost:4000/api/trips/<trip_id>/start`
**Headers**: 
```
Authorization: Bearer <driver_token>
```

#### 3.7 Complete Trip
**Method**: `PATCH`
**URL**: `http://localhost:4000/api/trips/<trip_id>/complete`
**Headers**: 
```
Authorization: Bearer <driver_token>
Content-Type: application/json
```
**Body**:
```json
{
  "distance": 220,
  "fuelConsumed": 13.0,
  "notes": "Trip completed successfully with actual data"
}
```

#### 3.8 Cancel Trip (Fleet Manager/Admin)
**Method**: `PATCH`
**URL**: `http://localhost:4000/api/trips/<trip_id>/cancel`
**Headers**: 
```
Authorization: Bearer <fleet_manager_token>
```

### 4. RELATIONSHIP QUERIES

#### 4.1 Get Trips by Driver
**Method**: `GET`
**URL**: `http://localhost:4000/api/trips/driver/<driver_id>`
**Headers**: 
```
Authorization: Bearer <any_token>
```

#### 4.2 Get Trips by Vehicle
**Method**: `GET`
**URL**: `http://localhost:4000/api/trips/vehicle/<vehicle_id>`
**Headers**: 
```
Authorization: Bearer <any_token>
```

#### 4.3 Get Vehicle with Trip History
**Method**: `GET`
**URL**: `http://localhost:4000/api/vehicles/<vehicle_id>/trips`
**Headers**: 
```
Authorization: Bearer <any_token>
```

#### 4.4 Get Driver Details with Vehicle and Trips
**Method**: `GET`
**URL**: `http://localhost:4000/api/vehicles/driver/<driver_id>/details`
**Headers**: 
```
Authorization: Bearer <fleet_manager_token>
```

#### 4.5 Get Vehicles by Type with Statistics
**Method**: `GET`
**URL**: `http://localhost:4000/api/vehicles/type/sedan/stats`
**Headers**: 
```
Authorization: Bearer <any_token>
```

### 5. USER MANAGEMENT (Admin Only)

#### 5.1 Get All Users
**Method**: `GET`
**URL**: `http://localhost:4000/api/users`
**Headers**: 
```
Authorization: Bearer <admin_token>
```

#### 5.2 Get Users by Role
**Method**: `GET`
**URL**: `http://localhost:4000/api/users/role/driver`
**Headers**: 
```
Authorization: Bearer <admin_token>
```

#### 5.3 Get User by ID
**Method**: `GET`
**URL**: `http://localhost:4000/api/users/<user_id>`
**Headers**: 
```
Authorization: Bearer <admin_token>
```

### 6. ERROR TESTING EXAMPLES

#### 6.1 Test Wrong Password (Should show forgot password option)
**Method**: `POST`
**URL**: `http://localhost:4000/api/auth/login`
**Headers**: 
```
Content-Type: application/json
```
**Body**:
```json
{
  "email": "admin@gmail.com",
  "password": "WrongPassword123"
}
```
**Expected**: Response should include `forgotPasswordAvailable: true`

#### 6.2 Test Unauthorized Access
**Method**: `GET`
**URL**: `http://localhost:4000/api/users`
**Headers**: 
```
Authorization: Bearer <driver_token>
```
**Expected**: 403 Forbidden

#### 6.3 Test Invalid Vehicle Data
**Method**: `POST`
**URL**: `http://localhost:4000/api/vehicles`
**Headers**: 
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```
**Body**:
```json
{
  "vehicleNumber": "VH003",
  "type": "invalid_type",
  "make": "Toyota",
  "model": "Camry",
  "year": 1800,
  "color": "Silver",
  "licensePlate": "DEF456",
  "vin": "invalid_vin"
}
```
**Expected**: Validation errors

## Thunder Client Setup Tips

### 1. Environment Variables
Create environment variables in Thunder Client:
- `base_url`: `http://localhost:4000`
- `admin_token`: `<paste_admin_token_here>`
- `manager_token`: `<paste_manager_token_here>`
- `driver_token`: `<paste_driver_token_here>`

### 2. Collection Organization
Create folders in Thunder Client:
- **Authentication** (register, login, forgot password)
- **Vehicles** (CRUD, assignments, dashboard)
- **Trips** (CRUD, lifecycle, relationships)
- **Users** (admin management)
- **Testing** (error cases, edge cases)

### 3. Request Templates
Save common headers as templates:
- **Auth Required**: `Authorization: Bearer {{admin_token}}`
- **JSON Content**: `Content-Type: application/json`

### 4. Testing Sequence
1. **Setup**: Register users, create vehicles
2. **Basic CRUD**: Test all create, read, update, delete operations
3. **Relationships**: Test assignments and nested queries
4. **Workflows**: Complete trip lifecycle (create → start → complete)
5. **Error Cases**: Test validation, authorization, edge cases

## Common Response Formats

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error description",
  "errors": ["Specific error details"]
}
```

### Login Response
```json
{
  "message": "Login successful",
  "user": { "id": "...", "name": "...", "role": "..." },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Failed Login Response
```json
{
  "message": "Invalid credentials",
  "forgotPasswordAvailable": true,
  "forgotPasswordMessage": "Having trouble remembering your password? You can reset it."
}
```
