<script lang="ts">
  let { fromPhase, toPhase, onComplete }: { fromPhase: number; toPhase: number; onComplete: () => void } = $props();
</script>

<div class="handoff">
  <h2>Phase Transition</h2>
  <p>Handing off from Phase {fromPhase} to Phase {toPhase}...</p>
  <button onclick={onComplete}>Continue</button>
</div>

<style>
  .handoff {
    position: fixed; inset: 0; background: rgba(0,0,0,0.8);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 16px; color: var(--text-primary); z-index: 50;
  }
  .handoff h2 { font-size: 24px; }
  .handoff button { background: var(--accent-primary); color: white; padding: 8px 20px; border-radius: var(--radius-md); }
</style>
