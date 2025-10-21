# Quick Reference Card - Thunder Client

## Essential Credentials Setup

### 1. Environment Variables (.env file)
```
MONGO_URI=mongodb://localhost:27017/fleet-management
JWT_SECRET=your-secret-key-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=4000
NODE_ENV=development
```

### 2. Test Users (Register these first)
```json
// Admin User
{
  "name": "Fleet Admin",
  "email": "admin@gmail.com", 
  "password": "Admin@123",
  "role": "admin"
}

// Fleet Manager
{
  "name": "Fleet Manager",
  "email": "manager@yahoo.com",
  "password": "Manager@123", 
  "role": "fleet_manager"
}

// Driver
{
  "name": "John Driver",
  "email": "driver@outlook.com",
  "password": "Driver@123",
  "role": "driver"
}
```

## Thunder Client Environment Variables
Set these in Thunder Client:
- `base_url`: `http://localhost:4000`
- `admin_token`: `<paste_from_login_response>`
- `manager_token`: `<paste_from_login_response>`
- `driver_token`: `<paste_from_login_response>`

## Most Used Endpoints

### Authentication
```
POST {{base_url}}/api/auth/register
POST {{base_url}}/api/auth/login
POST {{base_url}}/api/auth/forgot-password
```

### Vehicles
```
GET {{base_url}}/api/vehicles
POST {{base_url}}/api/vehicles
GET {{base_url}}/api/vehicles/available
GET {{base_url}}/api/vehicles/dashboard/overview
```

### Trips
```
GET {{base_url}}/api/trips
POST {{base_url}}/api/trips
PATCH {{base_url}}/api/trips/{{trip_id}}/start
PATCH {{base_url}}/api/trips/{{trip_id}}/complete
```

## Common Headers
```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

## Sample Vehicle Data
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
  "mileage": 15000
}
```

## Sample Trip Data
```json
{
  "vehicleId": "<vehicle_id>",
  "driverId": "<driver_id>",
  "origin": "New York",
  "destination": "Boston", 
  "startTime": "2024-03-15T09:00:00Z",
  "endTime": "2024-03-15T14:00:00Z",
  "distance": 215,
  "fuelConsumed": 12.5,
  "notes": "Business trip"
}
```
