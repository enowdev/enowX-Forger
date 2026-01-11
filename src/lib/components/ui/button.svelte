<script lang="ts">
  import { cn } from '$lib/utils';
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    class?: string;
    disabled?: boolean;
    onclick?: () => void;
    children: Snippet;
  }

  let { variant = 'default', size = 'default', class: className, disabled, onclick, children }: Props = $props();

  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600',
    outline: 'border border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800',
    ghost: 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
    destructive: 'bg-red-600 text-white hover:bg-red-700'
  };

  const sizes = {
    default: 'h-9 px-4 py-2',
    sm: 'h-7 px-2 text-xs',
    lg: 'h-11 px-8',
    icon: 'h-9 w-9'
  };
</script>

<button
  class={cn(
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className
  )}
  {disabled}
  onclick={onclick}
>
  {@render children()}
</button>
