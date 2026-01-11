<script lang="ts">
  import { 
    newFile, addLayer, undo, redo, deleteLayer, duplicateLayer,
    selectedLayerId, layers, zoom, brushSize
  } from '$lib/stores/editor';
  import { get } from 'svelte/store';

  function handleKeydown(e: KeyboardEvent) {
    // Ignore if typing in input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;

    // Ctrl + N = New File
    if (ctrl && e.key === 'n') {
      e.preventDefault();
      if (confirm('Create new file? Unsaved changes will be lost.')) {
        newFile();
      }
    }

    // Ctrl + Shift + N = New Layer
    if (ctrl && shift && e.key === 'N') {
      e.preventDefault();
      addLayer();
    }

    // Ctrl + Z = Undo
    if (ctrl && !shift && e.key === 'z') {
      e.preventDefault();
      undo();
    }

    // Ctrl + Shift + Z or Ctrl + Y = Redo
    if ((ctrl && shift && e.key === 'Z') || (ctrl && e.key === 'y')) {
      e.preventDefault();
      redo();
    }

    // Delete/Backspace = Delete selected layer
    if ((e.key === 'Delete' || e.key === 'Backspace') && !ctrl) {
      const selected = get(selectedLayerId);
      const layerCount = get(layers).length;
      if (selected && layerCount > 1) {
        e.preventDefault();
        deleteLayer(selected);
      }
    }

    // Ctrl + D = Duplicate layer
    if (ctrl && e.key === 'd') {
      e.preventDefault();
      const selected = get(selectedLayerId);
      if (selected) {
        duplicateLayer(selected);
      }
    }

    // Ctrl + 0 = Reset zoom
    if (ctrl && e.key === '0') {
      e.preventDefault();
      zoom.set(1);
    }

    // Ctrl + + = Zoom in
    if (ctrl && (e.key === '+' || e.key === '=')) {
      e.preventDefault();
      zoom.update(z => Math.min(z + 0.25, 4));
    }

    // Ctrl + - = Zoom out
    if (ctrl && e.key === '-') {
      e.preventDefault();
      zoom.update(z => Math.max(z - 0.25, 0.1));
    }

    // [ = Decrease brush size
    if (e.key === '[') {
      e.preventDefault();
      brushSize.update(s => Math.max(1, s - 5));
    }

    // ] = Increase brush size
    if (e.key === ']') {
      e.preventDefault();
      brushSize.update(s => Math.min(100, s + 5));
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />
