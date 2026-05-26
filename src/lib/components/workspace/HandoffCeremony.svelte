<script lang="ts">
  import { CONSULTANTS } from '$lib/constants/consultants';
  import { buildHandoffOutgoingPrompt, buildHandoffIncomingPrompt } from '$lib/prompts/handoff';
  import { streamClaude } from '$lib/services/tauri-commands';
  import { artifactState } from '$lib/state/artifact.svelte';
  import { renderMarkdown } from '$lib/utils/markdown';
  import type { PhaseNumber } from '$lib/types/project';

  let { fromPhase, toPhase, onComplete }: {
    fromPhase: number;
    toPhase: number;
    onComplete: () => void;
  } = $props();

  const from = $derived(CONSULTANTS[fromPhase as PhaseNumber]);
  const to = $derived(CONSULTANTS[toPhase as PhaseNumber]);

  let step = $state<'briefing' | 'acknowledging' | 'complete'>('briefing');
  let outgoingText = $state('');
  let incomingText = $state('');
  let error = $state('');
  const outgoingHtml = $derived(outgoingText ? renderMarkdown(outgoingText) : '');
  const incomingHtml = $derived(incomingText ? renderMarkdown(incomingText) : '');

  const stepIndex = $derived(
    step === 'briefing' ? 0 : step === 'acknowledging' ? 1 : 2
  );

  // Auto-start the handoff on mount — plain let (non-reactive) guards against
  // double-fire in Svelte 5 dev strict mode without triggering $effect warnings
  let started = false;
  $effect(() => {
    if (!started) {
      started = true;
      startHandoff();
    }
  });

  async function startHandoff() {
    const outgoingPrompt = buildHandoffOutgoingPrompt(fromPhase as PhaseNumber);
    const artifacts = artifactState.artifacts;
    const artifactContext = artifacts
      .filter((a) => a.phaseNumber <= fromPhase)
      .map((a) => `### ${a.title} (${a.type})\n${a.content}`)
      .join('\n\n---\n\n');

    const outgoingSystem = `${outgoingPrompt}\n\n## Artifacts from This Phase\n${artifactContext || 'No artifacts yet.'}`;

    try {
      await streamClaude(
        {
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: outgoingSystem,
          messages: [{ role: 'user', content: 'Please provide your handoff briefing for the next consultant.' }]
        },
        (chunk) => { outgoingText += chunk.delta; },
        () => {
          step = 'acknowledging';
          startIncoming();
        },
        (err) => { error = err; }
      );
    } catch (e) {
      error = String(e);
    }
  }

  async function startIncoming() {
    const incomingPrompt = buildHandoffIncomingPrompt(toPhase as PhaseNumber);

    try {
      await streamClaude(
        {
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: incomingPrompt,
          messages: [
            { role: 'user', content: `Here is the handoff briefing from ${from.name}:\n\n${outgoingText}` }
          ]
        },
        (chunk) => { incomingText += chunk.delta; },
        () => { step = 'complete'; },
        (err) => { error = err; }
      );
    } catch (e) {
      error = String(e);
    }
  }
</script>

<div class="handoff-overlay">
  <div class="handoff-stage">

    <!-- Header -->
    <div class="ceremony-header">
      <span class="ceremony-eyebrow">Phase Transition</span>
      <h2 class="ceremony-title">Handoff Ceremony</h2>

      <!-- Step indicator -->
      <div class="step-track">
        {#each ['Briefing', 'Acknowledging', 'Ready'] as label, i (label)}
          <div class="step-item" class:active={stepIndex === i} class:done={stepIndex > i}>
            <div class="step-dot">
              {#if stepIndex > i}
                <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              {:else if stepIndex === i}
                <span class="step-pulse"></span>
              {:else}
                <span class="step-number">{i + 1}</span>
              {/if}
            </div>
            <span class="step-label">{label}</span>
          </div>
          {#if i < 2}
            <div class="step-connector" class:filled={stepIndex > i}></div>
          {/if}
        {/each}
      </div>
    </div>

    <!-- Consultant flow -->
    <div class="consultant-row">
      <div class="consultant-card" class:active={step === 'briefing'} class:dim={step !== 'briefing' && step !== 'complete'}>
        <div
          class="avatar"
          style:--accent={from.accentColor}
          class:glow={step === 'briefing'}
        >
          {from.name.charAt(0)}
        </div>
        <div class="consultant-meta">
          <span class="consultant-name">{from.name}</span>
          <span class="consultant-title">{from.title}</span>
          <span class="phase-badge">Phase {fromPhase}</span>
        </div>
        <div class="consultant-status">
          {#if step === 'briefing'}
            <span class="status-dot pulsing" style:--accent={from.accentColor}></span>
            <span class="status-text">Briefing...</span>
          {:else}
            <span class="status-done">Briefed</span>
          {/if}
        </div>
      </div>

      <div class="transfer-arrow" class:active={step === 'acknowledging'}>
        <div class="arrow-beam" style:--from={from.accentColor} style:--to={to.accentColor}></div>
        <span class="arrow-glyph">→</span>
      </div>

      <div class="consultant-card incoming" class:active={step === 'acknowledging' || step === 'complete'}>
        <div
          class="avatar"
          style:--accent={to.accentColor}
          class:glow={step === 'acknowledging' || step === 'complete'}
        >
          {to.name.charAt(0)}
        </div>
        <div class="consultant-meta">
          <span class="consultant-name">{to.name}</span>
          <span class="consultant-title">{to.title}</span>
          <span class="phase-badge">Phase {toPhase}</span>
        </div>
        <div class="consultant-status">
          {#if step === 'acknowledging'}
            <span class="status-dot pulsing" style:--accent={to.accentColor}></span>
            <span class="status-text">Responding...</span>
          {:else if step === 'complete'}
            <span class="status-done">Ready</span>
          {:else}
            <span class="status-waiting">Waiting...</span>
          {/if}
        </div>
      </div>
    </div>

    <!-- Transcript area -->
    <div class="transcript-area">

      <!-- Outgoing briefing -->
      {#if outgoingText}
        <div class="transcript-block outgoing" class:streaming={step === 'briefing'}>
          <div class="transcript-header">
            <span class="transcript-avatar" style:--accent={from.accentColor}>
              {from.name.charAt(0)}
            </span>
            <span class="transcript-speaker">{from.name}</span>
            <span class="transcript-role">Outgoing Briefing</span>
            {#if step === 'briefing'}
              <span class="typing-indicator">
                <span></span><span></span><span></span>
              </span>
            {/if}
          </div>
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          <div class="transcript-body">{@html outgoingHtml}</div>
        </div>
      {:else if step === 'briefing'}
        <div class="transcript-placeholder">
          <span class="typing-indicator large">
            <span></span><span></span><span></span>
          </span>
          <p>{from.name} is preparing the handoff briefing...</p>
        </div>
      {/if}

      <!-- Incoming acknowledgement -->
      {#if incomingText}
        <div class="transcript-block incoming" class:streaming={step === 'acknowledging'}>
          <div class="transcript-header">
            <span class="transcript-avatar" style:--accent={to.accentColor}>
              {to.name.charAt(0)}
            </span>
            <span class="transcript-speaker">{to.name}</span>
            <span class="transcript-role">Taking Over</span>
            {#if step === 'acknowledging'}
              <span class="typing-indicator">
                <span></span><span></span><span></span>
              </span>
            {/if}
          </div>
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          <div class="transcript-body">{@html incomingHtml}</div>
        </div>
      {:else if step === 'acknowledging'}
        <div class="transcript-placeholder">
          <span class="typing-indicator large">
            <span></span><span></span><span></span>
          </span>
          <p>{to.name} is reading the briefing...</p>
        </div>
      {/if}

      <!-- Error state -->
      {#if error}
        <div class="error-block">
          <span class="error-icon">⚠</span>
          <div>
            <strong>Handoff failed</strong>
            <p>{error}</p>
          </div>
          <button class="retry-btn" onclick={() => { error = ''; outgoingText = ''; incomingText = ''; step = 'briefing'; startHandoff(); }}>
            Retry
          </button>
        </div>
      {/if}
    </div>

    <!-- Footer -->
    <div class="ceremony-footer">
      {#if step === 'complete'}
        <button class="continue-btn" onclick={onComplete}>
          <span>Continue to Phase {toPhase} with {to.name}</span>
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      {:else if !error}
        <div class="processing-hint">
          {#if step === 'briefing'}
            <span class="hint-dot" style:--accent={from.accentColor}></span>
            {from.name} is compiling the project brief...
          {:else}
            <span class="hint-dot" style:--accent={to.accentColor}></span>
            {to.name} is reviewing and preparing their response...
          {/if}
        </div>
      {/if}
    </div>

  </div>
</div>

<style>
  /* ── Overlay ─────────────────────────────────────────────── */
  .handoff-overlay {
    position: fixed; inset: 0;
    background: rgba(0, 0, 0, 0.88);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
    padding: 24px;
    animation: overlayFadeIn 400ms ease both;
  }

  /* ── Main stage card ─────────────────────────────────────── */
  .handoff-stage {
    background: var(--bg-surface);
    border: 1px solid var(--border-primary);
    border-radius: 20px;
    width: 100%; max-width: 680px;
    max-height: calc(100vh - 48px);
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--border-primary) transparent;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.04) inset,
      0 32px 80px rgba(0,0,0,0.6),
      0 8px 24px rgba(0,0,0,0.4);
    animation: stageSlideUp 450ms cubic-bezier(0.16, 1, 0.3, 1) both;
    animation-delay: 80ms;
  }

  /* ── Header ─────────────────────────────────────────────── */
  .ceremony-header {
    padding: 32px 32px 24px;
    border-bottom: 1px solid var(--border-primary);
    text-align: center;
  }

  .ceremony-eyebrow {
    display: block;
    font-size: 10px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.14em;
    color: var(--text-tertiary);
    margin-bottom: 6px;
  }

  .ceremony-title {
    font-size: 22px; font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 24px;
  }

  /* Step track */
  .step-track {
    display: flex; align-items: center; justify-content: center;
    gap: 0;
  }

  .step-item {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
  }

  .step-dot {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid var(--border-primary);
    background: var(--bg-tertiary);
    color: var(--text-tertiary);
    font-size: 11px; font-weight: 600;
    transition: all 300ms ease;
    position: relative;
  }

  .step-item.active .step-dot {
    border-color: var(--accent-primary);
    background: rgba(99, 102, 241, 0.12);
    color: var(--accent-primary);
  }

  .step-item.done .step-dot {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.12);
    color: #22c55e;
  }

  .step-pulse {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--accent-primary);
    animation: pulseDot 1.2s ease infinite;
    display: block;
  }

  .step-number {
    font-size: 11px; font-weight: 600;
  }

  .step-label {
    font-size: 10px; font-weight: 500; letter-spacing: 0.04em;
    color: var(--text-tertiary);
    transition: color 300ms ease;
  }
  .step-item.active .step-label { color: var(--accent-primary); }
  .step-item.done .step-label { color: #22c55e; }

  .step-connector {
    width: 48px; height: 1px;
    background: var(--border-primary);
    margin-bottom: 20px;
    transition: background 400ms ease;
  }
  .step-connector.filled { background: #22c55e; }

  /* ── Consultant row ──────────────────────────────────────── */
  .consultant-row {
    display: flex; align-items: center; gap: 0;
    padding: 24px 32px;
    border-bottom: 1px solid var(--border-primary);
  }

  .consultant-card {
    flex: 1;
    display: flex; align-items: center; gap: 12px;
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid transparent;
    transition: all 300ms ease;
    background: var(--bg-secondary);
    opacity: 0.5;
  }

  .consultant-card.active {
    opacity: 1;
    border-color: var(--border-primary);
    background: var(--bg-tertiary);
    box-shadow: 0 2px 12px rgba(0,0,0,0.2);
  }

  .consultant-card.incoming {
    justify-content: flex-end;
    flex-direction: row-reverse;
    text-align: right;
  }

  /* Avatar */
  .avatar {
    flex-shrink: 0;
    width: 44px; height: 44px; border-radius: 50%;
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    border: 2px solid color-mix(in srgb, var(--accent) 40%, transparent);
    color: var(--accent);
    font-size: 18px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    transition: all 400ms ease;
  }

  .avatar.glow {
    box-shadow:
      0 0 16px color-mix(in srgb, var(--accent) 60%, transparent),
      0 0 32px color-mix(in srgb, var(--accent) 30%, transparent);
    border-color: var(--accent);
  }

  /* Consultant meta */
  .consultant-meta {
    display: flex; flex-direction: column; gap: 2px;
    min-width: 0;
  }

  .consultant-name {
    font-size: 13px; font-weight: 600; color: var(--text-primary);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .consultant-title {
    font-size: 11px; color: var(--text-secondary);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .phase-badge {
    display: inline-block;
    font-size: 10px; padding: 2px 7px;
    border-radius: 20px;
    background: var(--bg-tertiary);
    color: var(--text-tertiary);
    border: 1px solid var(--border-primary);
    margin-top: 2px;
    align-self: flex-start;
  }

  .incoming .phase-badge {
    align-self: flex-end;
  }

  /* Status */
  .consultant-status {
    margin-left: auto;
    display: flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 500;
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  .incoming .consultant-status {
    margin-left: 0; margin-right: auto;
  }

  .status-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent);
    display: block;
  }

  .status-dot.pulsing {
    animation: pulseDot 1.2s ease infinite;
  }

  .status-text { color: var(--text-secondary); }
  .status-done { color: #22c55e; font-weight: 600; }
  .status-waiting { color: var(--text-tertiary); font-style: italic; }

  /* Transfer arrow */
  .transfer-arrow {
    flex-shrink: 0;
    display: flex; flex-direction: column;
    align-items: center; gap: 4px;
    padding: 0 12px;
    position: relative;
  }

  .arrow-beam {
    width: 48px; height: 2px;
    background: linear-gradient(90deg, var(--from), var(--to));
    border-radius: 2px;
    opacity: 0.3;
    transition: opacity 400ms ease;
  }

  .transfer-arrow.active .arrow-beam {
    opacity: 1;
    animation: beamFlow 1.5s linear infinite;
  }

  .arrow-glyph {
    font-size: 18px;
    color: var(--text-tertiary);
    animation: arrowPulse 2s ease infinite;
  }

  .transfer-arrow.active .arrow-glyph {
    color: var(--text-secondary);
  }

  /* ── Transcript area ─────────────────────────────────────── */
  .transcript-area {
    padding: 24px 32px;
    display: flex; flex-direction: column; gap: 16px;
    min-height: 120px;
  }

  .transcript-block {
    border-radius: 12px;
    border: 1px solid var(--border-primary);
    background: var(--bg-secondary);
    overflow: hidden;
    animation: blockFadeIn 300ms ease both;
  }

  .transcript-block.streaming {
    border-color: color-mix(in srgb, var(--accent-primary) 30%, var(--border-primary));
  }

  .transcript-block.outgoing.streaming {
    border-color: color-mix(in srgb, #6366f1 30%, var(--border-primary));
  }

  .transcript-block.incoming.streaming {
    border-color: color-mix(in srgb, #22c55e 30%, var(--border-primary));
  }

  .transcript-header {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-primary);
    background: var(--bg-tertiary);
  }

  .transcript-avatar {
    width: 22px; height: 22px; border-radius: 50%;
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    color: var(--accent);
    font-size: 11px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .transcript-speaker {
    font-size: 12px; font-weight: 600;
    color: var(--text-primary);
  }

  .transcript-role {
    font-size: 11px;
    color: var(--text-tertiary);
    margin-left: 2px;
  }

  .transcript-body {
    padding: 16px;
    font-size: 13px; line-height: 1.65;
    color: var(--text-secondary);
    max-height: 280px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--border-primary) transparent;
  }

  /* Markdown inside transcript */
  .transcript-body :global(h1),
  .transcript-body :global(h2),
  .transcript-body :global(h3) {
    font-size: 13px; font-weight: 700;
    color: var(--text-primary);
    margin: 12px 0 6px;
  }

  .transcript-body :global(h1:first-child),
  .transcript-body :global(h2:first-child),
  .transcript-body :global(h3:first-child) {
    margin-top: 0;
  }

  .transcript-body :global(p) { margin: 0 0 8px; }
  .transcript-body :global(p:last-child) { margin-bottom: 0; }

  .transcript-body :global(strong) {
    color: var(--text-primary); font-weight: 600;
  }

  .transcript-body :global(ul),
  .transcript-body :global(ol) {
    margin: 6px 0; padding-left: 18px;
  }

  .transcript-body :global(li) { margin: 3px 0; }

  .transcript-body :global(code) {
    font-size: 11px;
    background: var(--bg-tertiary);
    padding: 1px 5px; border-radius: 4px;
    color: var(--text-primary);
    font-family: monospace;
  }

  /* Placeholder while waiting to stream */
  .transcript-placeholder {
    display: flex; flex-direction: column; align-items: center;
    gap: 10px; padding: 32px;
    color: var(--text-tertiary);
    font-size: 13px;
    animation: blockFadeIn 300ms ease both;
  }

  /* ── Typing indicator ────────────────────────────────────── */
  .typing-indicator {
    display: flex; align-items: center; gap: 3px;
    margin-left: auto;
  }

  .typing-indicator span {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--text-tertiary);
    animation: typingBounce 1.2s ease infinite;
    display: block;
  }

  .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
  .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

  .typing-indicator.large span {
    width: 8px; height: 8px;
  }

  /* ── Error block ─────────────────────────────────────────── */
  .error-block {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid rgba(239, 68, 68, 0.4);
    background: rgba(239, 68, 68, 0.06);
    animation: blockFadeIn 300ms ease both;
  }

  .error-icon {
    font-size: 16px; flex-shrink: 0; margin-top: 1px;
    color: #ef4444;
  }

  .error-block strong {
    font-size: 13px; font-weight: 600; color: #ef4444;
    display: block; margin-bottom: 4px;
  }

  .error-block p {
    font-size: 12px; color: var(--text-secondary);
    margin: 0; line-height: 1.5;
  }

  .retry-btn {
    margin-left: auto; flex-shrink: 0;
    padding: 6px 14px;
    font-size: 12px; font-weight: 500;
    border-radius: 8px;
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #ef4444;
    background: transparent;
    cursor: pointer;
    transition: all 200ms ease;
  }

  .retry-btn:hover {
    background: rgba(239, 68, 68, 0.1);
  }

  /* ── Footer ─────────────────────────────────────────────── */
  .ceremony-footer {
    padding: 20px 32px 28px;
    display: flex; justify-content: center;
    border-top: 1px solid var(--border-primary);
  }

  .continue-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 28px;
    background: var(--accent-primary);
    color: white;
    border-radius: 10px;
    font-size: 14px; font-weight: 600;
    cursor: pointer;
    transition: all 250ms ease;
    animation: continueAppear 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
    box-shadow:
      0 0 20px rgba(99, 102, 241, 0.35),
      0 4px 12px rgba(99, 102, 241, 0.25);
  }

  .continue-btn svg {
    width: 18px; height: 18px;
    transition: transform 200ms ease;
  }

  .continue-btn:hover {
    transform: translateY(-2px);
    box-shadow:
      0 0 28px rgba(99, 102, 241, 0.5),
      0 8px 20px rgba(99, 102, 241, 0.35);
  }

  .continue-btn:hover svg { transform: translateX(3px); }
  .continue-btn:active { transform: translateY(0); }

  .processing-hint {
    display: flex; align-items: center; gap: 8px;
    font-size: 12px; color: var(--text-tertiary);
  }

  .hint-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent);
    display: block;
    animation: pulseDot 1.4s ease infinite;
  }

  /* ── Keyframes ───────────────────────────────────────────── */
  @keyframes overlayFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes stageSlideUp {
    from { opacity: 0; transform: translateY(28px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes blockFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes continueAppear {
    from { opacity: 0; transform: scale(0.94); }
    to   { opacity: 1; transform: scale(1); }
  }

  @keyframes pulseDot {
    0%, 100% { opacity: 0.4; transform: scale(0.85); }
    50%       { opacity: 1;   transform: scale(1.15); }
  }

  @keyframes typingBounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30%           { transform: translateY(-5px); opacity: 1; }
  }

  @keyframes arrowPulse {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 1; }
  }

  @keyframes beamFlow {
    0%   { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
</style>
