// Tests for pagination utilities

import { describe, it, expect } from '@jest/globals';
import {
  getPaginationParams,
  getSortParams,
  getFilterParams,
  createPaginatedResponse,
  getSearchFilter
} from '../../utils/pagination.js';

describe('Pagination Utilities', () => {
  describe('getPaginationParams', () => {
    it('should return default pagination when no query params', () => {
      const req = { query: {} };
      const result = getPaginationParams(req);
      
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.skip).toBe(0);
    });

    it('should handle custom page and limit', () => {
      const req = { query: { page: '2', limit: '20' } };
      const result = getPaginationParams(req);
      
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.skip).toBe(20);
    });

    it('should enforce minimum page of 1', () => {
      const req = { query: { page: '0' } };
      const result = getPaginationParams(req);
      
      expect(result.page).toBe(1);
    });

    it('should enforce max limit', () => {
      const req = { query: { limit: '200' } };
      const result = getPaginationParams(req, { maxLimit: 100 });
      
      expect(result.limit).toBe(100);
    });
  });

  describe('getSortParams', () => {
    it('should return default sort when no query params', () => {
      const req = { query: {} };
      const result = getSortParams(req, [], '-createdAt');
      
      expect(result).toEqual({ createdAt: -1 });
    });

    it('should handle ascending sort', () => {
      const req = { query: { sortBy: 'name' } };
      const result = getSortParams(req, ['name']);
      
      expect(result).toEqual({ name: 1 });
    });

    it('should handle descending sort', () => {
      const req = { query: { sortBy: '-createdAt' } };
      const result = getSortParams(req, ['createdAt']);
      
      expect(result).toEqual({ createdAt: -1 });
    });

    it('should ignore invalid sort fields', () => {
      const req = { query: { sortBy: 'invalidField' } };
      const result = getSortParams(req, ['name', 'email'], '-createdAt');
      
      expect(result).toEqual({ createdAt: -1 });
    });
  });

  describe('getFilterParams', () => {
    it('should return empty filter when no query params', () => {
      const req = { query: {} };
      const result = getFilterParams(req, ['status']);
      
      expect(result).toEqual({});
    });

    it('should handle simple filters', () => {
      const req = { query: { status: 'active' } };
      const result = getFilterParams(req, ['status']);
      
      expect(result).toEqual({ status: 'active' });
    });

    it('should handle array filters', () => {
      const req = { query: { status: 'active,completed' } };
      const result = getFilterParams(req, ['status']);
      
      expect(result).toEqual({ status: { $in: ['active', 'completed'] } });
    });

    it('should handle boolean filters', () => {
      const req = { query: { isActive: 'true' } };
      const result = getFilterParams(req, ['isActive']);
      
      expect(result).toEqual({ isActive: true });
    });

    it('should handle numeric range filters', () => {
      const req = { query: { priceMin: '100', priceMax: '500' } };
      const result = getFilterParams(req, ['price']);
      
      expect(result.price).toEqual({ $gte: 100, $lte: 500 });
    });
  });

  describe('createPaginatedResponse', () => {
    it('should create correct paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = createPaginatedResponse(data, 1, 10, 25);
      
      expect(result.data).toEqual(data);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(false);
    });

    it('should handle last page correctly', () => {
      const data = [{ id: 1 }];
      const result = createPaginatedResponse(data, 3, 10, 25);
      
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPreviousPage).toBe(true);
    });
  });

  describe('getSearchFilter', () => {
    it('should return empty filter when no search term', () => {
      const result = getSearchFilter('', ['name', 'email']);
      
      expect(result).toEqual({});
    });

    it('should create search filter for multiple fields', () => {
      const result = getSearchFilter('john', ['name', 'email']);
      
      expect(result.$or).toHaveLength(2);
      expect(result.$or[0]).toEqual({ name: { $regex: 'john', $options: 'i' } });
      expect(result.$or[1]).toEqual({ email: { $regex: 'john', $options: 'i' } });
    });
  });
});

