import express from "express";
import { register, login, forgotPassword, forgotPasswordFromLogin, resetPassword } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { validateUser, validateLogin, validateForgotPassword, validateResetPassword } from "../middlewares/validation.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", validateUser, register);
router.post("/login", validateLogin, login);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/forgot-password-from-login", validateForgotPassword, forgotPasswordFromLogin);
router.post("/reset-password", validateResetPassword, resetPassword);

// Protected routes for role verification
router.get("/profile", authenticate, (req, res) => {
  res.json({
    message: "Profile retrieved successfully",
    user: req.user
  });
});

router.get("/admin-only", authenticate, authorize("admin"), (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.name}` });
});

router.get("/fleet-manager-only", authenticate, authorize("fleet_manager"), (req, res) => {
  res.json({ message: `Welcome Fleet Manager ${req.user.name}` });
});

router.get("/driver-only", authenticate, authorize("driver"), (req, res) => {
  res.json({ message: `Welcome Driver ${req.user.name}` });
});

export default router; // ✅ use ES module export
