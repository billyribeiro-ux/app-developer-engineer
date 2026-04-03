import type { Artifact } from '$lib/types/artifact';
import type { PhaseNumber } from '$lib/types/project';
import type { Message } from '$lib/types/message';
import type { ClaudeMessage } from '$lib/types/claude';
import { getSystemPrompt } from './index';

export function buildSystemPrompt(
	phaseNumber: PhaseNumber,
	artifacts: Artifact[],
	memories: string
): string {
	const basePrompt = getSystemPrompt(phaseNumber);
	const artifactContext = buildArtifactContext(phaseNumber, artifacts);
	const memorySection = memories
		? `\n\n## Your Memories from Working with This User\n${memories}`
		: '';

	return `${basePrompt}${memorySection}\n\n## Context from Previous Phases\n${artifactContext}`;
}

function buildArtifactContext(currentPhase: PhaseNumber, artifacts: Artifact[]): string {
	const relevant = artifacts
		.filter((a) => a.phaseNumber < currentPhase)
		.sort((a, b) => a.phaseNumber - b.phaseNumber);

	if (relevant.length === 0) return 'No prior phase artifacts yet.';

	return relevant
		.map((a) => `### [Phase ${a.phaseNumber}] ${a.title} (${a.type})\n${a.content}`)
		.join('\n\n---\n\n');
}

export function buildMessages(history: Message[]): ClaudeMessage[] {
	return history.map((m) => ({
		role: m.role,
		content: m.content
	}));
}
