<script lang="ts">
  import Modal from '$lib/components/ui/modal.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import { Download } from 'lucide-svelte';
  import { settings } from '$lib/stores/settings';
  import { downloadIcon } from '$lib/stores/discovery';

  interface Props {
    open: boolean;
    onClose: () => void;
    prefix: string;
    name: string;
  }

  let { open, onClose, prefix, name }: Props = $props();

  let format = $state<'svg' | 'png' | 'webp'>('svg');
  let size = $state(64);
  let isDownloading = $state(false);

  $effect(() => {
    format = $settings.defaultIconFormat;
    size = $settings.defaultIconSize;
  });

  async function handleDownload() {
    isDownloading = true;
    try {
      await downloadIcon(prefix, name, format, size);
    } finally {
      isDownloading = false;
      onClose();
    }
  }

  const sizes = [16, 24, 32, 48, 64, 128, 256, 512];
</script>

<Modal {open} {onClose} title="Download Icon" class="w-[350px]" zIndex={60}>
  <div class="space-y-4">
    <!-- Preview -->
    <div class="flex items-center justify-center p-4 bg-zinc-800 rounded-lg">
      <img
        src="https://api.iconify.design/{prefix}/{name}.svg?color=white"
        alt={name}
        class="w-16 h-16"
      />
    </div>

    <p class="text-xs text-zinc-400 text-center">{prefix}:{name}</p>

    <!-- Format -->
    <div>
      <span class="text-xs text-zinc-400 mb-2 block">Format</span>
      <div class="flex gap-2">
        {#each ['svg', 'png', 'webp'] as fmt}
          <button
            class="flex-1 py-2 text-xs rounded-lg border transition-colors {format === fmt 
              ? 'bg-blue-600 border-blue-600 text-white' 
              : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600'}"
            onclick={() => format = fmt as 'svg' | 'png' | 'webp'}
          >
            {fmt.toUpperCase()}
          </button>
        {/each}
      </div>
    </div>

    <!-- Size (only for PNG/WebP) -->
    {#if format !== 'svg'}
      <div>
        <span class="text-xs text-zinc-400 mb-2 block">Size: {size}px</span>
        <div class="flex flex-wrap gap-1">
          {#each sizes as s}
            <button
              class="px-2 py-1 text-xs rounded border transition-colors {size === s 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600'}"
              onclick={() => size = s}
            >
              {s}
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Actions -->
    <div class="flex gap-2 pt-2">
      <Button variant="outline" onclick={onClose} class="flex-1">Cancel</Button>
      <Button variant="default" onclick={handleDownload} class="flex-1" disabled={isDownloading}>
        <Download class="w-4 h-4 mr-1.5" />
        {isDownloading ? 'Downloading...' : 'Download'}
      </Button>
    </div>
  </div>
</Modal>
