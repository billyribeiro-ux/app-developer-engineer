import type { PhaseNumber } from '$lib/types/project';
import type { Artifact } from '$lib/types/artifact';
import type { HealthScore } from '$lib/types/consultant';
import { PHASE_GATES } from '$lib/constants/phases';

export function calculateHealthScore(
  phaseNumber: PhaseNumber,
  artifacts: Artifact[]
): HealthScore {
  const phaseArtifacts = artifacts.filter((a) => a.phaseNumber === phaseNumber);
  const gate = PHASE_GATES[phaseNumber];

  // Completeness: what percentage of required artifacts exist
  const requiredCount = gate.requiredArtifacts.length;
  const presentCount = requiredCount === 0
    ? 1
    : gate.requiredArtifacts.filter((req) =>
        phaseArtifacts.some((a) => a.type === req)
      ).length;
  const completeness = requiredCount === 0 ? 100 : Math.round((presentCount / requiredCount) * 100);

  // Clarity: based on artifact content length (heuristic)
  const avgLength = phaseArtifacts.length > 0
    ? phaseArtifacts.reduce((sum, a) => sum + a.content.length, 0) / phaseArtifacts.length
    : 0;
  const clarity = Math.min(100, Math.round(avgLength / 10));

  // Consistency: no stale artifacts
  const staleCount = phaseArtifacts.filter((a) => a.isStale).length;
  const consistency = phaseArtifacts.length > 0
    ? Math.round(((phaseArtifacts.length - staleCount) / phaseArtifacts.length) * 100)
    : 100;

  const overall = Math.round((completeness + clarity + consistency) / 3);

  const suggestions: string[] = [];
  if (completeness < 100) suggestions.push('Complete all required artifacts for this phase');
  if (clarity < 50) suggestions.push('Add more detail to your artifacts');
  if (consistency < 100) suggestions.push('Some artifacts are stale — regenerate with updated context');

  return { phaseNumber, completeness, clarity, consistency, overall, suggestions };
}
