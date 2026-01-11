import { writable } from 'svelte/store';
import { invoke } from '@tauri-apps/api/core';
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
}

export const isGenerating = writable(false);
export const lastResult = writable<GenerateResult | null>(null);

export async function generateIcons(request: GenerateRequest): Promise<GenerateResult> {
  isGenerating.set(true);
  try {
    const result = await invoke<GenerateResult>('generate_icons', { request });
    lastResult.set(result);
    return result;
  } finally {
    isGenerating.set(false);
  }
}

export async function getDefaultOutputPath(): Promise<string> {
  return invoke<string>('get_default_output_path');
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
