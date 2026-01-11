<script lang="ts">
  import { 
    layers, selectedLayerId, fillColor, strokeColor, strokeWidth, 
    canvasSize, brushSize, currentTool, saveHistory, guides, addGuide
  } from '$lib/stores/editor';
  import type { Layer, ShapeData, TextData, PathData } from '$lib/stores/editor';
  import { Plus } from 'lucide-svelte';

  let selectedLayer = $derived($layers.find(l => l.id === $selectedLayerId));

  function updateLayer(field: keyof Layer, value: any) {
    if (!$selectedLayerId) return;
    layers.update(ls => ls.map(l => 
      l.id === $selectedLayerId ? { ...l, [field]: value } : l
    ));
  }

  function updateLayerData(field: string, value: any) {
    if (!$selectedLayerId) return;
    layers.update(ls => ls.map(l => 
      l.id === $selectedLayerId ? { ...l, data: { ...l.data, [field]: value } } : l
    ));
  }

  function commitChange() {
    saveHistory();
  }

  let newGuidePos = $state(256);
  let newGuideType = $state<'horizontal' | 'vertical'>('horizontal');
</script>

<div class="h-full flex flex-col bg-zinc-900 border-l border-zinc-800 overflow-hidden">
  <div class="px-3 py-2 border-b border-zinc-800">
    <span class="text-xs font-semibold text-zinc-300">Properties</span>
  </div>

  <div class="flex-1 overflow-y-auto p-3 space-y-4">
    {#if selectedLayer}
      <!-- Layer Name -->
      <div>
        <label class="text-[10px] uppercase text-zinc-500 mb-1 block">Name</label>
        <input
          type="text"
          value={selectedLayer.name}
          oninput={(e) => updateLayer('name', (e.target as HTMLInputElement).value)}
          onblur={commitChange}
          class="w-full px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200"
        />
      </div>

      <!-- Transform -->
      <div>
        <h4 class="text-[10px] uppercase text-zinc-500 mb-2">Transform</h4>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-[10px] text-zinc-500">X</label>
            <input type="number" value={selectedLayer.x} oninput={(e) => updateLayer('x', parseInt((e.target as HTMLInputElement).value) || 0)} onblur={commitChange} class="w-full px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200" />
          </div>
          <div>
            <label class="text-[10px] text-zinc-500">Y</label>
            <input type="number" value={selectedLayer.y} oninput={(e) => updateLayer('y', parseInt((e.target as HTMLInputElement).value) || 0)} onblur={commitChange} class="w-full px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200" />
          </div>
          <div>
            <label class="text-[10px] text-zinc-500">W</label>
            <input type="number" value={selectedLayer.width} oninput={(e) => updateLayer('width', parseInt((e.target as HTMLInputElement).value) || 0)} onblur={commitChange} class="w-full px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200" />
          </div>
          <div>
            <label class="text-[10px] text-zinc-500">H</label>
            <input type="number" value={selectedLayer.height} oninput={(e) => updateLayer('height', parseInt((e.target as HTMLInputElement).value) || 0)} onblur={commitChange} class="w-full px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200" />
          </div>
          <div>
            <label class="text-[10px] text-zinc-500">Rotation</label>
            <input type="number" value={selectedLayer.rotation} oninput={(e) => updateLayer('rotation', parseInt((e.target as HTMLInputElement).value) || 0)} onblur={commitChange} class="w-full px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200" />
          </div>
          <div>
            <label class="text-[10px] text-zinc-500">Opacity</label>
            <input type="number" min="0" max="100" value={selectedLayer.opacity} oninput={(e) => updateLayer('opacity', parseInt((e.target as HTMLInputElement).value) || 0)} onblur={commitChange} class="w-full px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200" />
          </div>
        </div>
      </div>

      <!-- Shape Properties -->
      {#if selectedLayer.type === 'shape'}
        {@const shapeData = selectedLayer.data as ShapeData}
        <div>
          <h4 class="text-[10px] uppercase text-zinc-500 mb-2">Fill & Stroke</h4>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-zinc-500 w-10">Fill</span>
              <input type="color" value={shapeData.fill === 'transparent' ? '#ffffff' : shapeData.fill} oninput={(e) => updateLayerData('fill', (e.target as HTMLInputElement).value)} onchange={commitChange} class="w-6 h-6 rounded border border-zinc-700 cursor-pointer" />
              <input type="text" value={shapeData.fill} oninput={(e) => updateLayerData('fill', (e.target as HTMLInputElement).value)} onblur={commitChange} class="flex-1 px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-zinc-500 w-10">Stroke</span>
              <input type="color" value={shapeData.stroke === 'transparent' ? '#ffffff' : shapeData.stroke} oninput={(e) => updateLayerData('stroke', (e.target as HTMLInputElement).value)} onchange={commitChange} class="w-6 h-6 rounded border border-zinc-700 cursor-pointer" />
              <input type="text" value={shapeData.stroke} oninput={(e) => updateLayerData('stroke', (e.target as HTMLInputElement).value)} onblur={commitChange} class="flex-1 px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-zinc-500 w-10">Width</span>
              <input type="number" min="0" value={shapeData.strokeWidth} oninput={(e) => updateLayerData('strokeWidth', parseInt((e.target as HTMLInputElement).value) || 0)} onblur={commitChange} class="flex-1 px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200" />
            </div>
            {#if shapeData.shape === 'rounded-rect'}
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-zinc-500 w-10">Radius</span>
                <input type="number" min="0" value={shapeData.cornerRadius || 0} oninput={(e) => updateLayerData('cornerRadius', parseInt((e.target as HTMLInputElement).value) || 0)} onblur={commitChange} class="flex-1 px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200" />
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Path Properties -->
      {#if selectedLayer.type === 'path'}
        {@const pathData = selectedLayer.data as PathData}
        <div>
          <h4 class="text-[10px] uppercase text-zinc-500 mb-2">Path</h4>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-zinc-500 w-10">Stroke</span>
              <input type="color" value={pathData.stroke} oninput={(e) => updateLayerData('stroke', (e.target as HTMLInputElement).value)} onchange={commitChange} class="w-6 h-6 rounded border border-zinc-700 cursor-pointer" />
              <input type="text" value={pathData.stroke} oninput={(e) => updateLayerData('stroke', (e.target as HTMLInputElement).value)} onblur={commitChange} class="flex-1 px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-zinc-500 w-10">Width</span>
              <input type="number" min="1" value={pathData.strokeWidth} oninput={(e) => updateLayerData('strokeWidth', parseInt((e.target as HTMLInputElement).value) || 1)} onblur={commitChange} class="flex-1 px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200" />
            </div>
          </div>
        </div>
      {/if}

      <!-- Text Properties -->
      {#if selectedLayer.type === 'text'}
        {@const textData = selectedLayer.data as TextData}
        <div>
          <h4 class="text-[10px] uppercase text-zinc-500 mb-2">Text</h4>
          <div class="space-y-2">
            <textarea value={textData.text} oninput={(e) => updateLayerData('text', (e.target as HTMLTextAreaElement).value)} onblur={commitChange} class="w-full px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200 resize-none" rows="2"></textarea>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-zinc-500 w-10">Font</span>
              <select value={textData.fontFamily} onchange={(e) => { updateLayerData('fontFamily', (e.target as HTMLSelectElement).value); commitChange(); }} class="flex-1 px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200">
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Courier New">Courier New</option>
                <option value="Impact">Impact</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-zinc-500 w-10">Size</span>
              <input type="number" min="8" value={textData.fontSize} oninput={(e) => updateLayerData('fontSize', parseInt((e.target as HTMLInputElement).value) || 16)} onblur={commitChange} class="flex-1 px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-zinc-500 w-10">Color</span>
              <input type="color" value={textData.color} oninput={(e) => updateLayerData('color', (e.target as HTMLInputElement).value)} onchange={commitChange} class="w-6 h-6 rounded border border-zinc-700 cursor-pointer" />
              <input type="text" value={textData.color} oninput={(e) => updateLayerData('color', (e.target as HTMLInputElement).value)} onblur={commitChange} class="flex-1 px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-zinc-500 w-10">Weight</span>
              <select value={textData.fontWeight} onchange={(e) => { updateLayerData('fontWeight', parseInt((e.target as HTMLSelectElement).value)); commitChange(); }} class="flex-1 px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200">
                <option value="100">Thin</option>
                <option value="300">Light</option>
                <option value="400">Regular</option>
                <option value="500">Medium</option>
                <option value="600">Semibold</option>
                <option value="700">Bold</option>
                <option value="900">Black</option>
              </select>
            </div>
          </div>
        </div>
      {/if}

    {:else}
      <!-- No layer selected - show canvas & brush settings -->
      <div>
        <h4 class="text-[10px] uppercase text-zinc-500 mb-2">Canvas</h4>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-[10px] text-zinc-500">Width</label>
            <input type="number" value={$canvasSize.width} oninput={(e) => canvasSize.update(s => ({ ...s, width: parseInt((e.target as HTMLInputElement).value) || 512 }))} class="w-full px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200" />
          </div>
          <div>
            <label class="text-[10px] text-zinc-500">Height</label>
            <input type="number" value={$canvasSize.height} oninput={(e) => canvasSize.update(s => ({ ...s, height: parseInt((e.target as HTMLInputElement).value) || 512 }))} class="w-full px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200" />
          </div>
        </div>
        <div class="mt-2 flex flex-wrap gap-1">
          {#each [64, 128, 256, 512, 1024] as size}
            <button class="px-2 py-1 text-[10px] bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-zinc-300" onclick={() => canvasSize.set({ width: size, height: size })}>{size}</button>
          {/each}
        </div>
      </div>

      <!-- Brush Settings -->
      {#if ['brush', 'pen', 'eraser'].includes($currentTool)}
        <div>
          <h4 class="text-[10px] uppercase text-zinc-500 mb-2">Brush</h4>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-zinc-500 w-10">Color</span>
              <input type="color" bind:value={$strokeColor} class="w-6 h-6 rounded border border-zinc-700 cursor-pointer" />
              <input type="text" bind:value={$strokeColor} class="flex-1 px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-zinc-500 w-10">Size</span>
              <input type="range" min="1" max="100" bind:value={$brushSize} class="flex-1" />
              <span class="text-xs text-zinc-400 w-8">{$brushSize}</span>
            </div>
          </div>
        </div>
      {/if}

      <!-- Guides -->
      <div>
        <h4 class="text-[10px] uppercase text-zinc-500 mb-2">Guides</h4>
        <div class="flex gap-1 mb-2">
          <select bind:value={newGuideType} class="flex-1 px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200">
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
          <input type="number" bind:value={newGuidePos} class="w-16 px-2 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200" />
          <button class="p-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded" onclick={() => addGuide(newGuideType, newGuidePos)}>
            <Plus class="w-4 h-4 text-zinc-300" />
          </button>
        </div>
        <div class="text-[10px] text-zinc-500">
          {$guides.length} guide(s)
        </div>
      </div>

      <div class="text-center py-2 text-zinc-500">
        <p class="text-[10px]">Select a layer to edit</p>
      </div>
    {/if}
  </div>
</div>
