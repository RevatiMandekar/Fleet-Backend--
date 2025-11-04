import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js"; // ✅ import router
import vehicleRoutes from "./routes/vehicle.routes.js"; // ✅ import vehicle router
import userRoutes from "./routes/user.routes.js"; // ✅ import user router
import tripRoutes from "./routes/trip.routes.js"; // ✅ import trip router
import analyticsRoutes from "./routes/analytics.routes.js"; // ✅ import analytics router
import { errorHandler, notFound } from "./middlewares/errorHandler.middleware.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Default route
app.get("/", (req, res) => {
  res.send("Fleet & Vehicle Management API is running...");
});

// Mount routes
app.use("/api/auth", authRoutes); // ✅ base path for auth routes
app.use("/api/vehicles", vehicleRoutes); // ✅ base path for vehicle routes
app.use("/api/users", userRoutes); // ✅ base path for user routes
app.use("/api/trips", tripRoutes); // ✅ base path for trip routes
app.use("/api/analytics", analyticsRoutes); // ✅ base path for analytics routes

// Error handling middleware (must be after all routes)
app.use(notFound);
app.use(errorHandler);

export default app;
