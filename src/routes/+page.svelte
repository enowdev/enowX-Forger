<script lang="ts">
  import Titlebar from '$lib/components/Titlebar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import ImageUploader from '$lib/components/ImageUploader.svelte';
  import TemplateSelector from '$lib/components/TemplateSelector.svelte';
  import IconPreview from '$lib/components/IconPreview.svelte';
  import ToolsPanel from '$lib/components/ToolsPanel.svelte';
  import CustomTemplateModal from '$lib/components/CustomTemplateModal.svelte';
  import Card from '$lib/components/ui/card.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import { Trash2 } from 'lucide-svelte';
  
  // Editor components
  import EditorToolbar from '$lib/components/editor/Toolbar.svelte';
  import EditorCanvas from '$lib/components/editor/Canvas.svelte';
  import LayersPanel from '$lib/components/editor/LayersPanel.svelte';
  import PropertiesPanel from '$lib/components/editor/PropertiesPanel.svelte';
  import KeyboardShortcuts from '$lib/components/editor/KeyboardShortcuts.svelte';

  let activeTab = $state('generate');
  let selectedTemplates = $state<string[]>(['tauri']);
  let previewUrl = $state<string | null>(null);
  let selectedFile = $state<File | null>(null);
  let bgRemoverEnabled = $state(false);
  let customModalOpen = $state(false);

  function handleImageSelect(file: File) {
    selectedFile = file;
    previewUrl = URL.createObjectURL(file);
  }

  function handleTemplateToggle(templateId: string) {
    if (selectedTemplates.includes(templateId)) {
      selectedTemplates = selectedTemplates.filter((t) => t !== templateId);
    } else {
      selectedTemplates = [...selectedTemplates, templateId];
    }
  }

  function clearImage() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    previewUrl = null;
    selectedFile = null;
  }

  function handleCustomSave(sizes: any[]) {
    console.log('Custom sizes:', sizes);
    // TODO: Add custom template to list
  }
</script>

<div class="h-screen flex flex-col overflow-hidden bg-zinc-900">
  <Titlebar />
  
  <div class="flex-1 flex overflow-hidden">
    <Sidebar {activeTab} onTabChange={(tab: string) => (activeTab = tab)} />

    <main class="flex-1 overflow-hidden bg-zinc-900">
      {#if activeTab === 'generate'}
        <div class="h-full flex">
          <!-- Left Panel -->
          <div class="flex-1 p-4 xl:p-6 overflow-hidden flex flex-col">
            <div class="space-y-4 xl:space-y-6 flex-1 overflow-hidden flex flex-col">
              <!-- Source Image -->
              <div>
                <div class="flex items-center justify-between mb-2 xl:mb-3">
                  <h2 class="text-sm xl:text-base font-semibold text-zinc-200">Source Image</h2>
                  {#if previewUrl}
                    <Button variant="ghost" size="sm" onclick={clearImage}>
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  {/if}
                </div>
                <ImageUploader onImageSelect={handleImageSelect} {previewUrl} />
              </div>

              <!-- Tools -->
              <div>
                <h2 class="text-sm xl:text-base font-semibold mb-2 xl:mb-3 text-zinc-200">Tools</h2>
                <ToolsPanel
                  {bgRemoverEnabled}
                  onBgRemoverToggle={() => (bgRemoverEnabled = !bgRemoverEnabled)}
                />
              </div>

              <!-- Templates -->
              <div class="flex-1 overflow-hidden flex flex-col min-h-0">
                <h2 class="text-sm xl:text-base font-semibold mb-2 xl:mb-3 text-zinc-200">Templates</h2>
                <div class="flex-1 overflow-hidden">
                  <TemplateSelector 
                    {selectedTemplates} 
                    onToggle={handleTemplateToggle}
                    onCustomClick={() => customModalOpen = true}
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Right Panel -->
          <div class="w-72 xl:w-80 p-4 xl:p-6 border-l border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <IconPreview {selectedTemplates} {previewUrl} />
          </div>
        </div>

        <CustomTemplateModal 
          open={customModalOpen} 
          onClose={() => customModalOpen = false}
          onSave={handleCustomSave}
        />

      {:else if activeTab === 'editor'}
        <KeyboardShortcuts />
        <div class="h-full flex">
          <!-- Left Toolbar -->
          <EditorToolbar />
          
          <!-- Canvas -->
          <EditorCanvas />
          
          <!-- Right Panels -->
          <div class="w-56 xl:w-64 flex flex-col">
            <div class="flex-1 min-h-0">
              <LayersPanel />
            </div>
            <div class="h-1/2 min-h-0 border-t border-zinc-800">
              <PropertiesPanel />
            </div>
          </div>
        </div>

      {:else if activeTab === 'templates'}
        <div class="p-4 xl:p-6">
          <h2 class="text-sm xl:text-base font-semibold mb-3 text-zinc-200">Template Manager</h2>
          <p class="text-xs xl:text-sm text-zinc-500">Coming soon</p>
        </div>

      {:else if activeTab === 'settings'}
        <div class="p-4 xl:p-6">
          <h2 class="text-sm xl:text-base font-semibold mb-3 text-zinc-200">Settings</h2>
          <p class="text-xs xl:text-sm text-zinc-500">Coming soon</p>
        </div>

      {:else if activeTab === 'about'}
        <div class="p-4 xl:p-6">
          <h2 class="text-sm xl:text-base font-semibold mb-3 text-zinc-200">About</h2>
          <Card class="p-4 xl:p-5 max-w-md">
            <h3 class="font-semibold text-sm xl:text-base text-zinc-200">Enowx Forger</h3>
            <p class="text-xs xl:text-sm text-zinc-400 mt-2">
              Generate app icons for multiple platforms from a single image.
            </p>
            <p class="text-[10px] xl:text-xs text-zinc-500 mt-3">v0.1.0</p>
          </Card>
        </div>
      {/if}
    </main>
  </div>
</div>
