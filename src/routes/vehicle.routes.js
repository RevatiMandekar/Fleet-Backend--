import express from "express";
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  assignVehicle,
  unassignVehicle
} from "../controllers/vehicle.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { validateVehicle } from "../middlewares/validation.middleware.js";

const router = express.Router();

// All vehicle routes require authentication
router.use(authenticate);

// Get all vehicles (accessible by all authenticated users)
router.get("/", getAllVehicles);

// Get vehicle by ID (accessible by all authenticated users)
router.get("/:id", getVehicleById);

// Create vehicle (admin and fleet_manager only)
router.post("/", authorize("admin", "fleet_manager"), validateVehicle, createVehicle);

// Update vehicle (admin and fleet_manager only)
router.put("/:id", authorize("admin", "fleet_manager"), validateVehicle, updateVehicle);

// Delete vehicle (admin only)
router.delete("/:id", authorize("admin"), deleteVehicle);

// Assign vehicle to driver (admin and fleet_manager only)
router.post("/:id/assign", authorize("admin", "fleet_manager"), assignVehicle);

// Unassign vehicle from driver (admin and fleet_manager only)
router.post("/:id/unassign", authorize("admin", "fleet_manager"), unassignVehicle);

export default router;
