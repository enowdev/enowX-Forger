<script lang="ts">
  import { Image, Compass, Pencil, Settings, Info } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  interface Props {
    activeTab: string;
    onTabChange: (tab: string) => void;
  }

  let { activeTab, onTabChange }: Props = $props();

  const tabs = [
    { id: 'generate', icon: Image, label: 'Generate' },
    { id: 'editor', icon: Pencil, label: 'Editor' },
    { id: 'discovery', icon: Compass, label: 'Discovery' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'about', icon: Info, label: 'About' }
  ];
</script>

<aside class="w-16 xl:w-20 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-3 gap-1">
  {#each tabs as tab}
    {@const Icon = tab.icon}
    <button
      class={cn(
        'w-12 h-12 xl:w-14 xl:h-14 flex flex-col items-center justify-center rounded-lg transition-colors gap-1',
        activeTab === tab.id
          ? 'bg-blue-600 text-white'
          : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
      )}
      onclick={() => onTabChange(tab.id)}
      title={tab.label}
    >
      <Icon class="w-5 h-5 xl:w-6 xl:h-6" />
      <span class="text-[10px] xl:text-xs leading-none">{tab.label}</span>
    </button>
  {/each}
</aside>
