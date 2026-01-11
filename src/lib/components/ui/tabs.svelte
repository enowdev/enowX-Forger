<script lang="ts">
  import { cn } from '$lib/utils';
  import type { Snippet } from 'svelte';

  interface Props {
    value: string;
    onchange?: (value: string) => void;
    class?: string;
    children: Snippet;
  }

  let { value = $bindable(), onchange, class: className, children }: Props = $props();
</script>

<div class={cn('', className)} data-value={value}>
  {@render children()}
</div>
