# Week 3 - New Endpoints Quick Reference

## Advanced Analytics Endpoints (New)

### 1. Driver Performance Analytics
```
GET /api/analytics/driver/:driverId/performance
```
**Query Parameters:**
- `startDate` (optional): Start date filter (ISO format)
- `endDate` (optional): End date filter (ISO format)
- `groupBy` (optional): Group by 'day', 'week', 'month', or 'year' (default: 'month')

**Response:** Advanced driver performance metrics with time-based grouping

### 2. Vehicle Utilization Analytics
```
GET /api/analytics/vehicle/:vehicleId/utilization
```
**Query Parameters:**
- `startDate` (optional): Start date filter (ISO format)
- `endDate` (optional): End date filter (ISO format)

**Response:** Vehicle utilization metrics with status breakdown and utilization percentage

### 3. Maintenance Analytics
```
GET /api/analytics/maintenance/analytics
```
**Query Parameters:**
- `startDate` (optional): Start date filter (ISO format)
- `endDate` (optional): End date filter (ISO format)

**Response:** Maintenance analytics with overdue vehicles and service intervals

## Socket.IO Events

### Client → Server Events
- `trip_status_update`: Update trip status
- `location_update`: Send location data
- `emergency_alert`: Send emergency alert
- `maintenance_alert`: Send maintenance alert

### Server → Client Events
- `trip_assigned`: New trip assignment
- `trip_status_changed`: Trip status update
- `trip_status_confirmed`: Status update confirmation
- `driver_location_update`: Driver location update
- `emergency_alert`: Emergency alert broadcast
- `maintenance_alert`: Maintenance alert broadcast
- `driver_connected`: Driver connection notification
- `driver_disconnected`: Driver disconnection notification

## Email Notifications

### Automatic Triggers
- Trip assignment → Driver email
- Password reset request → User email
- Password reset confirmation → User email

### Manual Triggers
- Maintenance alerts → Fleet manager emails
- Overdue trip alerts → Fleet manager emails

## Validation Middleware (Joi)

### Available Validators
- `validateUser`: User registration/update
- `validateLogin`: Login credentials
- `validateForgotPassword`: Password reset request
- `validateResetPassword`: Password reset
- `validateVehicle`: Vehicle creation/update
- `validateTrip`: Trip creation
- `validateTripUpdate`: Trip updates
- `validateAnalyticsQuery`: Analytics query parameters

### Usage Example
```javascript
import { validateTrip } from '../middlewares/joiValidation.middleware.js';

router.post('/trips', validateTrip, createTrip);
```

## Testing Checklist

### Real-time Updates
- [ ] Driver Socket.IO connection
- [ ] Trip assignment notifications
- [ ] Status update broadcasts
- [ ] Location tracking
- [ ] Emergency alerts

### Email Notifications
- [ ] Trip assignment emails
- [ ] Password reset emails
- [ ] Maintenance alert emails
- [ ] Overdue trip alerts

### Analytics
- [ ] Driver performance analytics
- [ ] Vehicle utilization analytics
- [ ] Maintenance analytics
- [ ] Fleet-wide analytics
- [ ] Pending/overdue trips

### Validation
- [ ] User validation
- [ ] Vehicle validation
- [ ] Trip validation
- [ ] Query parameter validation

## Environment Variables Required

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-jwt-secret

# Database
MONGODB_URI=mongodb://localhost:27017/fleet-management

# Server
PORT=5000
NODE_ENV=development
```

## Sample Test Data

### Create Test Users
```bash
POST /api/auth/register
{
    "name": "John Driver",
    "email": "driver@test.com",
    "password": "Password123!",
    "role": "driver"
}
```

### Create Test Vehicle
```bash
POST /api/vehicles
{
    "vehicleNumber": "VH001",
    "type": "sedan",
    "make": "Toyota",
    "model": "Camry",
    "year": 2022,
    "color": "White",
    "licensePlate": "ABC123",
    "vin": "1HGBH41JXMN109186",
    "fuelType": "gasoline",
    "fuelCapacity": 60,
    "mileage": 15000
}
```

### Create Test Trip
```bash
POST /api/trips
{
    "vehicleId": "VEHICLE_ID",
    "driverId": "DRIVER_ID",
    "origin": "New York",
    "destination": "Boston",
    "startTime": "2024-01-15T10:00:00Z",
    "distance": 200,
    "notes": "Test trip for Week 3"
}
```
