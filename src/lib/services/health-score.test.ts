import { describe, it, expect } from 'vitest';
import { calculateHealthScore } from '$lib/services/health-score';
import type { Artifact } from '$lib/types/artifact';

function makeArtifact(overrides: Partial<Artifact> = {}): Artifact {
  return {
    id: 'test-id',
    projectId: 'project-1',
    phaseNumber: 1,
    type: 'prd',
    title: 'Test Artifact',
    content: 'x'.repeat(500),
    version: 1,
    isStale: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}

describe('calculateHealthScore', () => {
  it('returns 100 completeness when all required artifacts are present', () => {
    // Phase 1 requires 'prd'
    const artifacts: Artifact[] = [makeArtifact({ phaseNumber: 1, type: 'prd' })];
    const score = calculateHealthScore(1, artifacts);
    expect(score.completeness).toBe(100);
  });

  it('returns 0 completeness when no artifacts are present', () => {
    const score = calculateHealthScore(1, []);
    expect(score.completeness).toBe(0);
  });

  it('returns 100 consistency when no stale artifacts', () => {
    const artifacts: Artifact[] = [
      makeArtifact({ phaseNumber: 1, type: 'prd', isStale: false })
    ];
    const score = calculateHealthScore(1, artifacts);
    expect(score.consistency).toBe(100);
  });

  it('returns reduced consistency when artifacts are stale', () => {
    const artifacts: Artifact[] = [
      makeArtifact({ phaseNumber: 1, type: 'prd', isStale: true })
    ];
    const score = calculateHealthScore(1, artifacts);
    expect(score.consistency).toBeLessThan(100);
    expect(score.consistency).toBe(0);
  });

  it('returns suggestions when completeness < 100', () => {
    // No artifacts for phase 1, so completeness will be 0
    const score = calculateHealthScore(1, []);
    expect(score.suggestions).toContain('Complete all required artifacts for this phase');
  });

  it('returns a phaseNumber matching the input', () => {
    const score = calculateHealthScore(3, []);
    expect(score.phaseNumber).toBe(3);
  });

  it('returns 100 completeness for phase 7 (no required artifacts) even with empty array', () => {
    // Phase 7 has no requiredArtifacts, so completeness should be 100
    const score = calculateHealthScore(7, []);
    expect(score.completeness).toBe(100);
  });
});
