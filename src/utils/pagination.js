// Pagination utility functions

/**
 * Get pagination parameters from request query
 * @param {Object} req - Express request object
 * @param {Object} options - Options for pagination
 * @returns {Object} Pagination parameters
 */
export const getPaginationParams = (req, options = {}) => {
  const defaultLimit = options.defaultLimit || 10;
  const maxLimit = options.maxLimit || 100;
  
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit) || defaultLimit));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

/**
 * Get sorting parameters from request query
 * @param {Object} req - Express request object
 * @param {Array} allowedFields - Allowed fields for sorting
 * @param {String} defaultSort - Default sort field and order (e.g., '-createdAt')
 * @returns {Object} Sort object for MongoDB
 */
export const getSortParams = (req, allowedFields = [], defaultSort = '-createdAt') => {
  const sortBy = req.query.sortBy || defaultSort;
  const sortField = sortBy.replace(/^-/, '');
  const sortOrder = sortBy.startsWith('-') ? -1 : 1;
  
  // Validate sort field if allowedFields is provided
  if (allowedFields.length > 0 && !allowedFields.includes(sortField)) {
    return { [defaultSort.replace(/^-/, '')]: defaultSort.startsWith('-') ? -1 : 1 };
  }
  
  return { [sortField]: sortOrder };
};

/**
 * Get filter parameters from request query
 * @param {Object} req - Express request object
 * @param {Array} allowedFilters - Allowed filter fields
 * @returns {Object} Filter object for MongoDB
 */
export const getFilterParams = (req, allowedFilters = []) => {
  const filter = {};
  const query = req.query;
  
  allowedFilters.forEach(field => {
    if (query[field] !== undefined && query[field] !== '') {
      // Handle date range filters
      if (field.includes('Date') || field.includes('Time')) {
        if (query[`${field}From`]) {
          filter[field] = { ...filter[field], $gte: new Date(query[`${field}From`]) };
        }
        if (query[`${field}To`]) {
          filter[field] = { ...filter[field], $lte: new Date(query[`${field}To`]) };
        }
        if (query[field] && !query[`${field}From`] && !query[`${field}To`]) {
          filter[field] = new Date(query[field]);
        }
      }
      // Handle array filters (e.g., status=scheduled,completed)
      else if (query[field].includes(',')) {
        filter[field] = { $in: query[field].split(',') };
      }
      // Handle boolean filters
      else if (query[field] === 'true' || query[field] === 'false') {
        filter[field] = query[field] === 'true';
      }
      // Handle numeric filters with operators
      else if (query[`${field}Min`] || query[`${field}Max`]) {
        filter[field] = {};
        if (query[`${field}Min`]) filter[field].$gte = Number(query[`${field}Min`]);
        if (query[`${field}Max`]) filter[field].$lte = Number(query[`${field}Max`]);
      }
      // Handle search queries (partial match)
      else if (field === 'search' || field === 'q') {
        // This will be handled separately in controllers
      }
      // Default: exact match
      else {
        filter[field] = query[field];
      }
    }
  });
  
  return filter;
};

/**
 * Create paginated response
 * @param {Object} data - Data to paginate
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} total - Total items
 * @returns {Object} Paginated response object
 */
export const createPaginatedResponse = (data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null
    }
  };
};

/**
 * Get search filter for text search
 * @param {String} searchTerm - Search term
 * @param {Array} searchFields - Fields to search in
 * @returns {Object} MongoDB search filter
 */
export const getSearchFilter = (searchTerm, searchFields = []) => {
  if (!searchTerm || searchFields.length === 0) {
    return {};
  }
  
  return {
    $or: searchFields.map(field => ({
      [field]: { $regex: searchTerm, $options: 'i' }
    }))
  };
};

