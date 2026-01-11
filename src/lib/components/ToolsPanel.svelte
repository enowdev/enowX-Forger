<script lang="ts">
  import { Eraser } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  interface Props {
    bgRemoverEnabled: boolean;
    onBgRemoverToggle: () => void;
  }

  let { bgRemoverEnabled, onBgRemoverToggle }: Props = $props();
</script>

<button
  class={cn(
    'w-full flex items-center gap-3 p-3 xl:p-4 rounded-lg border transition-all text-left',
    bgRemoverEnabled
      ? 'border-blue-500 bg-blue-500/10'
      : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
  )}
  onclick={onBgRemoverToggle}
>
  <div class={cn('p-2 xl:p-2.5 rounded', bgRemoverEnabled ? 'bg-blue-500/20' : 'bg-zinc-700')}>
    <Eraser class="w-4 h-4 xl:w-5 xl:h-5 text-zinc-300" />
  </div>
  <div class="flex-1 min-w-0">
    <p class="font-medium text-xs xl:text-sm text-zinc-200">Background Remover</p>
    <p class="text-[10px] xl:text-xs text-zinc-500">Remove image background</p>
  </div>
  <div
    class={cn(
      'w-9 h-5 xl:w-11 xl:h-6 rounded-full transition-colors relative shrink-0',
      bgRemoverEnabled ? 'bg-blue-600' : 'bg-zinc-700'
    )}
  >
    <div
      class={cn(
        'absolute top-0.5 xl:top-1 w-4 h-4 rounded-full bg-white transition-transform',
        bgRemoverEnabled ? 'translate-x-4 xl:translate-x-5' : 'translate-x-0.5'
      )}
    ></div>
  </div>
</button>
