<script lang="ts">
  let {
    phaseNumber,
    name,
    consultantName,
    accentColor,
    active = false,
    unlocked = false,
    completed = false,
    onclick
  }: {
    phaseNumber: number;
    name: string;
    consultantName: string;
    accentColor: string;
    active?: boolean;
    unlocked?: boolean;
    completed?: boolean;
    onclick: () => void;
  } = $props();
</script>

<button
  class="step"
  class:active
  class:locked={!unlocked && !completed}
  class:completed
  {onclick}
  disabled={!unlocked && !completed && !active}
>
  <div class="step-indicator" style:--accent={accentColor}>
    <span class="step-number">{completed ? '✓' : phaseNumber}</span>
  </div>
  <div class="step-content">
    <span class="step-name">{name}</span>
    <span class="step-consultant">{consultantName}</span>
  </div>
</button>

<style>
  .step {
    width: 100%; text-align: left; padding: 8px 10px; border-radius: var(--radius-md);
    display: flex; align-items: center; gap: 10px;
    transition: all var(--transition-fast); opacity: 1;
  }
  .step:hover:not(:disabled) { background: var(--bg-hover); }
  .step.active { background: var(--bg-active); }
  .step.locked { opacity: 0.4; cursor: not-allowed; }
  .step.completed .step-indicator { background: var(--success); }

  .step-indicator {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: var(--bg-tertiary); border: 2px solid var(--border-primary);
    flex-shrink: 0; transition: all var(--transition-fast);
  }
  .step.active .step-indicator { background: var(--accent); border-color: var(--accent); }

  .step-number { font-size: 12px; font-weight: 600; color: var(--text-secondary); }
  .step.active .step-number { color: white; }
  .step.completed .step-number { color: white; font-size: 10px; }

  .step-content { display: flex; flex-direction: column; min-width: 0; }
  .step-name { font-size: 13px; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .step-consultant { font-size: 11px; color: var(--text-tertiary); }
  .step.locked .step-name, .step.locked .step-consultant { color: var(--text-tertiary); }
</style>
