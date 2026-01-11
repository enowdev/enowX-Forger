<script lang="ts">
  import Titlebar from '$lib/components/Titlebar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import ImageUploader from '$lib/components/ImageUploader.svelte';
  import TemplateSelector from '$lib/components/TemplateSelector.svelte';
  import IconPreview from '$lib/components/IconPreview.svelte';
  import ToolsPanel from '$lib/components/ToolsPanel.svelte';
  import CustomTemplateModal from '$lib/components/CustomTemplateModal.svelte';
  import Discovery from '$lib/components/Discovery.svelte';
  import Settings from '$lib/components/Settings.svelte';
  import Card from '$lib/components/ui/card.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import { Trash2 } from 'lucide-svelte';
  import { templates } from '$lib/data/templates';
  import { resetCompletedState } from '$lib/stores/generator';
  
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

  function handleToggleAll() {
    const allSelected = templates.every(t => selectedTemplates.includes(t.id));
    if (allSelected) {
      selectedTemplates = [];
    } else {
      selectedTemplates = templates.map(t => t.id);
    }
    // Reset completed state when changing selection
    resetCompletedState();
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
                    onToggleAll={handleToggleAll}
                    onCustomClick={() => customModalOpen = true}
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Right Panel -->
          <div class="w-72 xl:w-80 p-4 xl:p-6 border-l border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <IconPreview {selectedTemplates} {previewUrl} {selectedFile} />
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

      {:else if activeTab === 'discovery'}
        <Discovery />

      {:else if activeTab === 'settings'}
        <Settings />

      {:else if activeTab === 'about'}
        <div class="h-full flex flex-col p-4 xl:p-6">
          <h2 class="text-sm xl:text-base font-semibold mb-4 text-zinc-200">About</h2>
          <div class="flex-1 flex items-center justify-center">
            <Card class="p-6 xl:p-8 max-w-md text-center">
              <img src="/app-icon-hd.png" alt="enowX Forger" class="w-20 h-20 mx-auto mb-4 rounded-xl" />
              <h3 class="font-semibold text-lg xl:text-xl text-zinc-200">enowX Forger</h3>
              <p class="text-sm text-zinc-400 mt-3">
                Generate app icons for multiple platforms from a single image. Built with Tauri, SvelteKit, and Tailwind CSS.
              </p>
              <div class="mt-5 pt-4 border-t border-zinc-800 space-y-3">
                <div>
                  <p class="text-xs text-zinc-500">Version 0.1.0</p>
                  <p class="text-xs text-zinc-600 mt-1">Developed by enowdev</p>
                </div>
                <a 
                  href="https://github.com/enowdev/enowX-Forger" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  View on GitHub
                </a>
              </div>
              <div class="mt-5 pt-4 border-t border-zinc-800">
                <p class="text-[10px] text-zinc-600 mb-2">Credits</p>
                <div class="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-zinc-500">
                  <a href="https://tauri.app" target="_blank" rel="noopener noreferrer" class="hover:text-zinc-400">Tauri</a>
                  <a href="https://svelte.dev" target="_blank" rel="noopener noreferrer" class="hover:text-zinc-400">SvelteKit</a>
                  <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer" class="hover:text-zinc-400">Tailwind CSS</a>
                  <a href="https://iconify.design" target="_blank" rel="noopener noreferrer" class="hover:text-zinc-400">Iconify</a>
                  <a href="https://lucide.dev" target="_blank" rel="noopener noreferrer" class="hover:text-zinc-400">Lucide Icons</a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      {/if}
    </main>
  </div>
  
  <!-- Footer -->
  <footer class="h-7 flex items-center justify-between px-4 bg-zinc-900 border-t border-zinc-800 text-[10px] text-zinc-500">
    <span>enowX Forger v0.1.0</span>
    <span>Made with love by enowdev</span>
  </footer>
</div>
