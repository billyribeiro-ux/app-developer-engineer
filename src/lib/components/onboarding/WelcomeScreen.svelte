<script lang="ts">
  let { onnext }: { onnext: () => void } = $props();
</script>

<div class="welcome">
  <div class="welcome-content">
    <h1 class="logo-text">CATALYST</h1>
    <p class="tagline">AI Development Studio</p>
    <p class="description">
      Your elite team of AI consultants — from product strategy to deployment.
      Seven specialists. One studio. World-class products.
    </p>
    <button class="start-btn" onclick={onnext}>Get Started</button>
  </div>
</div>

<style>
  .welcome {
    height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--bg-primary);
  }
  .welcome-content { text-align: center; max-width: 480px; padding: 40px; }
  .logo-text {
    font-size: 56px; font-weight: 700; letter-spacing: -2px;
    background: linear-gradient(135deg, #6366f1, #818cf8, #a5b4fc);
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;
    margin-bottom: 8px;
  }
  .tagline { font-size: 18px; color: var(--text-secondary); margin-bottom: 24px; }
  .description { font-size: 14px; color: var(--text-tertiary); line-height: 1.6; margin-bottom: 32px; }
  .start-btn {
    padding: 12px 32px; background: var(--accent-primary); color: white;
    border-radius: var(--radius-md); font-size: 15px; font-weight: 500;
    transition: all var(--transition-fast);
  }
  .start-btn:hover { background: var(--accent-hover); transform: translateY(-1px); }
</style>
