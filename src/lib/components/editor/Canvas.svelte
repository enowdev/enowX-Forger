<script lang="ts">
  import { 
    layers, selectedLayerId, currentTool, canvasSize, zoom,
    cursorMap, strokeColor, brushSize, fillColor, guides,
    showRulers, showGuides, addLayer, saveHistory, addGuide,
    type Layer, type ShapeData, type TextData, type PathData
  } from '$lib/stores/editor';
  import { cn } from '$lib/utils';
  import { ZoomIn, ZoomOut, Maximize2, Ruler, Grid3x3, Magnet } from 'lucide-svelte';

  let canvasRef: HTMLDivElement;
  let containerRef: HTMLDivElement;
  let drawingPath = $state<{ x: number; y: number }[]>([]);
  let isCurrentlyDrawing = $state(false);
  let startPos = $state<{ x: number; y: number } | null>(null);
  let tempShape = $state<{ x: number; y: number; width: number; height: number } | null>(null);
  let isPanning = $state(false);
  let panStart = $state<{ x: number; y: number; scrollX: number; scrollY: number } | null>(null);

  function getCanvasCoords(e: MouseEvent): { x: number; y: number } {
    if (!canvasRef) return { x: 0, y: 0 };
    const rect = canvasRef.getBoundingClientRect();
    const scale = $zoom;
    return {
      x: Math.round((e.clientX - rect.left) / scale),
      y: Math.round((e.clientY - rect.top) / scale)
    };
  }

  function handleMouseDown(e: MouseEvent) {
    if (e.button === 1 || ($currentTool === 'hand' && e.button === 0)) {
      // Middle click or hand tool - start panning
      isPanning = true;
      panStart = {
        x: e.clientX,
        y: e.clientY,
        scrollX: containerRef?.scrollLeft || 0,
        scrollY: containerRef?.scrollTop || 0
      };
      return;
    }

    const coords = getCanvasCoords(e);
    
    if ($currentTool === 'brush' || $currentTool === 'pen') {
      isCurrentlyDrawing = true;
      drawingPath = [coords];
    } else if (['rectangle', 'circle', 'rounded-rect', 'triangle', 'star', 'line'].includes($currentTool)) {
      isCurrentlyDrawing = true;
      startPos = coords;
      tempShape = { x: coords.x, y: coords.y, width: 0, height: 0 };
    } else if ($currentTool === 'text') {
      // Add text at click position
      const newLayer: Layer = {
        id: crypto.randomUUID(),
        name: `Text ${$layers.length + 1}`,
        type: 'text',
        visible: true,
        locked: false,
        opacity: 100,
        x: coords.x,
        y: coords.y,
        width: 200,
        height: 60,
        rotation: 0,
        data: {
          text: 'Text',
          fontFamily: 'Arial',
          fontSize: 48,
          fontWeight: 400,
          color: $fillColor,
          align: 'left'
        }
      };
      layers.update(ls => [newLayer, ...ls]);
      selectedLayerId.set(newLayer.id);
      saveHistory();
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (isPanning && panStart && containerRef) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      containerRef.scrollLeft = panStart.scrollX - dx;
      containerRef.scrollTop = panStart.scrollY - dy;
      return;
    }

    if (!isCurrentlyDrawing) return;
    
    const coords = getCanvasCoords(e);
    
    if ($currentTool === 'brush' || $currentTool === 'pen') {
      drawingPath = [...drawingPath, coords];
    } else if (startPos) {
      const shiftPressed = e.shiftKey;
      let width = coords.x - startPos.x;
      let height = coords.y - startPos.y;
      
      // Hold shift for square/circle
      if (shiftPressed) {
        const size = Math.max(Math.abs(width), Math.abs(height));
        width = width < 0 ? -size : size;
        height = height < 0 ? -size : size;
      }
      
      tempShape = {
        x: width < 0 ? startPos.x + width : startPos.x,
        y: height < 0 ? startPos.y + height : startPos.y,
        width: Math.abs(width),
        height: Math.abs(height)
      };
    }
  }

  function handleMouseUp() {
    if (isPanning) {
      isPanning = false;
      panStart = null;
      return;
    }

    if (!isCurrentlyDrawing) return;
    
    if (($currentTool === 'brush' || $currentTool === 'pen') && drawingPath.length > 1) {
      const newLayer: Layer = {
        id: crypto.randomUUID(),
        name: `Path ${$layers.length + 1}`,
        type: 'path',
        visible: true,
        locked: false,
        opacity: 100,
        x: 0,
        y: 0,
        width: $canvasSize.width,
        height: $canvasSize.height,
        rotation: 0,
        data: {
          points: [...drawingPath],
          stroke: $strokeColor,
          strokeWidth: $brushSize,
          fill: 'transparent',
          closed: false
        }
      };
      layers.update(ls => [newLayer, ...ls]);
      selectedLayerId.set(newLayer.id);
      saveHistory();
    } else if (tempShape && tempShape.width > 2 && tempShape.height > 2) {
      const newLayer: Layer = {
        id: crypto.randomUUID(),
        name: `${$currentTool} ${$layers.length + 1}`,
        type: 'shape',
        visible: true,
        locked: false,
        opacity: 100,
        x: tempShape.x,
        y: tempShape.y,
        width: tempShape.width,
        height: tempShape.height,
        rotation: 0,
        data: {
          shape: $currentTool as ShapeData['shape'],
          fill: $fillColor,
          stroke: $strokeColor,
          strokeWidth: 2,
          cornerRadius: 16
        }
      };
      layers.update(ls => [newLayer, ...ls]);
      selectedLayerId.set(newLayer.id);
      saveHistory();
    }
    
    isCurrentlyDrawing = false;
    drawingPath = [];
    startPos = null;
    tempShape = null;
  }

  function handleCanvasClick(e: MouseEvent) {
    if ($currentTool !== 'select') return;
    
    const target = e.target as HTMLElement;
    if (target.dataset.layerId) {
      selectedLayerId.set(target.dataset.layerId);
    } else if (target.classList.contains('canvas-bg')) {
      selectedLayerId.set(null);
    }
  }

  function handleWheel(e: WheelEvent) {
    if (e.ctrlKey) {
      e.preventDefault();
      // Ctrl + Scroll = Zoom
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      zoom.update(z => Math.max(0.1, Math.min(4, z + delta)));
    } else if (e.altKey) {
      e.preventDefault();
      // Alt + Scroll = Brush size
      const delta = e.deltaY > 0 ? -1 : 1;
      brushSize.update(s => Math.max(1, Math.min(100, s + delta)));
    }
  }

  function zoomIn() {
    zoom.update(z => Math.min(z + 0.25, 4));
  }

  function zoomOut() {
    zoom.update(z => Math.max(z - 0.25, 0.1));
  }

  function resetZoom() {
    zoom.set(1);
  }

  function pathToSvg(points: { x: number; y: number }[]): string {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  }

  function getCursor(): string {
    if (isPanning) return 'grabbing';
    if (isCurrentlyDrawing && $currentTool === 'hand') return 'grabbing';
    return cursorMap[$currentTool] || 'default';
  }

  function renderShape(layer: Layer): string {
    const data = layer.data as ShapeData;
    let borderRadius = '';
    if (data.shape === 'circle') borderRadius = 'border-radius: 50%;';
    else if (data.shape === 'rounded-rect') borderRadius = `border-radius: ${data.cornerRadius || 16}px;`;
    
    return `
      position: absolute;
      left: ${layer.x}px;
      top: ${layer.y}px;
      width: ${layer.width}px;
      height: ${layer.height}px;
      transform: rotate(${layer.rotation}deg);
      opacity: ${layer.opacity / 100};
      background: ${data.fill};
      border: ${data.strokeWidth}px solid ${data.stroke};
      ${borderRadius}
      box-sizing: border-box;
    `;
  }

  // Ruler marks
  function getRulerMarks(size: number, step: number = 50): number[] {
    const marks = [];
    for (let i = 0; i <= size; i += step) {
      marks.push(i);
    }
    return marks;
  }
</script>

<svelte:window onwheel={handleWheel} />

<div class="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
  <!-- Top Bar -->
  <div class="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-800">
    <div class="flex items-center gap-2">
      <button
        class="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
        onclick={zoomOut}
        title="Zoom Out (-)"
      >
        <ZoomOut class="w-4 h-4" />
      </button>
      <span class="text-xs text-zinc-400 w-12 text-center">{Math.round($zoom * 100)}%</span>
      <button
        class="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
        onclick={zoomIn}
        title="Zoom In (+)"
      >
        <ZoomIn class="w-4 h-4" />
      </button>
      <button
        class="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
        onclick={resetZoom}
        title="Reset Zoom (0)"
      >
        <Maximize2 class="w-4 h-4" />
      </button>
      <div class="w-px h-4 bg-zinc-700 mx-1"></div>
      <button
        class={cn('p-1.5 rounded transition-colors', $showRulers ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-400 hover:bg-zinc-800')}
        onclick={() => showRulers.update(v => !v)}
        title="Toggle Rulers"
      >
        <Ruler class="w-4 h-4" />
      </button>
      <button
        class={cn('p-1.5 rounded transition-colors', $showGuides ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-400 hover:bg-zinc-800')}
        onclick={() => showGuides.update(v => !v)}
        title="Toggle Guides"
      >
        <Grid3x3 class="w-4 h-4" />
      </button>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-xs text-zinc-500">{$canvasSize.width} x {$canvasSize.height}</span>
      <span class="text-xs text-zinc-600">|</span>
      <span class="text-xs text-zinc-500">Brush: {$brushSize}px</span>
    </div>
  </div>

  <!-- Canvas with Rulers -->
  <div class="flex-1 flex overflow-hidden">
    {#if $showRulers}
      <!-- Top Ruler -->
      <div class="flex flex-col flex-1">
        <div class="flex">
          <div class="w-5 h-5 bg-zinc-800 border-r border-b border-zinc-700"></div>
          <div class="flex-1 h-5 bg-zinc-800 border-b border-zinc-700 overflow-hidden relative">
            {#each getRulerMarks($canvasSize.width) as mark}
              <div 
                class="absolute top-0 h-full flex flex-col justify-end"
                style="left: {mark * $zoom + 40}px"
              >
                <span class="text-[8px] text-zinc-500">{mark}</span>
                <div class="w-px h-2 bg-zinc-600"></div>
              </div>
            {/each}
          </div>
        </div>
        <div class="flex flex-1 overflow-hidden">
          <!-- Left Ruler -->
          <div class="w-5 bg-zinc-800 border-r border-zinc-700 overflow-hidden relative">
            {#each getRulerMarks($canvasSize.height) as mark}
              <div 
                class="absolute left-0 w-full flex items-center justify-end pr-0.5"
                style="top: {mark * $zoom + 40}px"
              >
                <span class="text-[8px] text-zinc-500 rotate-[-90deg] origin-right">{mark}</span>
              </div>
            {/each}
          </div>
          <!-- Canvas Container -->
          <div 
            bind:this={containerRef}
            class="flex-1 overflow-auto flex items-center justify-center p-8 bg-zinc-950"
          >
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              bind:this={canvasRef}
              class="canvas-bg relative shadow-2xl"
              style="
                width: {$canvasSize.width}px;
                height: {$canvasSize.height}px;
                transform: scale({$zoom});
                transform-origin: center;
                cursor: {getCursor()};
                background-color: white;
                background-image: 
                  linear-gradient(45deg, #e5e5e5 25%, transparent 25%),
                  linear-gradient(-45deg, #e5e5e5 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #e5e5e5 75%),
                  linear-gradient(-45deg, transparent 75%, #e5e5e5 75%);
                background-size: 20px 20px;
                background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
              "
              onclick={handleCanvasClick}
              onmousedown={handleMouseDown}
              onmousemove={handleMouseMove}
              onmouseup={handleMouseUp}
              onmouseleave={handleMouseUp}
            >
              <!-- Guides -->
              {#if $showGuides}
                {#each $guides as guide}
                  {#if guide.type === 'horizontal'}
                    <div 
                      class="absolute left-0 right-0 h-px bg-cyan-500 pointer-events-none"
                      style="top: {guide.position}px"
                    ></div>
                  {:else}
                    <div 
                      class="absolute top-0 bottom-0 w-px bg-cyan-500 pointer-events-none"
                      style="left: {guide.position}px"
                    ></div>
                  {/if}
                {/each}
              {/if}

              <!-- Render layers -->
              {#each [...$layers].reverse() as layer (layer.id)}
                {#if layer.visible}
                  {#if layer.type === 'path'}
                    {@const pathData = layer.data as PathData}
                    <svg
                      class="absolute inset-0 pointer-events-none"
                      width={$canvasSize.width}
                      height={$canvasSize.height}
                      style="opacity: {layer.opacity / 100}"
                    >
                      <path
                        d={pathToSvg(pathData.points)}
                        fill={pathData.fill}
                        stroke={pathData.stroke}
                        stroke-width={pathData.strokeWidth}
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  {:else if layer.type === 'shape'}
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                      data-layer-id={layer.id}
                      style={renderShape(layer)}
                      class={$selectedLayerId === layer.id ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                      onclick={(e) => { e.stopPropagation(); selectedLayerId.set(layer.id); }}
                    ></div>
                  {:else if layer.type === 'text'}
                    {@const textData = layer.data as TextData}
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                      data-layer-id={layer.id}
                      style="
                        position: absolute;
                        left: {layer.x}px;
                        top: {layer.y}px;
                        transform: rotate({layer.rotation}deg);
                        opacity: {layer.opacity / 100};
                        color: {textData.color};
                        font-size: {textData.fontSize}px;
                        font-weight: {textData.fontWeight};
                        font-family: {textData.fontFamily};
                        white-space: pre-wrap;
                      "
                      class={$selectedLayerId === layer.id ? 'ring-2 ring-blue-500' : ''}
                      onclick={(e) => { e.stopPropagation(); selectedLayerId.set(layer.id); }}
                    >
                      {textData.text}
                    </div>
                  {:else if layer.type === 'image'}
                    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                    <img
                      data-layer-id={layer.id}
                      src={(layer.data as any).src}
                      alt={layer.name}
                      style="
                        position: absolute;
                        left: {layer.x}px;
                        top: {layer.y}px;
                        width: {layer.width}px;
                        height: {layer.height}px;
                        transform: rotate({layer.rotation}deg);
                        opacity: {layer.opacity / 100};
                        object-fit: contain;
                      "
                      class={$selectedLayerId === layer.id ? 'ring-2 ring-blue-500' : ''}
                      onclick={(e) => { e.stopPropagation(); selectedLayerId.set(layer.id); }}
                    />
                  {/if}
                {/if}
              {/each}

              <!-- Temp shape preview -->
              {#if tempShape && tempShape.width > 0 && tempShape.height > 0}
                <div
                  class="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
                  style="
                    left: {tempShape.x}px;
                    top: {tempShape.y}px;
                    width: {tempShape.width}px;
                    height: {tempShape.height}px;
                    {$currentTool === 'circle' ? 'border-radius: 50%;' : ''}
                    {$currentTool === 'rounded-rect' ? 'border-radius: 16px;' : ''}
                  "
                ></div>
              {/if}

              <!-- Drawing path preview -->
              {#if drawingPath.length > 1}
                <svg
                  class="absolute inset-0 pointer-events-none"
                  width={$canvasSize.width}
                  height={$canvasSize.height}
                >
                  <path
                    d={pathToSvg(drawingPath)}
                    fill="none"
                    stroke={$strokeColor}
                    stroke-width={$brushSize}
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {:else}
      <!-- Canvas without rulers -->
      <div 
        bind:this={containerRef}
        class="flex-1 overflow-auto flex items-center justify-center p-8"
      >
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          bind:this={canvasRef}
          class="canvas-bg relative shadow-2xl"
          style="
            width: {$canvasSize.width}px;
            height: {$canvasSize.height}px;
            transform: scale({$zoom});
            transform-origin: center;
            cursor: {getCursor()};
            background-color: white;
            background-image: 
              linear-gradient(45deg, #e5e5e5 25%, transparent 25%),
              linear-gradient(-45deg, #e5e5e5 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #e5e5e5 75%),
              linear-gradient(-45deg, transparent 75%, #e5e5e5 75%);
            background-size: 20px 20px;
            background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          "
          onclick={handleCanvasClick}
          onmousedown={handleMouseDown}
          onmousemove={handleMouseMove}
          onmouseup={handleMouseUp}
          onmouseleave={handleMouseUp}
        >
          <!-- Same content as above -->
          {#if $showGuides}
            {#each $guides as guide}
              {#if guide.type === 'horizontal'}
                <div class="absolute left-0 right-0 h-px bg-cyan-500 pointer-events-none" style="top: {guide.position}px"></div>
              {:else}
                <div class="absolute top-0 bottom-0 w-px bg-cyan-500 pointer-events-none" style="left: {guide.position}px"></div>
              {/if}
            {/each}
          {/if}

          {#each [...$layers].reverse() as layer (layer.id)}
            {#if layer.visible}
              {#if layer.type === 'path'}
                {@const pathData = layer.data as PathData}
                <svg class="absolute inset-0 pointer-events-none" width={$canvasSize.width} height={$canvasSize.height} style="opacity: {layer.opacity / 100}">
                  <path d={pathToSvg(pathData.points)} fill={pathData.fill} stroke={pathData.stroke} stroke-width={pathData.strokeWidth} stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              {:else if layer.type === 'shape'}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div data-layer-id={layer.id} style={renderShape(layer)} class={$selectedLayerId === layer.id ? 'ring-2 ring-blue-500 ring-offset-1' : ''} onclick={(e) => { e.stopPropagation(); selectedLayerId.set(layer.id); }}></div>
              {:else if layer.type === 'text'}
                {@const textData = layer.data as TextData}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div data-layer-id={layer.id} style="position: absolute; left: {layer.x}px; top: {layer.y}px; transform: rotate({layer.rotation}deg); opacity: {layer.opacity / 100}; color: {textData.color}; font-size: {textData.fontSize}px; font-weight: {textData.fontWeight}; font-family: {textData.fontFamily}; white-space: pre-wrap;" class={$selectedLayerId === layer.id ? 'ring-2 ring-blue-500' : ''} onclick={(e) => { e.stopPropagation(); selectedLayerId.set(layer.id); }}>{textData.text}</div>
              {:else if layer.type === 'image'}
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <img data-layer-id={layer.id} src={(layer.data as any).src} alt={layer.name} style="position: absolute; left: {layer.x}px; top: {layer.y}px; width: {layer.width}px; height: {layer.height}px; transform: rotate({layer.rotation}deg); opacity: {layer.opacity / 100}; object-fit: contain;" class={$selectedLayerId === layer.id ? 'ring-2 ring-blue-500' : ''} onclick={(e) => { e.stopPropagation(); selectedLayerId.set(layer.id); }} />
              {/if}
            {/if}
          {/each}

          {#if tempShape && tempShape.width > 0 && tempShape.height > 0}
            <div class="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none" style="left: {tempShape.x}px; top: {tempShape.y}px; width: {tempShape.width}px; height: {tempShape.height}px; {$currentTool === 'circle' ? 'border-radius: 50%;' : ''} {$currentTool === 'rounded-rect' ? 'border-radius: 16px;' : ''}"></div>
          {/if}

          {#if drawingPath.length > 1}
            <svg class="absolute inset-0 pointer-events-none" width={$canvasSize.width} height={$canvasSize.height}>
              <path d={pathToSvg(drawingPath)} fill="none" stroke={$strokeColor} stroke-width={$brushSize} stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
