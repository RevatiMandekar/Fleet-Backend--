import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js"; // ✅ import router
import vehicleRoutes from "./routes/vehicle.routes.js"; // ✅ import vehicle router
import userRoutes from "./routes/user.routes.js"; // ✅ import user router
import tripRoutes from "./routes/trip.routes.js"; // ✅ import trip router

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("Fleet & Vehicle Management API is running...");
});

// Mount routes
app.use("/api/auth", authRoutes); // ✅ base path for auth routes
app.use("/api/vehicles", vehicleRoutes); // ✅ base path for vehicle routes
app.use("/api/users", userRoutes); // ✅ base path for user routes
app.use("/api/trips", tripRoutes); // ✅ base path for trip routes

export default app;
