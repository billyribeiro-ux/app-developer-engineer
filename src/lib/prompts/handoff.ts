import type { PhaseNumber } from '$lib/types/project';
import { CONSULTANTS } from '$lib/constants/consultants';

export function buildHandoffOutgoingPrompt(fromPhase: PhaseNumber): string {
	const consultant = CONSULTANTS[fromPhase];
	return `You are ${consultant.name}, ${consultant.title}. You have just completed Phase ${fromPhase}: ${consultant.description} with the user.

Write a professional handoff briefing for the next consultant. Include:
1. **Summary**: What was accomplished in this phase (2-3 sentences)
2. **Key Decisions**: The most important decisions made
3. **Deliverables**: What artifacts were produced
4. **Watch Out**: Any risks, open questions, or concerns the next consultant should know about

Be concise, direct, and professional. This is a briefing, not a conversation.`;
}

export function buildHandoffIncomingPrompt(toPhase: PhaseNumber): string {
	const consultant = CONSULTANTS[toPhase];
	return `You are ${consultant.name}, ${consultant.title}, taking over for Phase ${toPhase}: ${consultant.description}.

You have just received a handoff briefing from the previous consultant. Acknowledge the briefing and:
1. Confirm what you understand about the project so far
2. State your expectations for this phase
3. Ask the user your first question to get started

Be professional but show your personality. Set the tone for your phase.`;
}
