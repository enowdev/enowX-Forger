import { writable } from 'svelte/store';

export interface AppSettings {
  // Download settings
  defaultIconFormat: 'svg' | 'png' | 'webp';
  defaultIconSize: number;
  showDownloadPrompt: boolean;
  downloadPath: string; // Will be used with Tauri backend
  
  // Generate settings
  generateOutputPath: string; // Will be used with Tauri backend
  
  // Editor settings
  defaultCanvasSize: number;
  showRulers: boolean;
  showGuides: boolean;
  snapToGuides: boolean;
  
  // UI settings
  theme: 'dark' | 'light';
}

const defaultSettings: AppSettings = {
  defaultIconFormat: 'svg',
  defaultIconSize: 64,
  showDownloadPrompt: true,
  downloadPath: '',
  generateOutputPath: '',
  defaultCanvasSize: 512,
  showRulers: true,
  showGuides: true,
  snapToGuides: true,
  theme: 'dark'
};

function createSettingsStore() {
  // Load from localStorage
  let initial = defaultSettings;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('app-settings');
    if (saved) {
      try {
        initial = { ...defaultSettings, ...JSON.parse(saved) };
      } catch {}
    }
  }

  const { subscribe, set, update } = writable<AppSettings>(initial);

  return {
    subscribe,
    set: (value: AppSettings) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('app-settings', JSON.stringify(value));
      }
      set(value);
    },
    update: (fn: (settings: AppSettings) => AppSettings) => {
      update(settings => {
        const newSettings = fn(settings);
        if (typeof window !== 'undefined') {
          localStorage.setItem('app-settings', JSON.stringify(newSettings));
        }
        return newSettings;
      });
    },
    reset: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('app-settings');
      }
      set(defaultSettings);
    }
  };
}

export const settings = createSettingsStore();
