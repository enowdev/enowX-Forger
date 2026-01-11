import { writable, get } from 'svelte/store';
import { check, type Update } from '@tauri-apps/plugin-updater';
import { invoke } from '@tauri-apps/api/core';
import { relaunch } from '@tauri-apps/plugin-process';

export interface ReleaseInfo {
  version: string;
  date: string;
  notes: string;
  forced: boolean;
}

export interface UpdateState {
  checking: boolean;
  available: boolean;
  downloading: boolean;
  progress: number;
  currentVersion: string;
  newVersion: string;
  releaseNotes: string;
  releaseDate: string;
  forced: boolean;
  error: string | null;
  update: Update | null;
}

const initialState: UpdateState = {
  checking: false,
  available: false,
  downloading: false,
  progress: 0,
  currentVersion: '0.1.0',
  newVersion: '',
  releaseNotes: '',
  releaseDate: '',
  forced: false,
  error: null,
  update: null
};

export const updateState = writable<UpdateState>(initialState);

// Parse release notes to check if forced update
function parseReleaseNotes(notes: string): { forced: boolean; cleanNotes: string } {
  const forcedMatch = notes.match(/<!--\s*UPDATE_TYPE:\s*forced\s*-->/i);
  const cleanNotes = notes.replace(/<!--\s*UPDATE_TYPE:\s*\w+\s*-->/gi, '').trim();
  return {
    forced: !!forcedMatch,
    cleanNotes
  };
}

// Check for updates
export async function checkForUpdates(): Promise<boolean> {
  updateState.update(s => ({ ...s, checking: true, error: null }));
  
  try {
    // Get current version
    const currentVersion = await invoke<string>('get_current_version');
    updateState.update(s => ({ ...s, currentVersion }));
    
    const update = await check();
    
    if (update) {
      const { forced, cleanNotes } = parseReleaseNotes(update.body || '');
      
      updateState.update(s => ({
        ...s,
        checking: false,
        available: true,
        newVersion: update.version,
        releaseNotes: cleanNotes,
        releaseDate: update.date || new Date().toISOString(),
        forced,
        update
      }));
      return true;
    } else {
      updateState.update(s => ({ ...s, checking: false, available: false }));
      return false;
    }
  } catch (error) {
    updateState.update(s => ({
      ...s,
      checking: false,
      error: error instanceof Error ? error.message : 'Failed to check for updates'
    }));
    return false;
  }
}

// Download and install update
export async function downloadAndInstall(): Promise<void> {
  const state = get(updateState);
  if (!state.update) return;
  
  updateState.update(s => ({ ...s, downloading: true, progress: 0 }));
  
  try {
    let downloaded = 0;
    let contentLength = 0;
    
    await state.update.downloadAndInstall((event) => {
      switch (event.event) {
        case 'Started':
          contentLength = event.data.contentLength || 0;
          break;
        case 'Progress':
          downloaded += event.data.chunkLength;
          const progress = contentLength > 0 ? Math.round((downloaded / contentLength) * 100) : 0;
          updateState.update(s => ({ ...s, progress }));
          break;
        case 'Finished':
          updateState.update(s => ({ ...s, progress: 100 }));
          break;
      }
    });
    
    // Relaunch app after update
    await relaunch();
  } catch (error) {
    updateState.update(s => ({
      ...s,
      downloading: false,
      error: error instanceof Error ? error.message : 'Failed to install update'
    }));
  }
}

// Dismiss update (only for non-forced)
export function dismissUpdate(): void {
  const state = get(updateState);
  if (!state.forced) {
    updateState.update(s => ({ ...s, available: false }));
  }
}

// Fetch version history from GitHub
export async function fetchVersionHistory(): Promise<ReleaseInfo[]> {
  try {
    const response = await fetch('https://api.github.com/repos/enowdev/enowX-Forger/releases');
    const releases = await response.json();
    
    return releases.slice(0, 10).map((release: any) => {
      const { forced, cleanNotes } = parseReleaseNotes(release.body || '');
      return {
        version: release.tag_name.replace('v', ''),
        date: release.published_at,
        notes: cleanNotes,
        forced
      };
    });
  } catch {
    return [];
  }
}
