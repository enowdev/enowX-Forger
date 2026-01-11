<script lang="ts">
  import { X } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import type { Snippet } from 'svelte';

  interface Props {
    open: boolean;
    onClose: () => void;
    title: string;
    class?: string;
    children: Snippet;
  }

  let { open, onClose, title, class: className, children }: Props = $props();

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    onclick={handleBackdropClick}
  >
    <div class={cn('bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-[80vh] flex flex-col', className)}>
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
        <h2 class="font-semibold text-sm xl:text-base text-zinc-200">{title}</h2>
        <button
          class="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          onclick={onClose}
        >
          <X class="w-4 h-4" />
        </button>
      </div>
      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4">
        {@render children()}
      </div>
    </div>
  </div>
{/if}
