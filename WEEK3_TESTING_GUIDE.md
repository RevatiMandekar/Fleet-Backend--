# Week 3 - Real-time Updates & Notifications Testing Guide

## Overview
This guide will help you test all the implemented features for Week 3: Real-time Updates & Notifications.

## Prerequisites
1. Make sure your server is running: `npm run dev`
2. Have MongoDB running
3. Have some test data (users, vehicles, trips) in your database
4. Use a tool like Postman, Thunder Client, or curl for API testing

## 1. Real-time Updates Testing (Socket.IO)

### Setup Socket.IO Client Connection
You'll need to test Socket.IO connections. Here's a simple HTML test file you can create:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Socket.IO Test</title>
    <script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
</head>
<body>
    <h1>Fleet Management Socket.IO Test</h1>
    <div id="messages"></div>
    
    <script>
        // Replace with your actual JWT token
        const token = 'YOUR_JWT_TOKEN_HERE';
        
        const socket = io('http://localhost:5000', {
            auth: {
                token: token
            }
        });
        
        socket.on('connect', () => {
            console.log('Connected to server');
            document.getElementById('messages').innerHTML += '<p>Connected to server</p>';
        });
        
        socket.on('trip_assigned', (data) => {
            console.log('Trip assigned:', data);
            document.getElementById('messages').innerHTML += `<p>Trip Assigned: ${JSON.stringify(data)}</p>`;
        });
        
        socket.on('trip_status_changed', (data) => {
            console.log('Trip status changed:', data);
            document.getElementById('messages').innerHTML += `<p>Trip Status Changed: ${JSON.stringify(data)}</p>`;
        });
        
        socket.on('driver_location_update', (data) => {
            console.log('Location update:', data);
            document.getElementById('messages').innerHTML += `<p>Location Update: ${JSON.stringify(data)}</p>`;
        });
        
        socket.on('emergency_alert', (data) => {
            console.log('Emergency alert:', data);
            document.getElementById('messages').innerHTML += `<p>Emergency Alert: ${JSON.stringify(data)}</p>`;
        });
        
        socket.on('disconnect', () => {
            console.log('Disconnected from server');
            document.getElementById('messages').innerHTML += '<p>Disconnected from server</p>';
        });
    </script>
</body>
</html>
```

### Testing Real-time Updates

#### Test 1: Driver Connection
1. Login as a driver and get JWT token
2. Open the HTML test file in browser
3. Replace `YOUR_JWT_TOKEN_HERE` with actual token
4. You should see "Connected to server" message

#### Test 2: Trip Assignment Notification
1. Login as fleet manager/admin
2. Create a new trip assignment via API
3. Driver should receive real-time notification
4. Check browser console for `trip_assigned` event

#### Test 3: Trip Status Updates
1. Driver updates trip status (start, complete)
2. Fleet managers/admins should receive updates
3. Check for `trip_status_changed` events

#### Test 4: Location Updates
```javascript
// Send location update from driver
socket.emit('location_update', {
    tripId: 'TRIP_ID',
    latitude: 40.7128,
    longitude: -74.0060,
    speed: 60,
    heading: 90
});
```

#### Test 5: Emergency Alerts
```javascript
// Send emergency alert from driver
socket.emit('emergency_alert', {
    tripId: 'TRIP_ID',
    emergencyType: 'breakdown',
    message: 'Vehicle breakdown on highway',
    location: { latitude: 40.7128, longitude: -74.0060 }
});
```

## 2. Email Notifications Testing (Nodemailer)

### Environment Setup
Make sure you have these environment variables set:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=development
```

### Testing Email Notifications

#### Test 1: Trip Assignment Email
1. Create a new trip via API
2. Check console logs for email notification (dev mode)
3. In production, check actual email inbox

**API Call:**
```bash
POST /api/trips
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
    "vehicleId": "VEHICLE_ID",
    "driverId": "DRIVER_ID",
    "origin": "New York",
    "destination": "Boston",
    "startTime": "2024-01-15T10:00:00Z",
    "distance": 200,
    "notes": "Test trip"
}
```

#### Test 2: Password Reset Email
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
    "email": "driver@example.com"
}
```

#### Test 3: Maintenance Alert Email
```bash
POST /api/analytics/maintenance/alert
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
    "vehicleId": "VEHICLE_ID",
    "maintenanceType": "oil_change",
    "description": "Oil change due"
}
```

## 3. Analytics Endpoints Testing

### Test 1: Driver Trip Statistics
```bash
GET /api/analytics/driver/DRIVER_ID/stats?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer YOUR_JWT_TOKEN
```

### Test 2: Vehicle Usage Statistics
```bash
GET /api/analytics/vehicle/VEHICLE_ID/stats?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer YOUR_JWT_TOKEN
```

### Test 3: Pending/Overdue Trips
```bash
GET /api/analytics/trips/pending-overdue?type=all
Authorization: Bearer YOUR_JWT_TOKEN
```

### Test 4: Fleet Analytics Dashboard
```bash
GET /api/analytics/fleet/dashboard?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer YOUR_JWT_TOKEN
```

### Test 5: Advanced Analytics (New Aggregation Pipelines)

#### Driver Performance Analytics
```bash
GET /api/analytics/driver/DRIVER_ID/performance?groupBy=month&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Vehicle Utilization Analytics
```bash
GET /api/analytics/vehicle/VEHICLE_ID/utilization?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Maintenance Analytics
```bash
GET /api/analytics/maintenance/analytics?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer YOUR_JWT_TOKEN
```

## 4. Input Validation Testing (Joi)

### Test 1: User Registration Validation
```bash
POST /api/auth/register
Content-Type: application/json

{
    "name": "a",  // Should fail - too short
    "email": "invalid-email",  // Should fail - invalid format
    "password": "123",  // Should fail - too weak
    "role": "invalid_role"  // Should fail - invalid role
}
```

### Test 2: Vehicle Creation Validation
```bash
POST /api/vehicles
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
    "vehicleNumber": "A",  // Should fail - too short
    "type": "invalid_type",  // Should fail - invalid type
    "year": 1800,  // Should fail - too old
    "vin": "123",  // Should fail - invalid VIN format
    "licensePlate": ""  // Should fail - required field
}
```

### Test 3: Trip Creation Validation
```bash
POST /api/trips
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
    "vehicleId": "invalid_id",  // Should fail - invalid ObjectId
    "driverId": "invalid_id",  // Should fail - invalid ObjectId
    "origin": "",  // Should fail - required field
    "destination": "",  // Should fail - required field
    "startTime": "2020-01-01T10:00:00Z",  // Should fail - past date
    "distance": -100  // Should fail - negative distance
}
```

## 5. Complete Workflow Testing

### Scenario: Complete Trip Lifecycle
1. **Create Trip** (Fleet Manager)
   - Create trip via API
   - Verify email notification sent to driver
   - Verify real-time notification via Socket.IO

2. **Driver Updates Status** (Driver)
   - Driver connects via Socket.IO
   - Driver starts trip
   - Fleet managers receive real-time update

3. **Location Tracking** (Driver)
   - Driver sends location updates
   - Fleet managers receive location data

4. **Complete Trip** (Driver)
   - Driver completes trip
   - Fleet managers receive completion notification

5. **View Analytics** (Fleet Manager)
   - Check driver performance analytics
   - Check vehicle utilization analytics
   - Check fleet-wide analytics

## 6. Error Handling Testing

### Test Invalid Tokens
```bash
GET /api/analytics/fleet/dashboard
Authorization: Bearer invalid_token
```

### Test Unauthorized Access
```bash
GET /api/analytics/fleet/dashboard
Authorization: Bearer DRIVER_TOKEN  # Driver trying to access admin endpoint
```

### Test Invalid Data
```bash
POST /api/trips
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
    "vehicleId": "nonexistent_id",
    "driverId": "nonexistent_id",
    "origin": "Test",
    "destination": "Test",
    "startTime": "2024-01-15T10:00:00Z"
}
```

## 7. Performance Testing

### Test Aggregation Pipelines
1. Create multiple trips with different dates
2. Test analytics endpoints with large date ranges
3. Monitor response times
4. Check database performance

### Test Real-time Updates
1. Connect multiple clients
2. Send multiple updates simultaneously
3. Verify all clients receive updates
4. Check server performance

## 8. Troubleshooting

### Common Issues

#### Socket.IO Connection Issues
- Check JWT token validity
- Verify server is running on correct port
- Check CORS settings

#### Email Notifications Not Working
- Verify environment variables
- Check email service credentials
- Look for console errors

#### Analytics Endpoints Returning Empty Data
- Ensure test data exists
- Check date range parameters
- Verify user permissions

#### Validation Errors
- Check request body format
- Verify required fields
- Check data types

## 9. Success Criteria

✅ **Real-time Updates Working:**
- Drivers can connect via Socket.IO
- Trip assignments trigger real-time notifications
- Status updates are broadcast to relevant users
- Location updates work correctly

✅ **Email Notifications Working:**
- Trip assignment emails are sent
- Password reset emails work
- Maintenance alert emails are sent
- Console logs show email attempts (dev mode)

✅ **Analytics Endpoints Working:**
- Driver statistics return accurate data
- Vehicle usage statistics work
- Pending/overdue trips are identified
- Advanced aggregation pipelines return data

✅ **Input Validation Working:**
- Invalid data is rejected with proper error messages
- Valid data is accepted
- Joi validation schemas work correctly

## 10. Next Steps

After testing, you should have:
1. A fully functional real-time tracking system
2. Working email notifications
3. Comprehensive analytics with aggregation pipelines
4. Robust input validation
5. A complete Week 3 implementation

If any tests fail, check the console logs and error messages to identify and fix issues.
