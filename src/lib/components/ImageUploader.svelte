<script lang="ts">
  import { Upload } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  interface Props {
    onImageSelect: (file: File) => void;
    previewUrl: string | null;
  }

  let { onImageSelect, previewUrl }: Props = $props();
  let isDragging = $state(false);
  let fileInput: HTMLInputElement;

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    const file = e.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave() {
    isDragging = false;
  }

  function handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  }

  function openFilePicker() {
    fileInput?.click();
  }
</script>

<div
  class={cn(
    'relative flex flex-col items-center justify-center w-full h-36 xl:h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
    isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-700 hover:border-zinc-600',
    previewUrl ? 'bg-zinc-800/50' : 'bg-zinc-800/30'
  )}
  ondrop={handleDrop}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  onclick={openFilePicker}
  role="button"
  tabindex="0"
  onkeydown={(e) => e.key === 'Enter' && openFilePicker()}
>
  <input
    bind:this={fileInput}
    type="file"
    accept="image/*"
    class="hidden"
    onchange={handleFileSelect}
  />

  {#if previewUrl}
    <img src={previewUrl} alt="Preview" class="max-h-32 xl:max-h-44 max-w-full object-contain rounded" />
  {:else}
    <div class="flex flex-col items-center gap-2 xl:gap-3 text-zinc-400">
      <Upload class="w-8 h-8 xl:w-10 xl:h-10" />
      <div class="text-center">
        <p class="text-xs xl:text-sm font-medium text-zinc-300">Drop image or click to browse</p>
        <p class="text-[10px] xl:text-xs text-zinc-500">PNG, JPG, SVG</p>
      </div>
    </div>
  {/if}
</div>
