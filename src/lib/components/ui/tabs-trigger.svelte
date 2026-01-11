<script lang="ts">
  import { cn } from '$lib/utils';
  import type { Snippet } from 'svelte';

  interface Props {
    value: string;
    active: boolean;
    onclick?: () => void;
    class?: string;
    children: Snippet;
  }

  let { value, active, onclick, class: className, children }: Props = $props();
</script>

<button
  class={cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    active ? 'bg-background text-foreground shadow-sm' : 'hover:bg-background/50',
    className
  )}
  onclick={onclick}
>
  {@render children()}
</button>
