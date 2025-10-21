# Fleet & Vehicle Management API

A comprehensive backend service for managing fleet operations, vehicles, trips, and users. Built with Express + MongoDB, featuring JWT authentication, role-based authorization, and advanced fleet management capabilities.

## Stack
- Node.js, Express
- MongoDB with Mongoose
- JWT for auth, bcrypt for password hashing
- Nodemailer for email services
- Advanced validation and error handling

## Project Timeline & Implementation

### Week 1 - Foundation & Authentication ✅
- **User Management**: Registration, login with JWT authentication
- **Role-Based Access**: admin, fleet_manager, driver roles with middleware
- **Basic Vehicle CRUD**: Vehicle creation, assignment, and management
- **Security Foundation**: Password hashing, token-based auth
- **Database Models**: User and Vehicle schemas with relationships

### Week 2 - Vehicles & Trips Management ✅
- **Enhanced Vehicle Model**: Comprehensive vehicle data (VIN, maintenance, fuel tracking)
- **Trip Management**: Complete trip lifecycle (scheduled → in_progress → completed)
- **Driver-Vehicle Assignments**: Full assignment workflow with status tracking
- **Fleet Manager Dashboard**: Analytics, statistics, and monitoring
- **Advanced Relationships**: Driver-trip-vehicle assignments with nested queries
- **Security Enhancements**: Account locking, password reset, forgot password flow
- **Mongoose Population**: Optimized queries with proper data relationships

### Complete Feature Set
- **Authentication & Authorization**: User registration, login, forgot password, role-based access
- **User Management**: Complete CRUD with roles (admin, fleet_manager, driver)
- **Vehicle Management**: Advanced CRUD with comprehensive vehicle data
- **Trip Management**: Complete trip lifecycle with driver-vehicle assignments
- **Fleet Analytics**: Dashboard with statistics and reporting
- **Relationships**: Driver-trip-vehicle assignments with nested queries
- **Security**: Account locking, password reset, input validation

## Detailed Implementation Breakdown

### Week 1 Deliverables ✅
**Goal**: Secure authentication and basic vehicle management
- ✅ User registration and login with JWT
- ✅ Role-based route access (admin, fleet_manager, driver)
- ✅ Database models verified (User, Vehicle)
- ✅ Basic vehicle CRUD operations
- ✅ Vehicle assignment to drivers
- ✅ Authentication middleware
- ✅ Role authorization middleware
- ✅ Basic validation and error handling

**Week 1 API Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - User profile
- `GET /api/auth/admin-only` - Admin test route
- `GET /api/auth/fleet-manager-only` - Fleet manager test route
- `GET /api/auth/driver-only` - Driver test route
- `GET /api/vehicles` - List vehicles
- `POST /api/vehicles` - Create vehicle
- `GET /api/vehicles/:id` - Get vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle
- `POST /api/vehicles/:id/assign` - Assign vehicle to driver
- `POST /api/vehicles/:id/unassign` - Unassign vehicle

### Week 2 Deliverables ✅
**Goal**: CRUD for vehicles and trips with relationships
- ✅ Trip model (vehicleId, driverId, origin, destination, status, startTime, endTime)
- ✅ Complete vehicle CRUD with enhanced fields
- ✅ Complete trip CRUD operations
- ✅ Assign vehicles to drivers and trips
- ✅ One driver → many trips relationship
- ✅ One vehicle → many trips relationship
- ✅ Fleet Manager → many drivers & vehicles relationship
- ✅ Mongoose population for nested queries
- ✅ Enhanced security with forgot password flow
- ✅ Fleet manager dashboard with analytics

**Week 2 API Endpoints Added:**
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/forgot-password-from-login` - Login-integrated password reset
- `POST /api/auth/reset-password` - Password reset with token
- `GET /api/trips` - List trips with filtering and pagination
- `POST /api/trips` - Create trip
- `GET /api/trips/:id` - Get trip details
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `PATCH /api/trips/:id/start` - Start trip
- `PATCH /api/trips/:id/complete` - Complete trip
- `PATCH /api/trips/:id/cancel` - Cancel trip
- `GET /api/trips/driver/:driverId` - Trips by driver
- `GET /api/trips/vehicle/:vehicleId` - Trips by vehicle
- `GET /api/vehicles/:id/trips` - Vehicle trip history
- `GET /api/vehicles/dashboard/overview` - Fleet manager dashboard
- `GET /api/vehicles/driver/:driverId/details` - Driver details with vehicle and trips
- `GET /api/vehicles/type/:type/stats` - Vehicle type statistics
- `GET /api/vehicles/available` - Available vehicles
- `GET /api/vehicles/status/:status` - Vehicles by status

## Project Summary

### Total Implementation Scope
This fleet management system represents a complete backend solution built over two development weeks:

**Week 1 Foundation** (13 endpoints):
- Authentication system with JWT
- Role-based access control
- Basic vehicle management
- User management system

**Week 2 Enhancement** (15 additional endpoints):
- Advanced vehicle model with comprehensive data
- Complete trip management system
- Fleet analytics and dashboard
- Enhanced security features
- Advanced relationship queries

**Total: 28 API Endpoints** covering:
- ✅ Complete authentication flow with security features
- ✅ Full CRUD operations for users, vehicles, and trips
- ✅ Advanced fleet management capabilities
- ✅ Comprehensive analytics and reporting
- ✅ Role-based access control throughout
- ✅ Database relationships with optimized queries
- ✅ Production-ready validation and error handling

### Key Achievements
- **Security**: Account locking, password reset, input validation
- **Scalability**: Pagination, filtering, optimized database queries
- **Relationships**: Complex driver-trip-vehicle assignments
- **Analytics**: Fleet manager dashboard with comprehensive statistics
- **User Experience**: Forgot password flow integrated into login process
- **Data Integrity**: Comprehensive validation and error handling

## Getting started
1) Install dependencies
```bash
npm install
```

2) Environment variables (create `.env` in project root)
```env
MONGO_URI=mongodb://localhost:27017/fleet-management
JWT_SECRET=change-this-to-a-secure-secret
PORT=4000
NODE_ENV=development

# Email configuration (for password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

3) Run the server
```bash
# dev with auto-reload
npm run dev

# or
npm start
```
The API will be available at `http://localhost:4000`.

## Quick check
- Health: `GET /` → "Fleet & Vehicle Management API is running..."
- Mongo connection message appears in the terminal on startup

## Authentication & Security

### Auth Flow
- Register → Login → use returned JWT in the `Authorization` header: `Bearer <token>`
- Enhanced login with forgot password option on failed attempts
- Account locking after 5 failed login attempts (2-hour lockout)
- Password reset via email with secure tokens

### Auth endpoints (`/api/auth`)
- `POST /register` — body: `{ name, email, password, role }`
- `POST /login` — body: `{ email, password }` (returns forgot password option on failure)
- `POST /forgot-password` — body: `{ email }` (standard reset)
- `POST /forgot-password-from-login` — body: `{ email }` (login-integrated reset)
- `POST /reset-password` — body: `{ token, password }`
- `GET /profile` — current user (requires auth)
- `GET /admin-only` — test route for admin
- `GET /fleet-manager-only` — test route for fleet_manager
- `GET /driver-only` — test route for driver

Example (register):
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Fleet Admin","email":"admin@gmail.com","password":"Admin@123","role":"admin"}'
```

Example (login):
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"Admin@123"}'
```

Example (forgot password):
```bash
curl -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com"}'
```

## Vehicle Management

### Enhanced Vehicle Model
**Core Fields**: `vehicleNumber`, `type`, `make`, `model`, `year`, `color`, `licensePlate`, `vin`
**Status**: `available`, `assigned`, `maintenance`, `out_of_service`
**Fuel Management**: `fuelType`, `fuelCapacity`, `mileage`
**Maintenance**: `lastServiceDate`, `nextServiceDue`
**Legal**: `insuranceExpiry`, `registrationExpiry`
**Metadata**: `notes`, `assignedDriver` (User ref), `createdBy`

### Vehicle endpoints (`/api/vehicles`)
**Basic CRUD:**
- `GET /` — list all vehicles (populated with drivers)
- `GET /:id` — vehicle details (populated)
- `POST /` — create vehicle (admin, fleet_manager)
- `PUT /:id` — update vehicle (admin, fleet_manager)
- `DELETE /:id` — delete vehicle (admin only)

**Assignment Management:**
- `POST /:id/assign` — assign to driver (admin, fleet_manager)
- `POST /:id/unassign` — unassign vehicle (admin, fleet_manager)

**Filtering & Status:**
- `GET /available` — available vehicles only
- `GET /status/:status` — vehicles by status
- `GET /type/:type/stats` — vehicles by type with statistics

**Advanced Queries:**
- `GET /:id/trips` — vehicle with trip history
- `GET /dashboard/overview` — fleet manager dashboard (fleet_manager, admin)
- `GET /driver/:driverId/details` — driver details with vehicle and trips

Example (create vehicle):
```bash
curl -X POST http://localhost:4000/api/vehicles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

## Trip Management

### Trip Model
**Core Fields**: `vehicleId`, `driverId`, `origin`, `destination`, `startTime`, `endTime`
**Status**: `scheduled`, `in_progress`, `completed`, `cancelled`
**Tracking**: `distance`, `fuelConsumed`, `notes`
**Metadata**: `createdBy` (User ref), `duration` (virtual field)

### Trip endpoints (`/api/trips`)
**Basic CRUD:**
- `GET /` — list trips (with filtering: `?status=scheduled&page=1&limit=10`)
- `GET /:id` — trip details (fully populated)
- `POST /` — create trip (fleet_manager, admin)
- `PUT /:id` — update trip (fleet_manager, admin)
- `DELETE /:id` — delete trip (fleet_manager, admin)

**Trip Lifecycle:**
- `PATCH /:id/start` — start trip (driver, fleet_manager, admin)
- `PATCH /:id/complete` — complete trip (driver, fleet_manager, admin)
- `PATCH /:id/cancel` — cancel trip (fleet_manager, admin)

**Relationship Queries:**
- `GET /driver/:driverId` — trips by driver (paginated)
- `GET /vehicle/:vehicleId` — trips by vehicle (paginated)

Example (create trip):
```bash
curl -X POST http://localhost:4000/api/trips \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "<vehicle_id>",
    "driverId": "<driver_id>",
    "origin": "New York",
    "destination": "Boston",
    "startTime": "2024-03-15T09:00:00Z",
    "endTime": "2024-03-15T14:00:00Z",
    "distance": 215,
    "fuelConsumed": 12.5,
    "notes": "Business trip to Boston"
  }'
```

## User Management
### User endpoints (`/api/users`)
- `GET /` — all users (admin only)
- `GET /role/:role` — filter by role (admin, fleet_manager)
- `GET /:id` — user details (admin only)
- `PUT /:id` — update user (admin only)
- `DELETE /:id` — remove user (admin only)

## Fleet Manager Dashboard

### Dashboard Overview (`GET /api/vehicles/dashboard/overview`)
Comprehensive analytics for fleet managers and admins:

**Statistics:**
- Vehicle counts: total, available, assigned, maintenance
- Trip counts: total, scheduled, in-progress, completed
- Driver counts: total drivers, assigned drivers

**Alerts & Monitoring:**
- Recent trips (last 5 with full details)
- Vehicles needing service (overdue maintenance)
- Vehicles with expiring documents (insurance/registration)

**Advanced Analytics:**
- Driver performance tracking
- Vehicle utilization metrics
- Maintenance scheduling insights

## Relationships & Data Integrity

### Database Relationships
- **One Driver → Many Trips**: Drivers can have multiple trips
- **One Vehicle → Many Trips**: Vehicles can be used for multiple trips
- **Fleet Manager → Many Drivers & Vehicles**: Complete fleet oversight

### Mongoose Population Examples
```javascript
// Trip with full vehicle and driver details
Trip.findById().populate('vehicleId').populate('driverId').populate('createdBy')

// Vehicle with assigned driver
Vehicle.findById().populate('assignedDriver').populate('createdBy')

// Driver with assigned vehicle and trips
Vehicle.findOne({assignedDriver: driverId}).populate('assignedDriver')
Trip.find({driverId}).populate('vehicleId').populate('createdBy')
```

## Security Features

### Enhanced Authentication
- **Account Locking**: 5 failed attempts → 2-hour lockout
- **Password Reset**: Secure email-based reset with 10-minute token expiry
- **Login Intelligence**: Forgot password option appears on failed login attempts
- **Rate Limiting**: Password reset cooldown (5 minutes between requests)

### Input Validation
- **Vehicle Data**: VIN validation, year range, fuel type validation
- **Trip Data**: Time conflict detection, driver role validation
- **User Data**: Email format, password strength requirements
- **Comprehensive Error Handling**: Consistent error responses with detailed messages

## Technical Implementation

### Architecture Decisions
- **ES Modules**: `"type":"module"` across the project
- **Password Security**: bcrypt hashing, 7-day JWT expiry
- **Database Design**: Optimized indexes for query performance
- **Error Handling**: Consistent `{ message, [errors] }` response format
- **Validation**: Comprehensive middleware with detailed error messages

## Troubleshooting

### Common Issues
- **SSL/WRONG_VERSION_NUMBER**: Ensure you're calling `http://localhost:4000` (not https)
- **MongoDB Connection**: Confirm `MONGO_URI` and that MongoDB daemon is running
- **Authentication Failures**: Check `JWT_SECRET` is set and you're sending `Authorization: Bearer <token>`
- **Email Issues**: Verify `EMAIL_USER` and `EMAIL_PASS` are correctly configured
- **Validation Errors**: Check request body format and required fields
- **Role Access Denied**: Ensure user has correct role for the endpoint

### Development Tips
- Use `npm run dev` for auto-reload during development
- Check server console for detailed error messages
- In development mode, password reset tokens are logged to console
- All endpoints return consistent error format: `{ message, [errors] }`

## API Testing Examples

### Complete Workflow Example
```bash
# 1. Register admin user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Fleet Admin","email":"admin@gmail.com","password":"Admin@123","role":"admin"}'

# 2. Login to get token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"Admin@123"}'

# 3. Create vehicle (use token from step 2)
curl -X POST http://localhost:4000/api/vehicles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"vehicleNumber":"VH001","type":"sedan","make":"Toyota","model":"Camry","year":2022,"color":"Silver","licensePlate":"ABC123","vin":"1HGBH41JXMN109186"}'

# 4. Create driver
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Driver","email":"driver@outlook.com","password":"Driver@123","role":"driver"}'

# 5. Create trip (use vehicle and driver IDs from steps 3 & 4)
curl -X POST http://localhost:4000/api/trips \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"<vehicle_id>","driverId":"<driver_id>","origin":"NYC","destination":"Boston","startTime":"2024-03-15T09:00:00Z"}'

# 6. View fleet dashboard
curl -X GET http://localhost:4000/api/vehicles/dashboard/overview \
  -H "Authorization: Bearer <token>"
```

## What's Next (Future Enhancements)
- **Real-time Updates**: Socket.IO integration for live trip tracking
- **Advanced Analytics**: Trip efficiency metrics, fuel consumption analysis
- **Geolocation**: GPS tracking and route optimization
- **Maintenance Scheduling**: Automated service reminders and scheduling
- **Reporting**: PDF reports, export functionality
- **Mobile API**: Optimized endpoints for mobile applications
- **Integration**: Third-party services (maps, weather, traffic)
- **Testing**: Comprehensive test suite with Jest/Mocha
- **Documentation**: OpenAPI/Swagger documentation
- **Performance**: Caching, database optimization, load balancing
