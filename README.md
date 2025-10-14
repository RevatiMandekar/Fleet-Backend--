# Fleet & Vehicle Management API

I built a backend-only service to manage users, vehicles and access control for a fleet system. It’s an Express + MongoDB application with JWT auth and role-based authorization. This is the foundation for features like trips, notifications, analytics, and real-time updates in later phases.

## Stack
- Node.js, Express
- MongoDB with Mongoose
- JWT for auth, bcrypt for password hashing

## What’s implemented (Week 1 scope)
- User registration and login with JWT
- Roles: admin, fleet_manager, driver
- Role-based middleware for protected routes
- Models: `User`, `Vehicle`
- Vehicle CRUD and assignment helpers
- Basic validation and consistent error responses

## Getting started
1) Install dependencies
```bash
npm install
```

2) Environment variables (create `.env` in project root)
```env
MONGO_URI=mongodb://localhost:27017/fleet-management
JWT_SECRET=change-this
PORT=4000
NODE_ENV=development
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

## Auth flow
- Register → Login → use returned JWT in the `Authorization` header: `Bearer <token>`

### Auth endpoints (`/api/auth`)
- `POST /register` — body: `{ name, email, password, role }`
- `POST /login` — body: `{ email, password }`
- `GET /profile` — current user (requires auth)
- `GET /admin-only` — test route for admin
- `GET /fleet-manager-only` — test route for fleet_manager
- `GET /driver-only` — test route for driver

Example (register):
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@fleet.com","password":"admin123","role":"admin"}'
```

Example (login):
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fleet.com","password":"admin123"}'
```

## Vehicles
Model fields: `vehicleNumber`, `type`, `status` (available | assigned | maintenance), `assignedDriver` (User ref)

### Vehicle endpoints (`/api/vehicles`)
- `GET /` — list (auth)
- `GET /:id` — details (auth)
- `POST /` — create (admin, fleet_manager)
- `PUT /:id` — update (admin, fleet_manager)
- `DELETE /:id` — delete (admin)
- `POST /:id/assign` — assign to driver (admin, fleet_manager)
- `POST /:id/unassign` — unassign (admin, fleet_manager)

Example (create):
```bash
curl -X POST http://localhost:4000/api/vehicles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"vehicleNumber":"ABC-123","type":"Sedan","status":"available"}'
```

## Users (admin)
### User endpoints (`/api/users`)
- `GET /` — all users
- `GET /role/:role` — filter by role
- `GET /:id` — details
- `PUT /:id` — update
- `DELETE /:id` — remove

## Notes / decisions
- ES modules (`"type":"module"`) across the project
- Passwords hashed with bcrypt; tokens expire in 7 days by default
- Validation is lightweight; I kept it simple for Week 1
- Errors return a consistent `{ message, [errors] }` shape

## Troubleshooting
- If you see SSL/WRONG_VERSION_NUMBER, ensure you’re calling `http://localhost:4000` (not https)
- If Mongo isn’t connecting, confirm `MONGO_URI` and that the daemon is running
- If auth fails, check `JWT_SECRET` is set and you’re sending `Authorization: Bearer <token>`

## What’s next
- Trips (assignments, status updates, history)
- Aggregations and analytics
- Email notifications (Nodemailer)
- Real-time updates (Socket.IO)
- Stronger validation with Joi/express-validator and full test coverage
