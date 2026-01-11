<script lang="ts">
  import { cn } from '$lib/utils';
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children: Snippet;
  }

  let { class: className, children }: Props = $props();
</script>

<div class={cn('rounded-lg border border-zinc-700 bg-zinc-800/50 text-zinc-200', className)}>
  {@render children()}
</div>
