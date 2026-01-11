import { writable, get } from 'svelte/store';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type { IconSize } from '$lib/data/templates';

export interface GenerateRequest {
  image_data: string;
  output_path: string;
  icons: IconSize[];
  template_name: string;
}

export interface FailedIcon {
  name: string;
  error: string;
}

export interface GenerateResult {
  success: boolean;
  generated: string[];
  failed: FailedIcon[];
  output_path: string;
  template_name: string;
}

export interface ProgressEvent {
  template_name: string;
  current: number;
  total: number;
  current_icon: string;
}

export interface GenerateProgress {
  isGenerating: boolean;
  currentTemplate: string;
  currentIcon: string;
  current: number;
  total: number;
  completedTemplates: string[];
  results: GenerateResult[];
}

const initialProgress: GenerateProgress = {
  isGenerating: false,
  currentTemplate: '',
  currentIcon: '',
  current: 0,
  total: 0,
  completedTemplates: [],
  results: []
};

export const generateProgress = writable<GenerateProgress>(initialProgress);
export const lastResult = writable<GenerateResult | null>(null);

let progressUnlisten: (() => void) | null = null;
let completeUnlisten: (() => void) | null = null;

export async function setupListeners() {
  // Listen for progress events
  progressUnlisten = await listen<ProgressEvent>('generate-progress', (event) => {
    generateProgress.update(p => ({
      ...p,
      currentTemplate: event.payload.template_name,
      currentIcon: event.payload.current_icon,
      current: event.payload.current,
      total: event.payload.total
    }));
  });

  // Listen for completion events
  completeUnlisten = await listen<GenerateResult>('generate-complete', (event) => {
    generateProgress.update(p => ({
      ...p,
      completedTemplates: [...p.completedTemplates, event.payload.template_name],
      results: [...p.results, event.payload]
    }));
  });
}

export function cleanupListeners() {
  if (progressUnlisten) progressUnlisten();
  if (completeUnlisten) completeUnlisten();
}

export async function generateIcons(request: GenerateRequest): Promise<GenerateResult> {
  const result = await invoke<GenerateResult>('generate_icons', { request });
  return result;
}

export async function generateAllTemplates(
  imageData: string,
  outputPath: string,
  templates: { id: string; icons: IconSize[] }[]
): Promise<GenerateResult[]> {
  // Reset progress
  generateProgress.set({
    isGenerating: true,
    currentTemplate: '',
    currentIcon: '',
    current: 0,
    total: 0,
    completedTemplates: [],
    results: []
  });

  const results: GenerateResult[] = [];

  for (const template of templates) {
    const result = await generateIcons({
      image_data: imageData,
      output_path: outputPath,
      icons: template.icons,
      template_name: template.id
    });
    results.push(result);
  }

  // Mark as complete
  generateProgress.update(p => ({
    ...p,
    isGenerating: false
  }));

  // Combine results for lastResult
  const combinedResult: GenerateResult = {
    success: results.every(r => r.success),
    generated: results.flatMap(r => r.generated),
    failed: results.flatMap(r => r.failed),
    output_path: outputPath,
    template_name: templates.map(t => t.id).join(', ')
  };

  lastResult.set(combinedResult);
  return results;
}

export async function getDefaultOutputPath(): Promise<string> {
  return invoke<string>('get_default_output_path');
}

export async function openFolder(path: string): Promise<void> {
  await invoke('open_folder', { path });
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
