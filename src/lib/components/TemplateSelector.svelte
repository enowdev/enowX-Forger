<script lang="ts">
  import { Check, Monitor, Globe, Smartphone, Gamepad2, Package, Plus, Search } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { templates, categories, getTemplateIconUrl } from '$lib/data/templates';

  interface Props {
    selectedTemplates: string[];
    onToggle: (templateId: string) => void;
    onCustomClick?: () => void;
  }

  let { selectedTemplates, onToggle, onCustomClick }: Props = $props();
  
  let searchQuery = $state('');
  let selectedCategory = $state('all');

  const categoryIcons: Record<string, typeof Monitor> = {
    desktop: Monitor,
    mobile: Smartphone,
    web: Globe,
    game: Gamepad2,
    other: Package
  };

  let filteredTemplates = $derived(() => {
    let result = templates;
    
    if (selectedCategory !== 'all') {
      result = result.filter(t => t.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.description.toLowerCase().includes(query)
      );
    }
    
    return result;
  });
</script>

<div class="flex flex-col h-full">
  <!-- Search -->
  <div class="relative mb-3">
    <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
    <input
      type="text"
      placeholder="Search templates..."
      bind:value={searchQuery}
      class="w-full pl-9 pr-3 py-2 text-xs xl:text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
    />
  </div>

  <!-- Category Tabs -->
  <div class="flex gap-1 mb-3 overflow-x-auto pb-1">
    <button
      class={cn(
        'px-2.5 py-1.5 text-[10px] xl:text-xs rounded-md whitespace-nowrap transition-colors',
        selectedCategory === 'all'
          ? 'bg-blue-600 text-white'
          : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
      )}
      onclick={() => selectedCategory = 'all'}
    >
      All
    </button>
    {#each categories as cat}
      {@const CatIcon = categoryIcons[cat.id]}
      <button
        class={cn(
          'px-2.5 py-1.5 text-[10px] xl:text-xs rounded-md whitespace-nowrap transition-colors flex items-center gap-1',
          selectedCategory === cat.id
            ? 'bg-blue-600 text-white'
            : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
        )}
        onclick={() => selectedCategory = cat.id}
      >
        <CatIcon class="w-3 h-3" />
        {cat.name}
      </button>
    {/each}
  </div>

  <!-- Templates Grid -->
  <div class="flex-1 overflow-y-auto">
    <div class="grid grid-cols-3 xl:grid-cols-4 gap-2 xl:gap-3">
      <!-- Custom Template Button -->
      <button
        class="flex flex-col items-center p-3 xl:p-4 rounded-lg border border-dashed border-zinc-600 hover:border-zinc-500 bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
        onclick={() => onCustomClick?.()}
      >
        <div class="p-2 xl:p-2.5 rounded mb-1.5 xl:mb-2 bg-zinc-700">
          <Plus class="w-5 h-5 xl:w-6 xl:h-6 text-zinc-400" />
        </div>
        <span class="font-medium text-xs xl:text-sm text-zinc-400">Custom</span>
        <span class="text-[10px] xl:text-xs text-zinc-500">Add sizes</span>
      </button>

      {#each filteredTemplates() as template}
        {@const isSelected = selectedTemplates.includes(template.id)}
        <button
          class={cn(
            'relative flex flex-col items-center p-3 xl:p-4 rounded-lg border transition-all',
            isSelected
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
          )}
          onclick={() => onToggle(template.id)}
        >
          {#if isSelected}
            <div class="absolute top-1.5 right-1.5 xl:top-2 xl:right-2">
              <Check class="w-3.5 h-3.5 xl:w-4 xl:h-4 text-blue-400" />
            </div>
          {/if}
          <div class={cn('p-2 xl:p-2.5 rounded mb-1.5 xl:mb-2 flex items-center justify-center', isSelected ? 'bg-blue-500/20' : 'bg-zinc-700')}>
            <img 
              src={getTemplateIconUrl(template.icon)} 
              alt={template.name}
              class="w-5 h-5 xl:w-6 xl:h-6"
              loading="lazy"
            />
          </div>
          <span class="font-medium text-xs xl:text-sm text-zinc-200 text-center leading-tight">{template.name}</span>
          <span class="text-[10px] xl:text-xs text-zinc-500">{template.icons.length} icons</span>
        </button>
      {/each}
    </div>

    {#if filteredTemplates().length === 0}
      <div class="flex flex-col items-center justify-center py-8 text-zinc-500">
        <Search class="w-8 h-8 mb-2 opacity-50" />
        <p class="text-xs xl:text-sm">No templates found</p>
      </div>
    {/if}
  </div>
</div>
