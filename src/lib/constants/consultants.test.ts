import { describe, it, expect } from 'vitest';
import { CONSULTANTS } from '$lib/constants/consultants';

describe('CONSULTANTS', () => {
  it('has consultants defined for all 7 phases', () => {
    const phases = Object.keys(CONSULTANTS).map(Number);
    expect(phases).toHaveLength(7);
    for (let i = 1; i <= 7; i++) {
      expect(CONSULTANTS[i as keyof typeof CONSULTANTS]).toBeDefined();
    }
  });

  it('each consultant has required fields', () => {
    for (let i = 1; i <= 7; i++) {
      const consultant = CONSULTANTS[i as keyof typeof CONSULTANTS];
      expect(consultant.id).toBeTypeOf('string');
      expect(consultant.id.length).toBeGreaterThan(0);
      expect(consultant.name).toBeTypeOf('string');
      expect(consultant.name.length).toBeGreaterThan(0);
      expect(consultant.title).toBeTypeOf('string');
      expect(consultant.title.length).toBeGreaterThan(0);
      expect(consultant.phaseNumber).toBe(i);
      expect(consultant.accentColor).toBeTypeOf('string');
      expect(consultant.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('has no duplicate consultant IDs', () => {
    const ids = Object.values(CONSULTANTS).map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
