<script lang="ts">
  import { Download, FolderOpen, ChevronDown, ChevronRight } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { templates, type ProjectTemplate } from '$lib/data/templates';
  import Button from '$lib/components/ui/button.svelte';

  interface Props {
    selectedTemplates: string[];
    previewUrl: string | null;
  }

  let { selectedTemplates, previewUrl }: Props = $props();

  let expandedProjects = $state<Set<string>>(new Set(['tauri']));

  let selectedProjects = $derived(
    templates.filter((t: ProjectTemplate) => selectedTemplates.includes(t.id))
  );

  let totalIcons = $derived(
    selectedProjects.reduce((acc: number, t: ProjectTemplate) => acc + t.icons.length, 0)
  );

  function toggleExpand(projectId: string) {
    const newSet = new Set(expandedProjects);
    if (newSet.has(projectId)) {
      newSet.delete(projectId);
    } else {
      newSet.add(projectId);
    }
    expandedProjects = newSet;
  }
</script>

<div class="h-full flex flex-col">
  <div class="flex items-center justify-between mb-3 xl:mb-4">
    <div>
      <h3 class="font-semibold text-sm xl:text-base text-zinc-200">Output</h3>
      <p class="text-[10px] xl:text-xs text-zinc-500">
        {selectedProjects.length} templates, {totalIcons} icons
      </p>
    </div>
    <Button variant="default" size="sm" disabled={!previewUrl || selectedTemplates.length === 0}>
      <Download class="w-3.5 h-3.5 xl:w-4 xl:h-4 mr-1.5" />
      <span class="text-xs xl:text-sm">Generate</span>
    </Button>
  </div>

  {#if selectedProjects.length === 0}
    <div class="flex-1 flex flex-col items-center justify-center text-zinc-500 border border-zinc-700 rounded-lg bg-zinc-800/30">
      <FolderOpen class="w-10 h-10 xl:w-12 xl:h-12 mb-2 opacity-50" />
      <p class="text-xs xl:text-sm">Select templates</p>
    </div>
  {:else}
    <div class="flex-1 overflow-y-auto space-y-1 pr-1">
      {#each selectedProjects as project}
        {@const isExpanded = expandedProjects.has(project.id)}
        <div class="rounded-lg border border-zinc-700 bg-zinc-800/50 overflow-hidden">
          <!-- Header -->
          <button
            class="w-full flex items-center gap-2 p-2.5 xl:p-3 hover:bg-zinc-700/30 transition-colors"
            onclick={() => toggleExpand(project.id)}
          >
            <div class="text-zinc-400">
              {#if isExpanded}
                <ChevronDown class="w-4 h-4" />
              {:else}
                <ChevronRight class="w-4 h-4" />
              {/if}
            </div>
            <FolderOpen class="w-4 h-4 xl:w-5 xl:h-5 text-zinc-500" />
            <span class="font-medium text-xs xl:text-sm text-zinc-200 flex-1 text-left">{project.name}</span>
            <span class="text-[10px] xl:text-xs text-zinc-500 bg-zinc-700 px-1.5 py-0.5 rounded">
              {project.icons.length}
            </span>
          </button>

          <!-- Expanded Content -->
          {#if isExpanded}
            <div class="border-t border-zinc-700 bg-zinc-800/30">
              {#each project.icons as icon, i}
                <div
                  class={cn(
                    'flex items-center gap-2 px-3 xl:px-4 py-1.5 xl:py-2 text-[10px] xl:text-xs',
                    i !== project.icons.length - 1 && 'border-b border-zinc-700/50'
                  )}
                >
                  <div class="w-4 h-4 xl:w-5 xl:h-5 flex items-center justify-center bg-zinc-700 rounded border border-zinc-600 shrink-0">
                    {#if previewUrl}
                      <img src={previewUrl} alt={icon.name} class="w-full h-full object-contain rounded" />
                    {/if}
                  </div>
                  <span class="flex-1 truncate text-zinc-300">{icon.name}</span>
                  <span class="text-zinc-500 shrink-0">{icon.width}x{icon.height}</span>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
