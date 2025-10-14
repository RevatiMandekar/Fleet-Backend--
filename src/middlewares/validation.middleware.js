// Input validation middleware
export const validateUser = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  // Name validation
  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  // Role validation
  const validRoles = ['admin', 'fleet_manager', 'driver'];
  if (!role || !validRoles.includes(role)) {
    errors.push('Role must be one of: admin, fleet_manager, driver');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

export const validateVehicle = (req, res, next) => {
  const { vehicleNumber, type, status, assignedDriver } = req.body;
  const errors = [];

  // Vehicle number validation
  if (!vehicleNumber || vehicleNumber.trim().length < 3) {
    errors.push('Vehicle number must be at least 3 characters long');
  }

  // Type validation
  if (!type || type.trim().length < 2) {
    errors.push('Vehicle type must be at least 2 characters long');
  }

  // Status validation (if provided)
  if (status) {
    const validStatuses = ['available', 'assigned', 'maintenance'];
    if (!validStatuses.includes(status)) {
      errors.push('Status must be one of: available, assigned, maintenance');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!password || password.length < 1) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};
