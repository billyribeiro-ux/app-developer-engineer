import { describe, it, expect } from 'vitest';
import { generateId } from '$lib/utils/id';

describe('generateId', () => {
  it('returns a string', () => {
    const id = generateId();
    expect(id).toBeTypeOf('string');
  });

  it('returns unique values on multiple calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it('returns valid UUID format', () => {
    const id = generateId();
    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(id).toMatch(uuidRegex);
  });
});
