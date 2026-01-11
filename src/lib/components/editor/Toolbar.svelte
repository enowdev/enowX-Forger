<script lang="ts">
  import { 
    MousePointer2, Move, Square, Circle, Type, Pen, Eraser, 
    Pipette, Hand, RectangleHorizontal, Brush, Triangle, Star,
    Minus, PaintBucket, Crop, Blend
  } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { currentTool, fillColor, strokeColor, type Tool } from '$lib/stores/editor';

  const toolGroups: { id: Tool; icon: typeof MousePointer2; label: string; shortcut?: string }[][] = [
    [
      { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
      { id: 'move', icon: Move, label: 'Move', shortcut: 'M' },
      { id: 'hand', icon: Hand, label: 'Hand (Pan)', shortcut: 'H' },
    ],
    [
      { id: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
      { id: 'rounded-rect', icon: RectangleHorizontal, label: 'Rounded Rectangle', shortcut: 'U' },
      { id: 'circle', icon: Circle, label: 'Circle/Ellipse', shortcut: 'O' },
      { id: 'triangle', icon: Triangle, label: 'Triangle', shortcut: 'Y' },
      { id: 'star', icon: Star, label: 'Star', shortcut: 'S' },
      { id: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
    ],
    [
      { id: 'pen', icon: Pen, label: 'Pen (Path)', shortcut: 'P' },
      { id: 'brush', icon: Brush, label: 'Brush (Free Draw)', shortcut: 'B' },
      { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
    ],
    [
      { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
    ],
    [
      { id: 'bucket', icon: PaintBucket, label: 'Paint Bucket', shortcut: 'G' },
      { id: 'gradient', icon: Blend, label: 'Gradient', shortcut: 'D' },
      { id: 'eyedropper', icon: Pipette, label: 'Eyedropper', shortcut: 'I' },
    ],
    [
      { id: 'crop', icon: Crop, label: 'Crop', shortcut: 'C' },
    ]
  ];

  function selectTool(tool: Tool) {
    currentTool.set(tool);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    
    for (const group of toolGroups) {
      const tool = group.find(t => t.shortcut?.toLowerCase() === e.key.toLowerCase());
      if (tool) {
        selectTool(tool.id);
        break;
      }
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="w-12 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-2 gap-0.5 overflow-y-auto">
  {#each toolGroups as group, groupIndex}
    {#each group as tool}
      {@const Icon = tool.icon}
      <button
        class={cn(
          'w-9 h-9 flex items-center justify-center rounded transition-colors',
          $currentTool === tool.id
            ? 'bg-blue-600 text-white'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
        )}
        onclick={() => selectTool(tool.id)}
        title="{tool.label} ({tool.shortcut})"
      >
        <Icon class="w-4 h-4" />
      </button>
    {/each}
    {#if groupIndex < toolGroups.length - 1}
      <div class="w-6 h-px bg-zinc-700 my-1"></div>
    {/if}
  {/each}

  <!-- Color Swatches -->
  <div class="mt-auto pt-2 flex flex-col items-center gap-1">
    <div class="relative w-8 h-8">
      <input
        type="color"
        bind:value={$fillColor}
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        title="Fill Color"
      />
      <div
        class="w-6 h-6 rounded border-2 border-white shadow absolute top-0 left-0"
        style="background: {$fillColor}"
      ></div>
      <input
        type="color"
        bind:value={$strokeColor}
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        title="Stroke Color"
        style="clip-path: polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)"
      />
      <div
        class="w-6 h-6 rounded border-2 border-zinc-600 absolute bottom-0 right-0"
        style="background: {$strokeColor}"
      ></div>
    </div>
  </div>
</div>
