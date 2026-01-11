<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Download, FolderOpen, ChevronDown, ChevronRight, Loader2, Check, AlertCircle } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { templates, type ProjectTemplate } from '$lib/data/templates';
  import Button from '$lib/components/ui/button.svelte';
  import Modal from '$lib/components/ui/modal.svelte';
  import { 
    generateAllTemplates, 
    fileToBase64, 
    generateProgress, 
    lastResult, 
    openFolder,
    setupListeners,
    cleanupListeners,
    type GenerateResult 
  } from '$lib/stores/generator';
  import { settings } from '$lib/stores/settings';
  import { open } from '@tauri-apps/plugin-dialog';

  interface Props {
    selectedTemplates: string[];
    previewUrl: string | null;
    selectedFile: File | null;
  }

  let { selectedTemplates, previewUrl, selectedFile }: Props = $props();

  let expandedProjects = $state<Set<string>>(new Set());
  let resultModalOpen = $state(false);
  let currentResult = $state<GenerateResult | null>(null);

  onMount(() => {
    setupListeners();
  });

  onDestroy(() => {
    cleanupListeners();
  });

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

  async function handleGenerate() {
    if (!selectedFile || selectedTemplates.length === 0) return;

    // Get output path
    let outputPath = $settings.generateOutputPath;
    
    if (!outputPath) {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Output Folder'
      });
      
      if (!selected) return;
      outputPath = selected as string;
    }

    // Convert file to base64
    const imageData = await fileToBase64(selectedFile);

    // Get templates to generate
    const templatesToGenerate = selectedProjects.map(t => ({
      id: t.id,
      icons: t.icons
    }));

    // Generate all templates
    const results = await generateAllTemplates(imageData, outputPath, templatesToGenerate);

    // Combine results
    const combinedResult: GenerateResult = {
      success: results.every(r => r.success),
      generated: results.flatMap(r => r.generated),
      failed: results.flatMap(r => r.failed),
      output_path: outputPath,
      template_name: selectedTemplates.join(', ')
    };

    currentResult = combinedResult;
    resultModalOpen = true;
  }

  async function handleOpenFolder() {
    if (currentResult?.output_path) {
      try {
        await openFolder(currentResult.output_path);
      } catch (e) {
        console.error('Failed to open folder:', e);
      }
    }
  }

  // Progress percentage
  let progressPercent = $derived(
    $generateProgress.total > 0 
      ? Math.round(($generateProgress.current / $generateProgress.total) * 100)
      : 0
  );
</script>

<div class="h-full flex flex-col">
  <div class="flex items-center justify-between mb-3 xl:mb-4">
    <div>
      <h3 class="font-semibold text-sm xl:text-base text-zinc-200">Output</h3>
      <p class="text-[10px] xl:text-xs text-zinc-500">
        {selectedProjects.length} templates, {totalIcons} icons
      </p>
    </div>
    <Button 
      variant="default" 
      size="sm" 
      disabled={!previewUrl || selectedTemplates.length === 0 || $generateProgress.isGenerating}
      onclick={handleGenerate}
    >
      {#if $generateProgress.isGenerating}
        <Loader2 class="w-3.5 h-3.5 xl:w-4 xl:h-4 mr-1.5 animate-spin" />
        <span class="text-xs xl:text-sm">{progressPercent}%</span>
      {:else}
        <Download class="w-3.5 h-3.5 xl:w-4 xl:h-4 mr-1.5" />
        <span class="text-xs xl:text-sm">Generate</span>
      {/if}
    </Button>
  </div>

  <!-- Progress Bar -->
  {#if $generateProgress.isGenerating}
    <div class="mb-3 space-y-1">
      <div class="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          class="h-full bg-blue-500 transition-all duration-200"
          style="width: {progressPercent}%"
        ></div>
      </div>
      <p class="text-[10px] text-zinc-500 truncate">
        {$generateProgress.currentTemplate}: {$generateProgress.currentIcon}
      </p>
    </div>
  {/if}

  {#if selectedProjects.length === 0}
    <div class="flex-1 flex flex-col items-center justify-center text-zinc-500 border border-zinc-700 rounded-lg bg-zinc-800/30">
      <FolderOpen class="w-10 h-10 xl:w-12 xl:h-12 mb-2 opacity-50" />
      <p class="text-xs xl:text-sm">Select templates</p>
    </div>
  {:else}
    <div class="flex-1 overflow-y-auto space-y-1 pr-1">
      {#each selectedProjects as project}
        {@const isExpanded = expandedProjects.has(project.id)}
        {@const isCompleted = $generateProgress.completedTemplates.includes(project.id)}
        {@const isProcessing = $generateProgress.isGenerating && $generateProgress.currentTemplate === project.id}
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
            {#if isCompleted}
              <Check class="w-4 h-4 xl:w-5 xl:h-5 text-green-500" />
            {:else if isProcessing}
              <Loader2 class="w-4 h-4 xl:w-5 xl:h-5 text-blue-500 animate-spin" />
            {:else}
              <FolderOpen class="w-4 h-4 xl:w-5 xl:h-5 text-zinc-500" />
            {/if}
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

<!-- Result Modal -->
<Modal open={resultModalOpen} onClose={() => resultModalOpen = false} title="Generation Complete" class="w-[450px]">
  {#if currentResult}
    <div class="space-y-4">
      <!-- Status -->
      <div class={cn(
        'flex items-center gap-3 p-4 rounded-lg',
        currentResult.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'
      )}>
        {#if currentResult.success}
          <Check class="w-6 h-6 text-green-500" />
          <div>
            <p class="font-medium text-green-400">All icons generated successfully!</p>
            <p class="text-sm text-green-500/70">{currentResult.generated.length} icons created</p>
          </div>
        {:else}
          <AlertCircle class="w-6 h-6 text-yellow-500" />
          <div>
            <p class="font-medium text-yellow-400">Generation completed with issues</p>
            <p class="text-sm text-yellow-500/70">{currentResult.generated.length} succeeded, {currentResult.failed.length} failed</p>
          </div>
        {/if}
      </div>

      <!-- Failed items -->
      {#if currentResult.failed.length > 0}
        <div>
          <p class="text-sm text-zinc-400 mb-2">Failed icons:</p>
          <div class="max-h-32 overflow-y-auto space-y-1">
            {#each currentResult.failed as fail}
              <div class="text-xs bg-zinc-800 rounded px-3 py-2">
                <span class="text-zinc-300">{fail.name}</span>
                <span class="text-zinc-500 block truncate">{fail.error}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Output path -->
      <div class="bg-zinc-800 rounded-lg p-3">
        <p class="text-xs text-zinc-500 mb-1">Output folder</p>
        <p class="text-sm text-zinc-300 truncate">{currentResult.output_path}</p>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 pt-2">
        <Button variant="outline" onclick={() => resultModalOpen = false} class="flex-1">
          Close
        </Button>
        <Button variant="default" onclick={handleOpenFolder} class="flex-1">
          <FolderOpen class="w-4 h-4 mr-1.5" />
          Open Folder
        </Button>
      </div>
    </div>
  {/if}
</Modal>
