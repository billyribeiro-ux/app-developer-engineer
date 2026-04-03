<script lang="ts">
	import { chatState } from '$lib/state/chat.svelte';
</script>

<footer class="bottom-bar">
	<div class="left">
		<span class="status-dot"></span>
		<span>CATALYST v0.1.0</span>
	</div>
	<div class="right">
		{#if chatState.tokenUsage.input_tokens > 0}
			<span class="token-info">
				Tokens: {chatState.tokenUsage.input_tokens.toLocaleString()} in / {chatState.tokenUsage.output_tokens.toLocaleString()} out
			</span>
		{/if}
		<span>claude-sonnet-4-20250514</span>
	</div>
</footer>

<style>
	.bottom-bar {
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 12px;
		border-top: 1px solid var(--border-secondary);
		background: var(--bg-secondary);
		font-size: 11px;
		color: var(--text-tertiary);
		flex-shrink: 0;
	}

	.left,
	.right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--success);
		flex-shrink: 0;
	}

	.token-info {
		color: var(--text-secondary);
	}
</style>
