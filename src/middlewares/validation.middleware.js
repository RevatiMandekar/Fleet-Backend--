// Input validation middleware
export const validateUser = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  // Name validation
  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  // Email validation with domain check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Please provide a valid email address');
  } else {
    // Check for common typos in email domains
    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'company.com'];
    const domain = email.split('@')[1].toLowerCase();
    const isTypo = !commonDomains.includes(domain);
    
    if (isTypo) {
      // Check for common typos
      const typoMap = {
        'gmial.com': 'gmail.com',
        'gmaill.com': 'gmail.com',
        'gmai.com': 'gmail.com',
        'gmail.co': 'gmail.com',
        'yahooo.com': 'yahoo.com',
        'yaho.com': 'yahoo.com',
        'outlok.com': 'outlook.com',
        'hotmial.com': 'hotmail.com',
        'hotmai.com': 'hotmail.com'
      };
      
      if (typoMap[domain]) {
        errors.push(`Did you mean ${email.split('@')[0]}@${typoMap[domain]}?`);
      } else {
        errors.push('Please use a valid email domain (gmail.com, yahoo.com, outlook.com, etc.)');
      }
    }
  }

  // Enhanced password validation
  if (!password) {
    errors.push('Password is required');
  } else {
    const passwordErrors = [];
    
    if (password.length < 8) {
      passwordErrors.push('at least 8 characters');
    }
    
    if (!/[A-Z]/.test(password)) {
      passwordErrors.push('one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      passwordErrors.push('one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      passwordErrors.push('one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      passwordErrors.push('one special character');
    }
    
    if (passwordErrors.length > 0) {
      errors.push(`Password must contain ${passwordErrors.join(', ')}`);
    }
    
    // Check for common weak passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      errors.push('Password contains common patterns. Please choose a stronger password.');
    }
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
  const { 
    vehicleNumber, 
    type, 
    make, 
    model, 
    year, 
    color, 
    licensePlate, 
    vin,
    fuelType,
    fuelCapacity,
    mileage,
    status, 
    assignedDriver 
  } = req.body;
  const errors = [];

  // Required fields validation
  const requiredFields = ['vehicleNumber', 'type', 'make', 'model', 'year', 'color', 'licensePlate', 'vin'];
  requiredFields.forEach(field => {
    if (!req.body[field] || req.body[field].toString().trim().length === 0) {
      errors.push(`${field} is required`);
    }
  });

  // Vehicle number validation
  if (vehicleNumber && vehicleNumber.trim().length < 3) {
    errors.push('Vehicle number must be at least 3 characters long');
  }

  // Type validation
  if (type) {
    const validTypes = ['sedan', 'suv', 'truck', 'van', 'bus', 'motorcycle'];
    if (!validTypes.includes(type)) {
      errors.push('Type must be one of: sedan, suv, truck, van, bus, motorcycle');
    }
  }

  // Year validation
  if (year) {
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear + 1) {
      errors.push(`Year must be between 1900 and ${currentYear + 1}`);
    }
  }

  // VIN validation
  if (vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
    errors.push('VIN must be exactly 17 characters and contain only valid characters');
  }

  // Fuel type validation
  if (fuelType) {
    const validFuelTypes = ['gasoline', 'diesel', 'electric', 'hybrid', 'lpg'];
    if (!validFuelTypes.includes(fuelType)) {
      errors.push('Fuel type must be one of: gasoline, diesel, electric, hybrid, lpg');
    }
  }

  // Fuel capacity validation
  if (fuelCapacity !== undefined && (fuelCapacity < 0 || fuelCapacity > 1000)) {
    errors.push('Fuel capacity must be between 0 and 1000 liters');
  }

  // Mileage validation
  if (mileage !== undefined && mileage < 0) {
    errors.push('Mileage must be a positive number');
  }

  // Status validation (if provided)
  if (status) {
    const validStatuses = ['available', 'assigned', 'maintenance', 'out_of_service'];
    if (!validStatuses.includes(status)) {
      errors.push('Status must be one of: available, assigned, maintenance, out_of_service');
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

export const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  const errors = [];

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Please provide a valid email address');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

export const validateResetPassword = (req, res, next) => {
  const { token, password } = req.body;
  const errors = [];

  // Token validation
  if (!token || token.trim().length < 10) {
    errors.push('Valid reset token is required');
  }

  // Enhanced password validation (same as registration)
  if (!password) {
    errors.push('Password is required');
  } else {
    const passwordErrors = [];
    
    if (password.length < 8) {
      passwordErrors.push('at least 8 characters');
    }
    
    if (!/[A-Z]/.test(password)) {
      passwordErrors.push('one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      passwordErrors.push('one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      passwordErrors.push('one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      passwordErrors.push('one special character');
    }
    
    if (passwordErrors.length > 0) {
      errors.push(`Password must contain ${passwordErrors.join(', ')}`);
    }
    
    // Check for common weak passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      errors.push('Password contains common patterns. Please choose a stronger password.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

export const validateTrip = (req, res, next) => {
  const { vehicleId, driverId, origin, destination, startTime, endTime, distance, fuelConsumed } = req.body;
  const errors = [];

  // Required field validation
  if (!vehicleId) {
    errors.push('Vehicle ID is required');
  }

  if (!driverId) {
    errors.push('Driver ID is required');
  }

  if (!origin || origin.trim().length < 2) {
    errors.push('Origin must be at least 2 characters long');
  }

  if (!destination || destination.trim().length < 2) {
    errors.push('Destination must be at least 2 characters long');
  }

  if (!startTime) {
    errors.push('Start time is required');
  } else {
    const startDate = new Date(startTime);
    if (isNaN(startDate.getTime())) {
      errors.push('Invalid start time format');
    } else if (startDate <= new Date()) {
      errors.push('Start time must be in the future');
    }
  }

  // Optional end time validation
  if (endTime) {
    const endDate = new Date(endTime);
    const startDate = new Date(startTime);
    
    if (isNaN(endDate.getTime())) {
      errors.push('Invalid end time format');
    } else if (endDate <= startDate) {
      errors.push('End time must be after start time');
    }
  }

  // Distance validation
  if (distance !== undefined) {
    if (typeof distance !== 'number' || distance < 0) {
      errors.push('Distance must be a positive number');
    }
  }

  // Fuel consumed validation
  if (fuelConsumed !== undefined) {
    if (typeof fuelConsumed !== 'number' || fuelConsumed < 0) {
      errors.push('Fuel consumed must be a positive number');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

export const validateTripUpdate = (req, res, next) => {
  const { startTime, endTime, distance, fuelConsumed } = req.body;
  const errors = [];

  // Start time validation
  if (startTime) {
    const startDate = new Date(startTime);
    if (isNaN(startDate.getTime())) {
      errors.push('Invalid start time format');
    }
  }

  // End time validation
  if (endTime) {
    const endDate = new Date(endTime);
    const startDate = startTime ? new Date(startTime) : null;
    
    if (isNaN(endDate.getTime())) {
      errors.push('Invalid end time format');
    } else if (startDate && endDate <= startDate) {
      errors.push('End time must be after start time');
    }
  }

  // Distance validation
  if (distance !== undefined) {
    if (typeof distance !== 'number' || distance < 0) {
      errors.push('Distance must be a positive number');
    }
  }

  // Fuel consumed validation
  if (fuelConsumed !== undefined) {
    if (typeof fuelConsumed !== 'number' || fuelConsumed < 0) {
      errors.push('Fuel consumed must be a positive number');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};
