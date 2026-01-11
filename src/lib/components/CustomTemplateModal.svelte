<script lang="ts">
  import { Plus, Trash2, Save } from 'lucide-svelte';
  import Modal from '$lib/components/ui/modal.svelte';
  import Button from '$lib/components/ui/button.svelte';

  interface Props {
    open: boolean;
    onClose: () => void;
    onSave: (sizes: CustomSize[]) => void;
  }

  interface CustomSize {
    id: string;
    name: string;
    width: number;
    height: number;
    format: string;
  }

  let { open, onClose, onSave }: Props = $props();

  let templateName = $state('My Custom Template');
  let sizes = $state<CustomSize[]>([
    { id: crypto.randomUUID(), name: 'icon.png', width: 512, height: 512, format: 'png' }
  ]);

  function addSize() {
    sizes = [...sizes, {
      id: crypto.randomUUID(),
      name: `icon-${sizes.length + 1}.png`,
      width: 256,
      height: 256,
      format: 'png'
    }];
  }

  function removeSize(id: string) {
    sizes = sizes.filter(s => s.id !== id);
  }

  function updateSize(id: string, field: keyof CustomSize, value: string | number) {
    sizes = sizes.map(s => {
      if (s.id === id) {
        return { ...s, [field]: value };
      }
      return s;
    });
  }

  function handleSave() {
    onSave(sizes);
    onClose();
  }

  const formats = ['png', 'ico', 'icns', 'svg', 'jpg', 'webp'];
</script>

<Modal {open} {onClose} title="Custom Template" class="w-[500px]">
  <div class="space-y-4">
    <!-- Template Name -->
    <div>
      <label class="block text-xs text-zinc-400 mb-1.5">Template Name</label>
      <input
        type="text"
        bind:value={templateName}
        class="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-600"
      />
    </div>

    <!-- Sizes List -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-xs text-zinc-400">Icon Sizes</label>
        <Button variant="ghost" size="sm" onclick={addSize}>
          <Plus class="w-3 h-3 mr-1" />
          Add Size
        </Button>
      </div>

      <div class="space-y-2 max-h-[300px] overflow-y-auto">
        {#each sizes as size (size.id)}
          <div class="flex items-center gap-2 p-2 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <!-- Filename -->
            <input
              type="text"
              value={size.name}
              oninput={(e) => updateSize(size.id, 'name', (e.target as HTMLInputElement).value)}
              placeholder="filename"
              class="flex-1 px-2 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-zinc-600"
            />
            <!-- Width -->
            <input
              type="number"
              value={size.width}
              oninput={(e) => updateSize(size.id, 'width', parseInt((e.target as HTMLInputElement).value) || 0)}
              placeholder="W"
              class="w-16 px-2 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200 text-center focus:outline-none focus:border-zinc-600"
            />
            <span class="text-zinc-500 text-xs">x</span>
            <!-- Height -->
            <input
              type="number"
              value={size.height}
              oninput={(e) => updateSize(size.id, 'height', parseInt((e.target as HTMLInputElement).value) || 0)}
              placeholder="H"
              class="w-16 px-2 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200 text-center focus:outline-none focus:border-zinc-600"
            />
            <!-- Format -->
            <select
              value={size.format}
              onchange={(e) => updateSize(size.id, 'format', (e.target as HTMLSelectElement).value)}
              class="px-2 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-zinc-600"
            >
              {#each formats as fmt}
                <option value={fmt}>{fmt}</option>
              {/each}
            </select>
            <!-- Delete -->
            <button
              class="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-700 rounded transition-colors"
              onclick={() => removeSize(size.id)}
              disabled={sizes.length <= 1}
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        {/each}
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-2 pt-2 border-t border-zinc-700">
      <Button variant="outline" onclick={onClose}>Cancel</Button>
      <Button variant="default" onclick={handleSave}>
        <Save class="w-3.5 h-3.5 mr-1.5" />
        Save Template
      </Button>
    </div>
  </div>
</Modal>
