<script lang="ts">
  import { phaseState } from '$lib/state/phase.svelte';
  import { CONSULTANTS } from '$lib/constants/consultants';
  import type { PhaseNumber } from '$lib/types/project';

  let { onselect }: { onselect: (content: string) => void } = $props();

  const consultant = $derived(CONSULTANTS[phaseState.currentPhaseNumber]);

  const PROMPTS: Record<PhaseNumber, string[]> = {
    1: [
      "I have a product idea. Here's what I'm thinking...",
      "Help me define the problem statement for my app",
      "What are the 5 questions that would kill my product if unanswered?",
      "I need to define user personas for my target audience"
    ],
    2: [
      "Help me design the system architecture",
      "Let's define the data models and their relationships",
      "What should the API contract look like?",
      "Suggest a folder structure for my stack"
    ],
    3: [
      "Break down this feature into atomic work units",
      "Define acceptance criteria for each unit",
      "What's the optimal build order?",
      "Map the dependencies between features"
    ],
    4: [
      "Create a component inventory for this feature",
      "Map out the state management for each component",
      "What states does each component need? (loading, empty, error)",
      "Design the interaction model for the main workflow"
    ],
    5: [
      "Implement this work unit exactly as specified",
      "Write the TypeScript interfaces from the data model",
      "Build the main component with type-safe props",
      "Generate the API integration layer"
    ],
    6: [
      "Write tests for this unit's acceptance criteria",
      "What edge cases should I test for?",
      "Generate integration tests for the main flow",
      "Review my test coverage and suggest gaps"
    ],
    7: [
      "Generate CI/CD pipeline configuration",
      "Set up environment variable schema with validation",
      "Create health check endpoints",
      "Write the deployment runbook with rollback plan"
    ]
  };

  const prompts = $derived(PROMPTS[phaseState.currentPhaseNumber] || []);
</script>

<div class="suggested-prompts">
  <div class="prompts-header">
    <div class="consultant-avatar" style:--accent={consultant.accentColor}>
      {consultant.name.charAt(0)}
    </div>
    <div>
      <h3>{consultant.name}</h3>
      <p>{consultant.title} — {consultant.description}</p>
    </div>
  </div>
  <p class="prompts-subtitle">{consultant.personality}</p>
  <div class="prompts-grid">
    {#each prompts as prompt}
      <button class="prompt-card" onclick={() => onselect(prompt)}>
        {prompt}
      </button>
    {/each}
  </div>
</div>

<style>
  .suggested-prompts {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 40px 20px; max-width: 640px; margin: 0 auto;
  }
  .prompts-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .consultant-avatar {
    width: 48px; height: 48px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: var(--accent); color: white; font-weight: 700; font-size: 20px;
  }
  .prompts-header h3 { font-size: 18px; font-weight: 600; color: var(--text-primary); }
  .prompts-header p { font-size: 13px; color: var(--text-secondary); }
  .prompts-subtitle { color: var(--text-tertiary); font-size: 13px; margin-bottom: 24px; text-align: center; }
  .prompts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; }
  .prompt-card {
    padding: 12px 16px; background: var(--bg-surface); border: 1px solid var(--border-primary);
    border-radius: var(--radius-md); text-align: left; font-size: 13px; color: var(--text-secondary);
    line-height: 1.4; transition: all var(--transition-fast);
  }
  .prompt-card:hover { border-color: var(--accent-primary); color: var(--text-primary); background: var(--bg-hover); }
</style>
