<script lang="ts">
  import { CONSULTANTS } from '$lib/constants/consultants';
  import type { PhaseNumber } from '$lib/types/project';

  let { fromPhase, toPhase, onComplete }: { fromPhase: number; toPhase: number; onComplete: () => void } = $props();

  const from = $derived(CONSULTANTS[fromPhase as PhaseNumber]);
  const to = $derived(CONSULTANTS[toPhase as PhaseNumber]);
</script>

<div class="handoff-overlay">
  <div class="handoff-card">
    <div class="handoff-header">
      <span class="handoff-label">Phase Transition</span>
      <h2>Handoff Ceremony</h2>
    </div>

    <div class="handoff-flow">
      <div class="consultant-badge outgoing">
        <div class="consultant-avatar" style:--accent={from.accentColor}>
          {from.name.charAt(0)}
        </div>
        <span class="consultant-name">{from.name}</span>
        <span class="consultant-title">{from.title}</span>
        <span class="phase-label">Phase {fromPhase}</span>
      </div>

      <div class="arrow-container">
        <div class="arrow-line"></div>
        <span class="arrow-icon">→</span>
        <div class="arrow-line"></div>
      </div>

      <div class="consultant-badge incoming">
        <div class="consultant-avatar" style:--accent={to.accentColor}>
          {to.name.charAt(0)}
        </div>
        <span class="consultant-name">{to.name}</span>
        <span class="consultant-title">{to.title}</span>
        <span class="phase-label">Phase {toPhase}</span>
      </div>
    </div>

    <p class="handoff-message">
      {from.name} is handing off to {to.name}. All artifacts and context from Phase {fromPhase} will carry forward.
    </p>

    <button class="continue-btn" onclick={onComplete}>
      Meet {to.name} →
    </button>
  </div>
</div>

<style>
  .handoff-overlay {
    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85);
    display: flex; align-items: center; justify-content: center;
    z-index: 50; backdrop-filter: blur(8px);
    animation: fadeIn 300ms ease;
  }

  .handoff-card {
    background: var(--bg-surface); border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg); padding: 40px;
    max-width: 520px; width: 100%; text-align: center;
    box-shadow: var(--shadow-lg);
    animation: slideUp 400ms ease;
  }

  .handoff-header { margin-bottom: 32px; }
  .handoff-label {
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--text-tertiary); display: block; margin-bottom: 6px;
  }
  .handoff-header h2 { font-size: 22px; font-weight: 700; color: var(--text-primary); }

  .handoff-flow {
    display: flex; align-items: center; justify-content: center; gap: 20px;
    margin-bottom: 28px;
  }

  .consultant-badge {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
  }
  .consultant-badge.outgoing { opacity: 0.6; }

  .consultant-avatar {
    width: 48px; height: 48px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: var(--accent); color: white;
    font-size: 20px; font-weight: 700;
  }
  .consultant-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
  .consultant-title { font-size: 11px; color: var(--text-tertiary); }
  .phase-label {
    font-size: 10px; padding: 2px 8px; border-radius: 10px;
    background: var(--bg-tertiary); color: var(--text-secondary);
  }

  .arrow-container {
    display: flex; align-items: center; gap: 6px;
    color: var(--text-tertiary);
  }
  .arrow-line { width: 24px; height: 1px; background: var(--border-primary); }
  .arrow-icon { font-size: 18px; animation: pulseArrow 1.5s ease infinite; }

  .handoff-message {
    font-size: 14px; color: var(--text-secondary); line-height: 1.6;
    margin-bottom: 28px;
  }

  .continue-btn {
    padding: 10px 28px; background: var(--accent-primary); color: white;
    border-radius: var(--radius-md); font-size: 14px; font-weight: 500;
    transition: all var(--transition-fast);
  }
  .continue-btn:hover { background: var(--accent-hover); transform: translateY(-1px); }

  @keyframes pulseArrow { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>
