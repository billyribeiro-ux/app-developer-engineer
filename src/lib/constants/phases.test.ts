import { describe, it, expect } from 'vitest';
import { PHASE_GATES } from '$lib/constants/phases';

describe('PHASE_GATES', () => {
  it('has gates defined for all 7 phases', () => {
    const phases = Object.keys(PHASE_GATES).map(Number);
    expect(phases).toHaveLength(7);
    for (let i = 1; i <= 7; i++) {
      expect(PHASE_GATES[i as keyof typeof PHASE_GATES]).toBeDefined();
    }
  });

  it('phase 7 has empty requiredArtifacts (terminal phase)', () => {
    expect(PHASE_GATES[7].requiredArtifacts).toHaveLength(0);
  });

  it('each gate has a description string', () => {
    for (let i = 1; i <= 7; i++) {
      const gate = PHASE_GATES[i as keyof typeof PHASE_GATES];
      expect(gate.description).toBeTypeOf('string');
      expect(gate.description.length).toBeGreaterThan(0);
    }
  });

  it('each gate has a requiredArtifacts array', () => {
    for (let i = 1; i <= 7; i++) {
      const gate = PHASE_GATES[i as keyof typeof PHASE_GATES];
      expect(Array.isArray(gate.requiredArtifacts)).toBe(true);
    }
  });
});
