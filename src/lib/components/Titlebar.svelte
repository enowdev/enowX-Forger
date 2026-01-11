<script lang="ts">
  import { Minus, Square, Copy, X } from 'lucide-svelte';
  import { getCurrentWindow } from '@tauri-apps/api/window';

  let isMaximized = $state(false);

  async function checkMaximized() {
    isMaximized = await getCurrentWindow().isMaximized();
  }

  async function minimize() {
    await getCurrentWindow().minimize();
  }

  async function toggleMaximize() {
    await getCurrentWindow().toggleMaximize();
    await checkMaximized();
  }

  async function close() {
    await getCurrentWindow().close();
  }

  async function handleMouseDown(e: MouseEvent) {
    // Double click to toggle maximize
    if (e.detail === 2) {
      await toggleMaximize();
      return;
    }
  }

  async function handleDragStart() {
    // If maximized, unmaximize when starting to drag
    if (isMaximized) {
      await getCurrentWindow().setMaximizable(true);
    }
    await getCurrentWindow().startDragging();
    // Check state after drag ends
    setTimeout(checkMaximized, 100);
  }

  $effect(() => {
    checkMaximized();
    
    // Listen for window resize events to update maximize state
    const unlisten = getCurrentWindow().onResized(() => {
      checkMaximized();
    });

    return () => {
      unlisten.then(fn => fn());
    };
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<header
  class="h-9 flex items-center justify-between bg-zinc-900 border-b border-zinc-800 select-none"
  onmousedown={handleMouseDown}
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="flex-1 flex items-center gap-2 px-3 h-full cursor-default"
    onmousedown={handleDragStart}
  >
    <img src="/app-icon.png" alt="enowX Forger" class="w-4 h-4" />
    <span class="text-xs font-medium text-zinc-300">enowX Forger</span>
  </div>
  <div class="flex">
    <button
      class="w-11 h-9 flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
      onclick={minimize}
    >
      <Minus class="w-4 h-4" />
    </button>
    <button
      class="w-11 h-9 flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
      onclick={toggleMaximize}
    >
      {#if isMaximized}
        <Copy class="w-3.5 h-3.5" />
      {:else}
        <Square class="w-3.5 h-3.5" />
      {/if}
    </button>
    <button
      class="w-11 h-9 flex items-center justify-center text-zinc-400 hover:bg-red-600 hover:text-white transition-colors"
      onclick={close}
    >
      <X class="w-4 h-4" />
    </button>
  </div>
</header>
