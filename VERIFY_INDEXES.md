# 🔍 MongoDB Index Verification Guide

## Quick Verification Commands

### Using MongoDB Shell (mongosh)

```bash
# Connect to MongoDB
mongosh

# Switch to your database
use fleet_management

# Check all indexes at once
print("\n=== USER INDEXES ===");
db.users.getIndexes();

print("\n=== VEHICLE INDEXES ===");
db.vehicles.getIndexes();

print("\n=== TRIP INDEXES ===");
db.trips.getIndexes();
```

### Using MongoDB Compass

1. Connect to MongoDB
2. Select `fleet_management` database
3. Click on each collection (`users`, `vehicles`, `trips`)
4. Click on the **"Indexes"** tab
5. Verify all indexes are listed

## Expected Indexes

### Users Collection
- ✅ `_id_` (automatic)
- ✅ `email_1` (unique)
- ✅ `role_1`
- ✅ `role_1_createdAt_-1` (compound)
- ✅ `resetPasswordToken_1`
- ✅ `resetPasswordExpires_1`

### Vehicles Collection
- ✅ `_id_` (automatic)
- ✅ `vehicleNumber_1` (unique)
- ✅ `licensePlate_1` (unique)
- ✅ `vin_1` (unique)
- ✅ `status_1_type_1` (compound)
- ✅ `assignedDriver_1_status_1` (compound)
- ✅ `nextServiceDue_1`
- ✅ `insuranceExpiry_1`
- ✅ `registrationExpiry_1`
- ✅ `createdAt_-1`

### Trips Collection
- ✅ `_id_` (automatic)
- ✅ `vehicleId_1_status_1` (compound)
- ✅ `driverId_1_status_1` (compound)
- ✅ `startTime_1_status_1` (compound)
- ✅ `endTime_1_status_1` (compound)
- ✅ `createdAt_-1`
- ✅ `driverId_1_createdAt_-1` (compound)
- ✅ `vehicleId_1_createdAt_-1` (compound)

## Troubleshooting

**Issue:** No indexes found
**Solution:** Indexes are created when you first save a document. Create at least one document in each collection:
```javascript
// Create a test user
db.users.insertOne({ name: "Test", email: "test@test.com", password: "hash", role: "admin" });

// Create a test vehicle
db.vehicles.insertOne({ vehicleNumber: "TEST-001", type: "truck", make: "Test", model: "Test", year: 2023, color: "Blue", licensePlate: "TEST", vin: "1HGBH41JXMN109186", createdBy: ObjectId("...") });

// Create a test trip
db.trips.insertOne({ vehicleId: ObjectId("..."), driverId: ObjectId("..."), origin: "A", destination: "B", startTime: new Date(), createdBy: ObjectId("...") });
```

## Verify Index Usage

```javascript
// Check if indexes are being used in queries
db.trips.find({ driverId: ObjectId("..."), status: "completed" }).explain("executionStats");

// Look for "stage": "IXSCAN" in the output to confirm index usage
```

