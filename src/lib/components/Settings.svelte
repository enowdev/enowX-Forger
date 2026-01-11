<script lang="ts">
  import { settings, type AppSettings } from '$lib/stores/settings';
  import { RotateCcw, Download, Pencil, Monitor, FolderOpen, Image, X, ChevronDown } from 'lucide-svelte';
  import Button from '$lib/components/ui/button.svelte';
  import { cn } from '$lib/utils';
  import { open } from '@tauri-apps/plugin-dialog';

  // Collapsible sections state
  let expandedSections = $state<Record<string, boolean>>({
    download: true,
    generate: false,
    editor: false,
    interface: false
  });

  function toggleSection(section: string) {
    expandedSections[section] = !expandedSections[section];
  }

  function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    settings.update(s => ({ ...s, [key]: value }));
  }

  function resetSettings() {
    settings.reset();
  }

  async function selectDownloadPath() {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Download Folder'
      });
      if (selected) {
        updateSetting('downloadPath', selected as string);
      }
    } catch (error) {
      console.error('Failed to open folder dialog:', error);
    }
  }

  async function selectGeneratePath() {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Generate Output Folder'
      });
      if (selected) {
        updateSetting('generateOutputPath', selected as string);
      }
    } catch (error) {
      console.error('Failed to open folder dialog:', error);
    }
  }

  function clearDownloadPath() {
    updateSetting('downloadPath', '');
  }

  function clearGeneratePath() {
    updateSetting('generateOutputPath', '');
  }

  const iconFormats = ['svg', 'png', 'webp'] as const;
  const iconSizes = [16, 24, 32, 48, 64, 128, 256, 512];
  const canvasSizes = [256, 512, 1024, 2048];
</script>

<div class="h-full overflow-y-auto p-4 xl:p-6">
  <div class="max-w-2xl mx-auto space-y-3">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg xl:text-xl font-semibold text-zinc-200">Settings</h2>
      <Button variant="outline" size="sm" onclick={resetSettings}>
        <RotateCcw class="w-4 h-4 mr-1.5" />
        Reset All
      </Button>
    </div>

    <!-- Download Settings -->
    <div class="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
      <button
        class="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
        onclick={() => toggleSection('download')}
      >
        <div class="flex items-center gap-3">
          <Download class="w-5 h-5 text-blue-500" />
          <span class="font-medium text-zinc-200">Download Settings</span>
        </div>
        <ChevronDown class={cn('w-5 h-5 text-zinc-400 transition-transform', expandedSections.download && 'rotate-180')} />
      </button>
      
      {#if expandedSections.download}
        <div class="px-4 pb-4 space-y-4 border-t border-zinc-700/50">
          <div class="pt-4">
            <span class="text-sm text-zinc-400 mb-2 block">Default Format</span>
            <div class="flex gap-2">
              {#each iconFormats as fmt}
                <button
                  class="flex-1 py-2 text-sm rounded-lg border transition-colors {$settings.defaultIconFormat === fmt 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600'}"
                  onclick={() => updateSetting('defaultIconFormat', fmt)}
                >
                  {fmt.toUpperCase()}
                </button>
              {/each}
            </div>
          </div>

          <div>
            <span class="text-sm text-zinc-400 mb-2 block">Default Size</span>
            <div class="flex flex-wrap gap-2">
              {#each iconSizes as size}
                <button
                  class="px-3 py-1.5 text-sm rounded-lg border transition-colors {$settings.defaultIconSize === size 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600'}"
                  onclick={() => updateSetting('defaultIconSize', size)}
                >
                  {size}px
                </button>
              {/each}
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <span class="text-sm text-zinc-200">Show Download Prompt</span>
              <p class="text-xs text-zinc-500 mt-0.5">Ask for format and size before downloading</p>
            </div>
            <button
              class="relative w-11 h-6 rounded-full transition-colors {$settings.showDownloadPrompt ? 'bg-blue-600' : 'bg-zinc-700'}"
              onclick={() => updateSetting('showDownloadPrompt', !$settings.showDownloadPrompt)}
              role="switch"
              aria-checked={$settings.showDownloadPrompt}
              aria-label="Toggle download prompt"
            >
              <span 
                class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform {$settings.showDownloadPrompt ? 'translate-x-5' : 'translate-x-0'}"
              ></span>
            </button>
          </div>

          <div>
            <span class="text-sm text-zinc-200 mb-2 block">Output Path</span>
            <div class="flex gap-2">
              <input
                type="text"
                value={$settings.downloadPath || 'Default (Browser Downloads)'}
                readonly
                class="flex-1 px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 truncate"
              />
              {#if $settings.downloadPath}
                <button class="p-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200" onclick={clearDownloadPath} title="Clear">
                  <X class="w-4 h-4" />
                </button>
              {/if}
              <button class="p-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200" onclick={selectDownloadPath} title="Browse">
                <FolderOpen class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Generate Settings -->
    <div class="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
      <button
        class="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
        onclick={() => toggleSection('generate')}
      >
        <div class="flex items-center gap-3">
          <Image class="w-5 h-5 text-orange-500" />
          <span class="font-medium text-zinc-200">Generate Settings</span>
        </div>
        <ChevronDown class={cn('w-5 h-5 text-zinc-400 transition-transform', expandedSections.generate && 'rotate-180')} />
      </button>
      
      {#if expandedSections.generate}
        <div class="px-4 pb-4 space-y-4 border-t border-zinc-700/50">
          <div class="pt-4">
            <span class="text-sm text-zinc-200 mb-2 block">Output Path</span>
            <div class="flex gap-2">
              <input
                type="text"
                value={$settings.generateOutputPath || 'Not set (will ask each time)'}
                readonly
                class="flex-1 px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 truncate"
              />
              {#if $settings.generateOutputPath}
                <button class="p-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200" onclick={clearGeneratePath} title="Clear">
                  <X class="w-4 h-4" />
                </button>
              {/if}
              <button class="p-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200" onclick={selectGeneratePath} title="Browse">
                <FolderOpen class="w-4 h-4" />
              </button>
            </div>
            <p class="text-xs text-zinc-500 mt-1">Where generated icons will be saved</p>
          </div>
        </div>
      {/if}
    </div>

    <!-- Editor Settings -->
    <div class="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
      <button
        class="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
        onclick={() => toggleSection('editor')}
      >
        <div class="flex items-center gap-3">
          <Pencil class="w-5 h-5 text-green-500" />
          <span class="font-medium text-zinc-200">Editor Settings</span>
        </div>
        <ChevronDown class={cn('w-5 h-5 text-zinc-400 transition-transform', expandedSections.editor && 'rotate-180')} />
      </button>
      
      {#if expandedSections.editor}
        <div class="px-4 pb-4 space-y-4 border-t border-zinc-700/50">
          <div class="pt-4">
            <span class="text-sm text-zinc-400 mb-2 block">Default Canvas Size</span>
            <div class="flex gap-2">
              {#each canvasSizes as size}
                <button
                  class="flex-1 py-2 text-sm rounded-lg border transition-colors {$settings.defaultCanvasSize === size 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600'}"
                  onclick={() => updateSetting('defaultCanvasSize', size)}
                >
                  {size}px
                </button>
              {/each}
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <span class="text-sm text-zinc-200">Show Rulers</span>
              <p class="text-xs text-zinc-500 mt-0.5">Display rulers on canvas edges</p>
            </div>
            <button
              class="relative w-11 h-6 rounded-full transition-colors {$settings.showRulers ? 'bg-blue-600' : 'bg-zinc-700'}"
              onclick={() => updateSetting('showRulers', !$settings.showRulers)}
              role="switch"
              aria-checked={$settings.showRulers}
              aria-label="Toggle rulers"
            >
              <span 
                class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform {$settings.showRulers ? 'translate-x-5' : 'translate-x-0'}"
              ></span>
            </button>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <span class="text-sm text-zinc-200">Show Guides</span>
              <p class="text-xs text-zinc-500 mt-0.5">Display guide lines on canvas</p>
            </div>
            <button
              class="relative w-11 h-6 rounded-full transition-colors {$settings.showGuides ? 'bg-blue-600' : 'bg-zinc-700'}"
              onclick={() => updateSetting('showGuides', !$settings.showGuides)}
              role="switch"
              aria-checked={$settings.showGuides}
              aria-label="Toggle guides"
            >
              <span 
                class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform {$settings.showGuides ? 'translate-x-5' : 'translate-x-0'}"
              ></span>
            </button>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <span class="text-sm text-zinc-200">Snap to Guides</span>
              <p class="text-xs text-zinc-500 mt-0.5">Automatically snap elements to guides</p>
            </div>
            <button
              class="relative w-11 h-6 rounded-full transition-colors {$settings.snapToGuides ? 'bg-blue-600' : 'bg-zinc-700'}"
              onclick={() => updateSetting('snapToGuides', !$settings.snapToGuides)}
              role="switch"
              aria-checked={$settings.snapToGuides}
              aria-label="Toggle snap to guides"
            >
              <span 
                class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform {$settings.snapToGuides ? 'translate-x-5' : 'translate-x-0'}"
              ></span>
            </button>
          </div>
        </div>
      {/if}
    </div>

    <!-- Interface Settings -->
    <div class="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
      <button
        class="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
        onclick={() => toggleSection('interface')}
      >
        <div class="flex items-center gap-3">
          <Monitor class="w-5 h-5 text-purple-500" />
          <span class="font-medium text-zinc-200">Interface</span>
        </div>
        <ChevronDown class={cn('w-5 h-5 text-zinc-400 transition-transform', expandedSections.interface && 'rotate-180')} />
      </button>
      
      {#if expandedSections.interface}
        <div class="px-4 pb-4 space-y-4 border-t border-zinc-700/50">
          <div class="pt-4 flex items-center justify-between opacity-50">
            <div>
              <span class="text-sm text-zinc-200">Theme</span>
              <p class="text-xs text-zinc-500 mt-0.5">Dark theme only (for now)</p>
            </div>
            <span class="text-sm text-zinc-400">Dark</span>
          </div>
        </div>
      {/if}
    </div>

    <!-- Info -->
    <div class="text-center text-xs text-zinc-600 pt-2">
      Settings are saved automatically
    </div>
  </div>
</div>
