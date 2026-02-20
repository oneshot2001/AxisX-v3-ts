import { describe, it, expect } from 'vitest';
import { normalizeMountType } from '@/core/accessory/mountNormalizer';

describe('normalizeMountType', () => {
  // Exact matches — pole
  it('normalizes "pole" → pole', () => {
    expect(normalizeMountType('pole')).toBe('pole');
  });

  it('normalizes "pole mount" → pole', () => {
    expect(normalizeMountType('pole mount')).toBe('pole');
  });

  it('normalizes "Pole Mount" → pole (case insensitive)', () => {
    expect(normalizeMountType('Pole Mount')).toBe('pole');
  });

  // Wall
  it('normalizes "wall" → wall', () => {
    expect(normalizeMountType('wall')).toBe('wall');
  });

  it('normalizes "wall mounted" → wall', () => {
    expect(normalizeMountType('wall mounted')).toBe('wall');
  });

  // Ceiling
  it('normalizes "ceiling" → ceiling', () => {
    expect(normalizeMountType('ceiling')).toBe('ceiling');
  });

  it('normalizes "drop ceiling" → ceiling', () => {
    expect(normalizeMountType('drop ceiling')).toBe('ceiling');
  });

  it('normalizes "t-bar" → ceiling', () => {
    expect(normalizeMountType('t-bar')).toBe('ceiling');
  });

  // Recessed
  it('normalizes "ceiling recessed" → recessed', () => {
    expect(normalizeMountType('ceiling recessed')).toBe('recessed');
  });

  it('normalizes "recessed ceiling" → recessed', () => {
    expect(normalizeMountType('recessed ceiling')).toBe('recessed');
  });

  it('normalizes "in-ceiling" → recessed', () => {
    expect(normalizeMountType('in-ceiling')).toBe('recessed');
  });

  // Flush
  it('normalizes "flush mount" → flush', () => {
    expect(normalizeMountType('flush mount')).toBe('flush');
  });

  // Pendant
  it('normalizes "pendant" → pendant', () => {
    expect(normalizeMountType('pendant')).toBe('pendant');
  });

  it('normalizes "pendant drop" → pendant', () => {
    expect(normalizeMountType('pendant drop')).toBe('pendant');
  });

  it('normalizes "hanging" → pendant', () => {
    expect(normalizeMountType('hanging')).toBe('pendant');
  });

  it('normalizes "suspended" → pendant', () => {
    expect(normalizeMountType('suspended')).toBe('pendant');
  });

  // Corner
  it('normalizes "corner" → corner', () => {
    expect(normalizeMountType('corner')).toBe('corner');
  });

  it('normalizes "corner bracket" → corner', () => {
    expect(normalizeMountType('corner bracket')).toBe('corner');
  });

  // Parapet
  it('normalizes "parapet" → parapet', () => {
    expect(normalizeMountType('parapet')).toBe('parapet');
  });

  it('normalizes "roof edge" → parapet', () => {
    expect(normalizeMountType('roof edge')).toBe('parapet');
  });

  it('normalizes "rooftop" → parapet', () => {
    expect(normalizeMountType('rooftop')).toBe('parapet');
  });

  // Edge cases
  it('handles leading/trailing whitespace', () => {
    expect(normalizeMountType('  pole  ')).toBe('pole');
    expect(normalizeMountType('\t wall mount \n')).toBe('wall');
  });

  it('handles hyphens and underscores ("pole-mount" → pole)', () => {
    expect(normalizeMountType('pole-mount')).toBe('pole');
    expect(normalizeMountType('pole_mount')).toBe('pole');
    expect(normalizeMountType('wall-mounted')).toBe('wall');
    expect(normalizeMountType('ceiling_mount')).toBe('ceiling');
  });

  it('returns null for unrecognizable input ("xyz123")', () => {
    expect(normalizeMountType('xyz123')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(normalizeMountType('')).toBeNull();
    expect(normalizeMountType('   ')).toBeNull();
  });

  it('fuzzy matches close misspellings ("ceilling" → ceiling)', () => {
    expect(normalizeMountType('ceilling')).toBe('ceiling');
  });
});
