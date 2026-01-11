import { writable, get } from 'svelte/store';

export interface Layer {
  id: string;
  name: string;
  type: 'image' | 'shape' | 'text' | 'path';
  visible: boolean;
  locked: boolean;
  opacity: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  data: LayerData;
}

export type LayerData = ImageData | ShapeData | TextData | PathData;

export interface ImageData {
  src: string;
}

export interface ShapeData {
  shape: 'rectangle' | 'circle' | 'rounded-rect' | 'triangle' | 'star' | 'polygon' | 'line';
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: number;
  points?: number;
}

export interface TextData {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: 'left' | 'center' | 'right';
}

export interface PathData {
  points: { x: number; y: number }[];
  stroke: string;
  strokeWidth: number;
  fill: string;
  closed: boolean;
}

export interface Guide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
}

export type Tool = 
  | 'select' 
  | 'move' 
  | 'rectangle' 
  | 'circle' 
  | 'rounded-rect'
  | 'triangle'
  | 'star'
  | 'line'
  | 'text' 
  | 'pen'
  | 'brush'
  | 'eraser'
  | 'eyedropper'
  | 'hand'
  | 'crop'
  | 'gradient'
  | 'bucket';

export const cursorMap: Record<Tool, string> = {
  select: 'default',
  move: 'move',
  rectangle: 'crosshair',
  circle: 'crosshair',
  'rounded-rect': 'crosshair',
  triangle: 'crosshair',
  star: 'crosshair',
  line: 'crosshair',
  text: 'text',
  pen: 'crosshair',
  brush: 'crosshair',
  eraser: 'crosshair',
  eyedropper: 'copy',
  hand: 'grab',
  crop: 'crosshair',
  gradient: 'crosshair',
  bucket: 'crosshair'
};

// Create default layer
function createDefaultLayer(): Layer {
  return {
    id: crypto.randomUUID(),
    name: 'Layer 1',
    type: 'shape',
    visible: true,
    locked: false,
    opacity: 100,
    x: 0,
    y: 0,
    width: 512,
    height: 512,
    rotation: 0,
    data: {
      shape: 'rectangle',
      fill: 'transparent',
      stroke: 'transparent',
      strokeWidth: 0
    }
  };
}

// Stores
export const layers = writable<Layer[]>([createDefaultLayer()]);
export const selectedLayerId = writable<string | null>(null);
export const currentTool = writable<Tool>('select');
export const canvasSize = writable({ width: 512, height: 512 });
export const zoom = writable(1);
export const fillColor = writable('#3b82f6');
export const strokeColor = writable('#1e40af');
export const strokeWidth = writable(2);
export const brushSize = writable(8);
export const guides = writable<Guide[]>([]);
export const showRulers = writable(true);
export const showGuides = writable(true);
export const snapToGuides = writable(true);
export const gridSize = writable(16);
export const showGrid = writable(false);

// History for undo/redo
interface HistoryState {
  layers: Layer[];
  selectedLayerId: string | null;
}
const history = writable<HistoryState[]>([]);
const historyIndex = writable(-1);
const maxHistory = 50;

export function saveHistory() {
  const currentLayers = get(layers);
  const currentSelected = get(selectedLayerId);
  const currentIndex = get(historyIndex);
  const currentHistory = get(history);
  
  // Remove future states if we're not at the end
  const newHistory = currentHistory.slice(0, currentIndex + 1);
  newHistory.push({
    layers: JSON.parse(JSON.stringify(currentLayers)),
    selectedLayerId: currentSelected
  });
  
  // Limit history size
  if (newHistory.length > maxHistory) {
    newHistory.shift();
  }
  
  history.set(newHistory);
  historyIndex.set(newHistory.length - 1);
}

export function undo() {
  const currentIndex = get(historyIndex);
  if (currentIndex > 0) {
    historyIndex.set(currentIndex - 1);
    const state = get(history)[currentIndex - 1];
    layers.set(JSON.parse(JSON.stringify(state.layers)));
    selectedLayerId.set(state.selectedLayerId);
  }
}

export function redo() {
  const currentIndex = get(historyIndex);
  const currentHistory = get(history);
  if (currentIndex < currentHistory.length - 1) {
    historyIndex.set(currentIndex + 1);
    const state = currentHistory[currentIndex + 1];
    layers.set(JSON.parse(JSON.stringify(state.layers)));
    selectedLayerId.set(state.selectedLayerId);
  }
}

// Actions
export function newFile() {
  layers.set([createDefaultLayer()]);
  selectedLayerId.set(null);
  guides.set([]);
  history.set([]);
  historyIndex.set(-1);
  saveHistory();
}

export function addLayer(type: Layer['type'] = 'shape') {
  const currentLayers = get(layers);
  const newLayer: Layer = {
    id: crypto.randomUUID(),
    name: `Layer ${currentLayers.length + 1}`,
    type,
    visible: true,
    locked: false,
    opacity: 100,
    x: 0,
    y: 0,
    width: get(canvasSize).width,
    height: get(canvasSize).height,
    rotation: 0,
    data: type === 'text' 
      ? { text: 'Text', fontFamily: 'Arial', fontSize: 48, fontWeight: 400, color: '#000000', align: 'left' }
      : type === 'path'
      ? { points: [], stroke: get(strokeColor), strokeWidth: get(brushSize), fill: 'transparent', closed: false }
      : { shape: 'rectangle', fill: 'transparent', stroke: 'transparent', strokeWidth: 0 }
  };
  layers.update(ls => [newLayer, ...ls]);
  selectedLayerId.set(newLayer.id);
  saveHistory();
}

export function deleteLayer(id: string) {
  const currentLayers = get(layers);
  if (currentLayers.length <= 1) return; // Keep at least one layer
  
  layers.update(ls => ls.filter(l => l.id !== id));
  selectedLayerId.update(sel => sel === id ? null : sel);
  saveHistory();
}

export function duplicateLayer(id: string) {
  layers.update(ls => {
    const layer = ls.find(l => l.id === id);
    if (layer) {
      const newLayer = {
        ...JSON.parse(JSON.stringify(layer)),
        id: crypto.randomUUID(),
        name: `${layer.name} copy`,
        x: layer.x + 10,
        y: layer.y + 10
      };
      const idx = ls.findIndex(l => l.id === id);
      ls.splice(idx, 0, newLayer);
    }
    return [...ls];
  });
  saveHistory();
}

export function moveLayerOrder(fromIndex: number, toIndex: number) {
  layers.update(ls => {
    const [removed] = ls.splice(fromIndex, 1);
    ls.splice(toIndex, 0, removed);
    return [...ls];
  });
  saveHistory();
}

export function addGuide(type: 'horizontal' | 'vertical', position: number) {
  guides.update(gs => [...gs, { id: crypto.randomUUID(), type, position }]);
}

export function removeGuide(id: string) {
  guides.update(gs => gs.filter(g => g.id !== id));
}

// Initialize history
saveHistory();
