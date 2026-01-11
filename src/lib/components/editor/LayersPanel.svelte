<script lang="ts">
  import { 
    Eye, EyeOff, Lock, Unlock, Trash2, Plus, Image, Square, Type,
    Copy, GripVertical, Pencil
  } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { 
    layers, selectedLayerId, addLayer, deleteLayer, duplicateLayer, 
    moveLayerOrder, saveHistory, type Layer 
  } from '$lib/stores/editor';

  let draggedIndex: number | null = null;
  let dragOverIndex: number | null = null;

  function toggleVisibility(id: string) {
    layers.update(ls => ls.map(l => 
      l.id === id ? { ...l, visible: !l.visible } : l
    ));
    saveHistory();
  }

  function toggleLock(id: string) {
    layers.update(ls => ls.map(l => 
      l.id === id ? { ...l, locked: !l.locked } : l
    ));
    saveHistory();
  }

  function selectLayer(id: string) {
    selectedLayerId.set(id);
  }

  function handleDragStart(e: DragEvent, index: number) {
    draggedIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  }

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    dragOverIndex = index;
  }

  function handleDragEnd() {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      moveLayerOrder(draggedIndex, dragOverIndex);
    }
    draggedIndex = null;
    dragOverIndex = null;
  }

  function getLayerIcon(type: Layer['type']) {
    switch (type) {
      case 'image': return Image;
      case 'text': return Type;
      case 'path': return Pencil;
      default: return Square;
    }
  }

  function renameLayer(id: string, newName: string) {
    layers.update(ls => ls.map(l => 
      l.id === id ? { ...l, name: newName } : l
    ));
  }

  let editingId: string | null = null;
  let editingName = '';

  function startRename(layer: Layer) {
    editingId = layer.id;
    editingName = layer.name;
  }

  function finishRename() {
    if (editingId && editingName.trim()) {
      renameLayer(editingId, editingName.trim());
    }
    editingId = null;
    editingName = '';
  }
</script>

<div class="h-full flex flex-col bg-zinc-900 border-l border-zinc-800">
  <!-- Header -->
  <div class="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
    <span class="text-xs font-semibold text-zinc-300">Layers</span>
    <button
      class="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
      onclick={() => addLayer()}
      title="Add Layer (Ctrl+Shift+N)"
    >
      <Plus class="w-4 h-4" />
    </button>
  </div>

  <!-- Layers List -->
  <div class="flex-1 overflow-y-auto">
    {#each $layers as layer, index (layer.id)}
      {@const Icon = getLayerIcon(layer.type)}
      {@const isSelected = $selectedLayerId === layer.id}
      {@const isDragOver = dragOverIndex === index && draggedIndex !== index}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class={cn(
          'flex items-center gap-1 px-1 py-1 border-b border-zinc-800/50 cursor-pointer transition-colors',
          isSelected ? 'bg-blue-600/20' : 'hover:bg-zinc-800/50',
          isDragOver && 'border-t-2 border-t-blue-500'
        )}
        onclick={() => selectLayer(layer.id)}
        draggable="true"
        ondragstart={(e) => handleDragStart(e, index)}
        ondragover={(e) => handleDragOver(e, index)}
        ondragend={handleDragEnd}
      >
        <!-- Drag Handle -->
        <div class="p-0.5 text-zinc-600 cursor-grab">
          <GripVertical class="w-3 h-3" />
        </div>

        <!-- Visibility -->
        <button
          class="p-0.5 text-zinc-500 hover:text-zinc-300"
          onclick={(e) => { e.stopPropagation(); toggleVisibility(layer.id); }}
        >
          {#if layer.visible}
            <Eye class="w-3.5 h-3.5" />
          {:else}
            <EyeOff class="w-3.5 h-3.5" />
          {/if}
        </button>

        <!-- Lock -->
        <button
          class="p-0.5 text-zinc-500 hover:text-zinc-300"
          onclick={(e) => { e.stopPropagation(); toggleLock(layer.id); }}
        >
          {#if layer.locked}
            <Lock class="w-3.5 h-3.5" />
          {:else}
            <Unlock class="w-3.5 h-3.5" />
          {/if}
        </button>

        <!-- Icon & Name -->
        <Icon class="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        {#if editingId === layer.id}
          <input
            type="text"
            bind:value={editingName}
            class="flex-1 text-xs bg-zinc-800 border border-zinc-600 rounded px-1 py-0.5 text-zinc-200 min-w-0"
            onblur={finishRename}
            onkeydown={(e) => e.key === 'Enter' && finishRename()}
            autofocus
          />
        {:else}
          <span 
            class="flex-1 text-xs text-zinc-300 truncate"
            ondblclick={() => startRename(layer)}
          >
            {layer.name}
          </span>
        {/if}

        <!-- Actions -->
        {#if isSelected}
          <div class="flex items-center">
            <button
              class="p-0.5 text-zinc-500 hover:text-zinc-300"
              onclick={(e) => { e.stopPropagation(); duplicateLayer(layer.id); }}
              title="Duplicate"
            >
              <Copy class="w-3 h-3" />
            </button>
            <button
              class="p-0.5 text-zinc-500 hover:text-red-400"
              onclick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
              title="Delete"
              disabled={$layers.length <= 1}
            >
              <Trash2 class="w-3 h-3" />
            </button>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
