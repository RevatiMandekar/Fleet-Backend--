import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUsersByRole
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Get all users (Admin only)
router.get("/", authorize("admin"), getAllUsers);

// Get users by role (Admin and Fleet Manager)
router.get("/role/:role", authorize("admin", "fleet_manager"), getUsersByRole);

// Get user by ID (Admin only)
router.get("/:id", authorize("admin"), getUserById);

// Update user (Admin only)
router.put("/:id", authorize("admin"), updateUser);

// Delete user (Admin only)
router.delete("/:id", authorize("admin"), deleteUser);

export default router;
