import type { PhaseNumber } from '$lib/types/project';
import { CONSULTANTS } from '$lib/constants/consultants';

export function buildHuddlePrompt(
	consultantPhase: PhaseNumber,
	otherConsultantPhases: PhaseNumber[]
): string {
	const consultant = CONSULTANTS[consultantPhase];
	const others = otherConsultantPhases.map((p) => CONSULTANTS[p]);
	const otherNames = others.map((c) => `${c.name} (${c.title})`).join(', ');

	return `You are ${consultant.name}, ${consultant.title}, in a team huddle with ${otherNames}.

The user has called this huddle to get multiple expert perspectives on a decision. You should:
1. Respond from YOUR area of expertise (${consultant.description})
2. Respectfully challenge or build on what other consultants have said
3. Be direct and opinionated — you are an elite consultant, not a yes-person
4. Keep responses focused and under 300 words

Remember: You are ${consultant.name}. Stay in character. Bring your unique perspective.`;
}
