import { describe, it, expect, vi, beforeEach } from 'vitest';
import { truncateString, formatDate, generateId } from '../../utils';

describe('Utility Functions', () => {
  describe('truncateString', () => {
    it('should return the string as is if shorter than max length', () => {
      const result = truncateString('Hello World', 20);
      expect(result).toBe('Hello World');
    });

    it('should truncate string with ellipsis if longer than max length', () => {
      const result = truncateString('This is a long string that should be truncated', 10);
      expect(result).toBe('This is a ...');
    });

    it('should handle empty strings', () => {
      const result = truncateString('', 10);
      expect(result).toBe('');
    });

    it('should handle null or undefined', () => {
      // @ts-ignore - Testing null case
      const result1 = truncateString(null, 10);
      // @ts-ignore - Testing undefined case
      const result2 = truncateString(undefined, 10);
      expect(result1).toBe('');
      expect(result2).toBe('');
    });

    it('should use default length if not provided', () => {
      const longString = 'a'.repeat(110);
      const result = truncateString(longString);
      expect(result.length).toBe(103); // 100 chars + '...'
    });
  });

  describe('formatDate', () => {
    it('should format date correctly with default format', () => {
      const date = '2025-05-15T12:30:45Z';
      const result = formatDate(date);
      expect(result).toBe('May 15, 2025');
    });

    it('should handle empty date strings', () => {
      const result = formatDate('');
      expect(result).toBe('');
    });

    it('should support custom format', () => {
      const date = '2025-05-15T12:30:45Z';
      const result = formatDate(date, 'D-MMM-YYYY');
      expect(result).toBe('15-May-2025');
    });
  });

  describe('generateId', () => {
    it('should generate an ID with default length', () => {
      const id = generateId();
      expect(id.length).toBe(8);
      // Should contain only alphanumeric characters
      expect(id).toMatch(/^[a-zA-Z0-9]+$/);
    });

    it('should generate an ID with specified length', () => {
      const id = generateId(12);
      expect(id.length).toBe(12);
    });

    it('should generate different IDs each time', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });
});
