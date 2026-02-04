/**
 * URL Resolver Tests
 */

import { describe, it, expect } from 'vitest';
import { URLResolver } from '../src/core/url/resolver';
import { VERIFIED_URLS } from '../src/core/url/verified';
import { MODEL_ALIASES, DISCONTINUED_MODELS } from '../src/core/url/aliases';

describe('URL Resolver', () => {
  const resolver = new URLResolver();

  describe('Verified URLs', () => {
    it('returns verified URL for known models', () => {
      const result = resolver.resolve('P3265-LVE');
      expect(result.confidence).toBe('verified');
      expect(result.url).toContain('p3265-lve');
      expect(result.isDiscontinued).toBe(false);
    });

    it('handles case insensitivity', () => {
      const result = resolver.resolve('p3265-lve');
      expect(result.confidence).toBe('verified');
    });

    it('strips AXIS prefix', () => {
      const result = resolver.resolve('AXIS P3265-LVE');
      expect(result.resolvedModel).toBe('P3265-LVE');
    });
  });

  describe('Aliases', () => {
    it('resolves aliased models', () => {
      const result = resolver.resolve('P3265LVE'); // Missing hyphen
      expect(result.resolvedModel).toBe('P3265-LVE');
    });

    it('handles invalid variant redirects', () => {
      if (MODEL_ALIASES['P3275-V']) {
        const result = resolver.resolve('P3275-V');
        expect(result.confidence).toBe('alias');
        expect(result.warning).toBeDefined();
      }
    });
  });

  describe('Base Model Fallback', () => {
    it('strips frequency suffixes', () => {
      const result = resolver.resolve('P3265-LVE-60HZ');
      expect(result.resolvedModel).not.toContain('60HZ');
    });

    it('strips regional suffixes', () => {
      const result = resolver.resolve('P3265-LVE-EUR');
      expect(result.resolvedModel).not.toContain('EUR');
    });

    it('strips lens suffixes', () => {
      const result = resolver.resolve('Q1785-LE-35MM');
      expect(result.resolvedModel).not.toContain('35MM');
    });
  });

  describe('Discontinued Models', () => {
    it('marks discontinued models correctly', () => {
      if (DISCONTINUED_MODELS.includes('P3364-LVE')) {
        const result = resolver.resolve('P3364-LVE');
        expect(result.isDiscontinued).toBe(true);
      }
    });

    it('uses search fallback for discontinued models', () => {
      if (DISCONTINUED_MODELS.includes('P3364-LVE')) {
        const result = resolver.resolve('P3364-LVE');
        expect(result.confidence).toBe('search-fallback');
        expect(result.url).toContain('?q=');
      }
    });
  });

  describe('Generated URLs', () => {
    it('generates URL for unknown models', () => {
      const result = resolver.resolve('NEWMODEL-123');
      expect(result.confidence).toBe('generated');
      expect(result.url).toContain('axis-newmodel-123');
    });

    it('generates lowercase slugs', () => {
      const result = resolver.resolve('TEST-MODEL');
      expect(result.url).toContain('test-model');
      expect(result.url).not.toContain('TEST');
    });
  });

  describe('Helper Methods', () => {
    it('isVerified returns correct values', () => {
      expect(resolver.isVerified('P3265-LVE')).toBe(true);
      expect(resolver.isVerified('NONEXISTENT-123')).toBe(false);
    });

    it('isDiscontinued returns correct values', () => {
      if (DISCONTINUED_MODELS.length > 0) {
        expect(resolver.isDiscontinued(DISCONTINUED_MODELS[0]!)).toBe(true);
      }
      expect(resolver.isDiscontinued('P3265-LVE')).toBe(false);
    });

    it('getVerifiedUrls returns map', () => {
      const urls = resolver.getVerifiedUrls();
      expect(urls instanceof Map).toBe(true);
      expect(urls.size).toBe(Object.keys(VERIFIED_URLS).length);
    });
  });
});
