<script lang="ts">
  import { phaseState } from '$lib/state/phase.svelte';
  import { artifactState } from '$lib/state/artifact.svelte';
  import { renderMarkdown } from '$lib/utils/markdown';
  import { calculateHealthScore } from '$lib/services/health-score';
  import HealthBadge from '$lib/components/shared/HealthBadge.svelte';

  const priorArtifacts = $derived(artifactState.getPriorArtifacts(phaseState.currentPhaseNumber));
  const health = $derived(calculateHealthScore(phaseState.currentPhaseNumber, artifactState.artifacts));
</script>

<aside class="context-panel">
  <div class="panel-header">
    <span class="panel-title">Context</span>
    <span class="panel-count">{priorArtifacts.length}</span>
  </div>

  <div class="health-section">
    <div class="health-row">
      <span class="health-label">Phase Health</span>
      <HealthBadge score={health.overall} />
    </div>
    <div class="health-bars">
      <div class="bar-row">
        <span class="bar-label">Completeness</span>
        <div class="bar-track"><div class="bar-fill" style:width="{health.completeness}%" style:--bar-color={health.completeness >= 80 ? 'var(--success)' : health.completeness >= 50 ? 'var(--warning)' : 'var(--error)'}></div></div>
      </div>
      <div class="bar-row">
        <span class="bar-label">Clarity</span>
        <div class="bar-track"><div class="bar-fill" style:width="{health.clarity}%" style:--bar-color={health.clarity >= 80 ? 'var(--success)' : health.clarity >= 50 ? 'var(--warning)' : 'var(--error)'}></div></div>
      </div>
      <div class="bar-row">
        <span class="bar-label">Consistency</span>
        <div class="bar-track"><div class="bar-fill" style:width="{health.consistency}%" style:--bar-color={health.consistency >= 80 ? 'var(--success)' : health.consistency >= 50 ? 'var(--warning)' : 'var(--error)'}></div></div>
      </div>
    </div>
    {#if health.suggestions.length > 0}
      <div class="health-suggestions">
        {#each health.suggestions as s, i (i)}
          <p class="suggestion">{s}</p>
        {/each}
      </div>
    {/if}
  </div>

  <div class="panel-content">
    {#if priorArtifacts.length === 0}
      <p class="empty">No prior phase artifacts yet</p>
    {:else}
      {#each priorArtifacts as artifact (artifact.id)}
        <details class="context-card">
          <summary>
            <span class="card-phase">Phase {artifact.phaseNumber}</span>
            <span class="card-title">{artifact.title}</span>
            {#if artifact.isStale}<span class="stale">⚠</span>{/if}
          </summary>
          <div class="card-content">{@html renderMarkdown(artifact.content.slice(0, 500))}</div>
        </details>
      {/each}
    {/if}
  </div>
</aside>

<style>
  .context-panel {
    width: 280px; min-width: 280px; border-left: 1px solid var(--border-secondary);
    background: var(--bg-secondary); display: flex; flex-direction: column; overflow: hidden;
  }
  .panel-header {
    padding: 12px 16px; border-bottom: 1px solid var(--border-secondary);
    display: flex; justify-content: space-between; align-items: center;
  }
  .panel-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-tertiary); }
  .panel-count { font-size: 11px; color: var(--text-tertiary); background: var(--bg-tertiary); padding: 1px 6px; border-radius: 10px; }

  .health-section { padding: 12px; border-bottom: 1px solid var(--border-secondary); }
  .health-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .health-label { font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
  .health-bars { display: flex; flex-direction: column; gap: 6px; }
  .bar-row { display: flex; align-items: center; gap: 8px; }
  .bar-label { font-size: 10px; color: var(--text-tertiary); width: 80px; flex-shrink: 0; }
  .bar-track { flex: 1; height: 4px; background: var(--bg-tertiary); border-radius: 2px; overflow: hidden; }
  .bar-fill { height: 100%; background: var(--bar-color); border-radius: 2px; transition: width 0.3s ease; }
  .health-suggestions { margin-top: 8px; }
  .suggestion { font-size: 10px; color: var(--text-tertiary); line-height: 1.4; margin: 2px 0; padding-left: 8px; border-left: 2px solid var(--warning); }

  .panel-content { flex: 1; overflow-y: auto; padding: 8px; }
  .empty { color: var(--text-tertiary); font-size: 12px; text-align: center; padding: 20px; }
  .context-card {
    margin-bottom: 6px; background: var(--bg-surface); border: 1px solid var(--border-primary);
    border-radius: var(--radius-md); overflow: hidden;
  }
  .context-card summary {
    padding: 8px 10px; cursor: pointer; display: flex; align-items: center; gap: 6px;
    font-size: 12px; list-style: none;
  }
  .context-card summary::-webkit-details-marker { display: none; }
  .context-card summary:hover { background: var(--bg-hover); }
  .card-phase { font-size: 10px; font-weight: 600; color: var(--text-tertiary); background: var(--bg-tertiary); padding: 1px 5px; border-radius: var(--radius-sm); }
  .card-title { font-weight: 500; color: var(--text-primary); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .stale { color: var(--warning); font-size: 12px; }
  .card-content { padding: 8px 10px; border-top: 1px solid var(--border-secondary); font-size: 12px; line-height: 1.5; color: var(--text-secondary); max-height: 200px; overflow-y: auto; }
</style>
