import Joi from 'joi';

// User validation schemas
export const userValidationSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 50 characters',
      'any.required': 'Name is required'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
  
  role: Joi.string()
    .valid('admin', 'fleet_manager', 'driver')
    .required()
    .messages({
      'any.only': 'Role must be one of: admin, fleet_manager, driver',
      'any.required': 'Role is required'
    })
});

export const loginValidationSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

export const forgotPasswordValidationSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});

export const resetPasswordValidationSchema = Joi.object({
  token: Joi.string()
    .min(10)
    .required()
    .messages({
      'string.min': 'Valid reset token is required',
      'any.required': 'Reset token is required'
    }),
  
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    })
});

// Vehicle validation schemas
export const vehicleValidationSchema = Joi.object({
  vehicleNumber: Joi.string()
    .min(3)
    .max(20)
    .required()
    .messages({
      'string.min': 'Vehicle number must be at least 3 characters long',
      'string.max': 'Vehicle number must not exceed 20 characters',
      'any.required': 'Vehicle number is required'
    }),
  
  type: Joi.string()
    .valid('sedan', 'suv', 'truck', 'van', 'bus', 'motorcycle')
    .required()
    .messages({
      'any.only': 'Type must be one of: sedan, suv, truck, van, bus, motorcycle',
      'any.required': 'Vehicle type is required'
    }),
  
  make: Joi.string()
    .min(2)
    .max(30)
    .required()
    .messages({
      'string.min': 'Make must be at least 2 characters long',
      'string.max': 'Make must not exceed 30 characters',
      'any.required': 'Make is required'
    }),
  
  model: Joi.string()
    .min(2)
    .max(30)
    .required()
    .messages({
      'string.min': 'Model must be at least 2 characters long',
      'string.max': 'Model must not exceed 30 characters',
      'any.required': 'Model is required'
    }),
  
  year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .required()
    .messages({
      'number.min': `Year must be at least 1900`,
      'number.max': `Year must not exceed ${new Date().getFullYear() + 1}`,
      'any.required': 'Year is required'
    }),
  
  color: Joi.string()
    .min(2)
    .max(20)
    .required()
    .messages({
      'string.min': 'Color must be at least 2 characters long',
      'string.max': 'Color must not exceed 20 characters',
      'any.required': 'Color is required'
    }),
  
  licensePlate: Joi.string()
    .min(3)
    .max(15)
    .required()
    .messages({
      'string.min': 'License plate must be at least 3 characters long',
      'string.max': 'License plate must not exceed 15 characters',
      'any.required': 'License plate is required'
    }),
  
  vin: Joi.string()
    .length(17)
    .pattern(/^[A-HJ-NPR-Z0-9]{17}$/)
    .required()
    .messages({
      'string.length': 'VIN must be exactly 17 characters',
      'string.pattern.base': 'VIN must contain only valid characters (A-H, J-N, P-R, T-Z, 0-9)',
      'any.required': 'VIN is required'
    }),
  
  fuelType: Joi.string()
    .valid('gasoline', 'diesel', 'electric', 'hybrid', 'lpg')
    .default('gasoline')
    .messages({
      'any.only': 'Fuel type must be one of: gasoline, diesel, electric, hybrid, lpg'
    }),
  
  fuelCapacity: Joi.number()
    .min(0)
    .max(1000)
    .messages({
      'number.min': 'Fuel capacity must be at least 0 liters',
      'number.max': 'Fuel capacity must not exceed 1000 liters'
    }),
  
  mileage: Joi.number()
    .min(0)
    .default(0)
    .messages({
      'number.min': 'Mileage must be a positive number'
    }),
  
  status: Joi.string()
    .valid('available', 'assigned', 'maintenance', 'out_of_service')
    .default('available')
    .messages({
      'any.only': 'Status must be one of: available, assigned, maintenance, out_of_service'
    }),
  
  assignedDriver: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Assigned driver must be a valid ObjectId'
    }),
  
  lastServiceDate: Joi.date()
    .max('now')
    .messages({
      'date.max': 'Last service date cannot be in the future'
    }),
  
  nextServiceDue: Joi.date()
    .min('now')
    .messages({
      'date.min': 'Next service due date must be in the future'
    }),
  
  insuranceExpiry: Joi.date()
    .min('now')
    .messages({
      'date.min': 'Insurance expiry date must be in the future'
    }),
  
  registrationExpiry: Joi.date()
    .min('now')
    .messages({
      'date.min': 'Registration expiry date must be in the future'
    }),
  
  notes: Joi.string()
    .max(500)
    .messages({
      'string.max': 'Notes must not exceed 500 characters'
    })
});

// Trip validation schemas
export const tripValidationSchema = Joi.object({
  vehicleId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Vehicle ID must be a valid ObjectId',
      'any.required': 'Vehicle ID is required'
    }),
  
  driverId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Driver ID must be a valid ObjectId',
      'any.required': 'Driver ID is required'
    }),
  
  origin: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Origin must be at least 2 characters long',
      'string.max': 'Origin must not exceed 100 characters',
      'any.required': 'Origin is required'
    }),
  
  destination: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Destination must be at least 2 characters long',
      'string.max': 'Destination must not exceed 100 characters',
      'any.required': 'Destination is required'
    }),
  
  startTime: Joi.date()
    .min('now')
    .required()
    .messages({
      'date.min': 'Start time must be in the future',
      'any.required': 'Start time is required'
    }),
  
  endTime: Joi.date()
    .min(Joi.ref('startTime'))
    .messages({
      'date.min': 'End time must be after start time'
    }),
  
  distance: Joi.number()
    .min(0)
    .max(10000)
    .messages({
      'number.min': 'Distance must be a positive number',
      'number.max': 'Distance must not exceed 10000 km'
    }),
  
  fuelConsumed: Joi.number()
    .min(0)
    .max(1000)
    .messages({
      'number.min': 'Fuel consumed must be a positive number',
      'number.max': 'Fuel consumed must not exceed 1000 liters'
    }),
  
  notes: Joi.string()
    .max(500)
    .messages({
      'string.max': 'Notes must not exceed 500 characters'
    })
});

export const tripUpdateValidationSchema = Joi.object({
  vehicleId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Vehicle ID must be a valid ObjectId'
    }),
  
  driverId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Driver ID must be a valid ObjectId'
    }),
  
  origin: Joi.string()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Origin must be at least 2 characters long',
      'string.max': 'Origin must not exceed 100 characters'
    }),
  
  destination: Joi.string()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Destination must be at least 2 characters long',
      'string.max': 'Destination must not exceed 100 characters'
    }),
  
  status: Joi.string()
    .valid('scheduled', 'in_progress', 'completed', 'cancelled')
    .messages({
      'any.only': 'Status must be one of: scheduled, in_progress, completed, cancelled'
    }),
  
  startTime: Joi.date()
    .messages({
      'date.base': 'Invalid start time format'
    }),
  
  endTime: Joi.date()
    .min(Joi.ref('startTime'))
    .messages({
      'date.min': 'End time must be after start time'
    }),
  
  distance: Joi.number()
    .min(0)
    .max(10000)
    .messages({
      'number.min': 'Distance must be a positive number',
      'number.max': 'Distance must not exceed 10000 km'
    }),
  
  fuelConsumed: Joi.number()
    .min(0)
    .max(1000)
    .messages({
      'number.min': 'Fuel consumed must be a positive number',
      'number.max': 'Fuel consumed must not exceed 1000 liters'
    }),
  
  notes: Joi.string()
    .max(500)
    .messages({
      'string.max': 'Notes must not exceed 500 characters'
    })
});

// Analytics validation schemas
export const analyticsQueryValidationSchema = Joi.object({
  startDate: Joi.date()
    .messages({
      'date.base': 'Invalid start date format'
    }),
  
  endDate: Joi.date()
    .min(Joi.ref('startDate'))
    .messages({
      'date.min': 'End date must be after start date',
      'date.base': 'Invalid end date format'
    }),
  
  groupBy: Joi.string()
    .valid('day', 'week', 'month', 'year')
    .default('month')
    .messages({
      'any.only': 'Group by must be one of: day, week, month, year'
    }),
  
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.min': 'Page must be at least 1',
      'number.integer': 'Page must be an integer'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must not exceed 100',
      'number.integer': 'Limit must be an integer'
    })
});

// Generic validation middleware
export const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: errorMessages
      });
    }
    
    req[property] = value;
    next();
  };
};

// Specific validation middlewares
export const validateUser = validateRequest(userValidationSchema);
export const validateLogin = validateRequest(loginValidationSchema);
export const validateForgotPassword = validateRequest(forgotPasswordValidationSchema);
export const validateResetPassword = validateRequest(resetPasswordValidationSchema);
export const validateVehicle = validateRequest(vehicleValidationSchema);
export const validateTrip = validateRequest(tripValidationSchema);
export const validateTripUpdate = validateRequest(tripUpdateValidationSchema);
export const validateAnalyticsQuery = validateRequest(analyticsQueryValidationSchema, 'query');
