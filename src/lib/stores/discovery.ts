import { writable, get } from 'svelte/store';
import { writeFile, mkdir, exists } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { settings } from './settings';

export interface IconCollection {
  prefix: string;
  title: string;
  total: number;
  author?: {
    name: string;
    url?: string;
  };
  license?: {
    title: string;
    spdx?: string;
    url?: string;
  };
  samples?: string[];
  category?: string;
  palette?: boolean;
}

export interface FavoriteIcon {
  prefix: string;
  name: string;
  addedAt: number;
}

export interface FavoriteCollection {
  prefix: string;
  title: string;
  addedAt: number;
}

// Stores
export const collections = writable<IconCollection[]>([]);
export const selectedCollection = writable<string | null>(null);
export const collectionIcons = writable<string[]>([]);
export const searchQuery = writable('');
export const searchResults = writable<{ prefix: string; name: string }[]>([]);
export const favorites = writable<FavoriteIcon[]>([]);
export const favoriteCollections = writable<FavoriteCollection[]>([]);
export const isLoading = writable(false);

// Cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

// Load favorites from localStorage
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('iconify-favorites');
  if (saved) {
    try {
      favorites.set(JSON.parse(saved));
    } catch {}
  }
  
  const savedCollections = localStorage.getItem('iconify-favorite-collections');
  if (savedCollections) {
    try {
      favoriteCollections.set(JSON.parse(savedCollections));
    } catch {}
  }
}

// Save favorites to localStorage
favorites.subscribe(value => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('iconify-favorites', JSON.stringify(value));
  }
});

favoriteCollections.subscribe(value => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('iconify-favorite-collections', JSON.stringify(value));
  }
});

export function addFavorite(prefix: string, name: string) {
  favorites.update(favs => {
    if (favs.some(f => f.prefix === prefix && f.name === name)) return favs;
    return [...favs, { prefix, name, addedAt: Date.now() }];
  });
}

export function removeFavorite(prefix: string, name: string) {
  favorites.update(favs => favs.filter(f => !(f.prefix === prefix && f.name === name)));
}

export function addFavoriteCollection(prefix: string, title: string) {
  favoriteCollections.update(favs => {
    if (favs.some(f => f.prefix === prefix)) return favs;
    return [...favs, { prefix, title, addedAt: Date.now() }];
  });
}

export function removeFavoriteCollection(prefix: string) {
  favoriteCollections.update(favs => favs.filter(f => f.prefix !== prefix));
}

export function isFavoriteCollection(prefix: string): boolean {
  let result = false;
  favoriteCollections.subscribe(favs => {
    result = favs.some(f => f.prefix === prefix);
  })();
  return result;
}

// API Functions
const API_BASE = 'https://api.iconify.design';

export async function fetchCollections(): Promise<void> {
  // Check cache first
  const cached = getCached<IconCollection[]>('collections');
  if (cached) {
    collections.set(cached);
    return;
  }

  isLoading.set(true);
  try {
    const res = await fetch(`${API_BASE}/collections`);
    const data = await res.json();
    
    const collectionList: IconCollection[] = Object.entries(data).map(([prefix, info]: [string, any]) => ({
      prefix,
      title: info.name || info.title || prefix,
      total: info.total || 0,
      author: info.author,
      license: info.license,
      samples: info.samples,
      category: info.category,
      palette: info.palette
    }));
    
    collectionList.sort((a, b) => b.total - a.total);
    collections.set(collectionList);
    setCache('collections', collectionList);
  } catch (error) {
    console.error('Failed to fetch collections:', error);
  } finally {
    isLoading.set(false);
  }
}

export async function fetchCollectionIcons(prefix: string): Promise<void> {
  // Check cache first
  const cacheKey = `collection-${prefix}`;
  const cached = getCached<string[]>(cacheKey);
  if (cached) {
    selectedCollection.set(prefix);
    collectionIcons.set(cached);
    return;
  }

  isLoading.set(true);
  selectedCollection.set(prefix);
  try {
    const res = await fetch(`${API_BASE}/collection?prefix=${prefix}`);
    const data = await res.json();
    
    let icons: string[] = [];
    if (data.uncategorized) {
      icons = data.uncategorized;
    } else if (data.categories) {
      Object.values(data.categories).forEach((cat: any) => {
        icons = icons.concat(cat);
      });
    }
    
    collectionIcons.set(icons);
    setCache(cacheKey, icons);
  } catch (error) {
    console.error('Failed to fetch collection icons:', error);
    collectionIcons.set([]);
  } finally {
    isLoading.set(false);
  }
}

export async function fetchAllCollectionIcons(prefix: string): Promise<string[]> {
  const cacheKey = `collection-full-${prefix}`;
  const cached = getCached<string[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${API_BASE}/collection?prefix=${prefix}`);
    const data = await res.json();
    
    let icons: string[] = [];
    if (data.uncategorized) {
      icons = data.uncategorized;
    } else if (data.categories) {
      Object.values(data.categories).forEach((cat: any) => {
        icons = icons.concat(cat);
      });
    }
    
    setCache(cacheKey, icons);
    return icons;
  } catch (error) {
    console.error('Failed to fetch all collection icons:', error);
    return [];
  }
}

// Live search with debounce built-in
let searchAbortController: AbortController | null = null;

export async function searchIcons(query: string, prefixFilter?: string): Promise<void> {
  // Cancel previous request
  if (searchAbortController) {
    searchAbortController.abort();
  }

  if (!query.trim()) {
    searchResults.set([]);
    return;
  }

  // Check cache with prefix
  const cacheKey = `search-${prefixFilter || 'all'}-${query}`;
  const cached = getCached<{ prefix: string; name: string }[]>(cacheKey);
  if (cached) {
    searchResults.set(cached);
    return;
  }

  searchAbortController = new AbortController();
  isLoading.set(true);
  
  try {
    let url = `${API_BASE}/search?query=${encodeURIComponent(query)}&limit=100`;
    if (prefixFilter) {
      url += `&prefix=${prefixFilter}`;
    }
    
    const res = await fetch(url, { signal: searchAbortController.signal });
    const data = await res.json();
    
    const results = data.icons?.map((icon: string) => {
      const [prefix, ...nameParts] = icon.split(':');
      return { prefix, name: nameParts.join(':') };
    }) || [];
    
    searchResults.set(results);
    setCache(cacheKey, results);
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      console.error('Failed to search icons:', error);
      searchResults.set([]);
    }
  } finally {
    isLoading.set(false);
  }
}

export function getIconSvgUrl(prefix: string, name: string, color?: string): string {
  let url = `${API_BASE}/${prefix}/${name}.svg`;
  if (color) {
    url += `?color=${encodeURIComponent(color)}`;
  }
  return url;
}

// Helper to convert blob to Uint8Array
async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

// Save file using Tauri fs API
async function saveToPath(path: string, filename: string, data: Uint8Array | string): Promise<boolean> {
  try {
    // Ensure directory exists
    const dirExists = await exists(path);
    if (!dirExists) {
      await mkdir(path, { recursive: true });
    }
    
    const filePath = await join(path, filename);
    
    if (typeof data === 'string') {
      await writeFile(filePath, new TextEncoder().encode(data));
    } else {
      await writeFile(filePath, data);
    }
    return true;
  } catch (error) {
    console.error('Failed to save file:', error);
    return false;
  }
}

// Browser download fallback
function browserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Download functions
export async function downloadIconAsSvg(prefix: string, name: string, outputPath?: string): Promise<void> {
  const url = getIconSvgUrl(prefix, name);
  
  try {
    const res = await fetch(url);
    const svgText = await res.text();
    const filename = `${prefix}-${name}.svg`;
    
    // Use Tauri fs if path is set
    const downloadPath = outputPath || get(settings).downloadPath;
    if (downloadPath) {
      const saved = await saveToPath(downloadPath, filename, svgText);
      if (saved) return;
    }
    
    // Fallback to browser download
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    browserDownload(blob, filename);
  } catch (error) {
    console.error('Failed to download SVG:', error);
  }
}

export async function downloadIconAsPng(prefix: string, name: string, size: number = 64, outputPath?: string): Promise<void> {
  const svgUrl = getIconSvgUrl(prefix, name);
  
  try {
    const res = await fetch(svgUrl);
    const svgText = await res.text();
    const filename = `${prefix}-${name}.png`;
    
    // Create canvas and draw SVG
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    
    const svgBase64 = btoa(unescape(encodeURIComponent(svgText)));
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;
    
    await new Promise<void>((resolve, reject) => {
      img.onload = async () => {
        ctx.drawImage(img, 0, 0, size, size);
        
        const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/png'));
        if (!blob) {
          resolve();
          return;
        }
        
        const downloadPath = outputPath || get(settings).downloadPath;
        if (downloadPath) {
          const data = await blobToUint8Array(blob);
          const saved = await saveToPath(downloadPath, filename, data);
          if (saved) {
            resolve();
            return;
          }
        }
        
        browserDownload(blob, filename);
        resolve();
      };
      img.onerror = (e) => {
        console.error('Image load error:', e);
        reject(e);
      };
      img.src = dataUrl;
    });
  } catch (error) {
    console.error('Failed to download as PNG:', error);
  }
}

export async function downloadIconAsWebp(prefix: string, name: string, size: number = 64, outputPath?: string): Promise<void> {
  const svgUrl = getIconSvgUrl(prefix, name);
  
  try {
    const res = await fetch(svgUrl);
    const svgText = await res.text();
    const filename = `${prefix}-${name}.webp`;
    
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    
    const svgBase64 = btoa(unescape(encodeURIComponent(svgText)));
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;
    
    await new Promise<void>((resolve, reject) => {
      img.onload = async () => {
        ctx.drawImage(img, 0, 0, size, size);
        
        const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/webp'));
        if (!blob) {
          resolve();
          return;
        }
        
        const downloadPath = outputPath || get(settings).downloadPath;
        if (downloadPath) {
          const data = await blobToUint8Array(blob);
          const saved = await saveToPath(downloadPath, filename, data);
          if (saved) {
            resolve();
            return;
          }
        }
        
        browserDownload(blob, filename);
        resolve();
      };
      img.onerror = (e) => {
        console.error('Image load error:', e);
        reject(e);
      };
      img.src = dataUrl;
    });
  } catch (error) {
    console.error('Failed to download as WebP:', error);
  }
}

export async function downloadIcon(
  prefix: string, 
  name: string, 
  format: 'svg' | 'png' | 'webp' = 'svg',
  size: number = 64
): Promise<void> {
  switch (format) {
    case 'png':
      await downloadIconAsPng(prefix, name, size);
      break;
    case 'webp':
      await downloadIconAsWebp(prefix, name, size);
      break;
    default:
      await downloadIconAsSvg(prefix, name);
  }
}

// Download entire collection as ZIP
export async function downloadCollection(prefix: string, format: 'svg' | 'png' | 'webp' = 'svg', size: number = 64): Promise<void> {
  isLoading.set(true);
  
  try {
    const icons = await fetchAllCollectionIcons(prefix);
    
    // For now, download icons one by one (in production, use JSZip)
    // This is a simplified version - for large collections, you'd want to use a ZIP library
    const batchSize = 10;
    for (let i = 0; i < Math.min(icons.length, 50); i += batchSize) {
      const batch = icons.slice(i, i + batchSize);
      await Promise.all(batch.map(name => downloadIcon(prefix, name, format, size)));
      // Small delay between batches
      await new Promise(r => setTimeout(r, 500));
    }
    
    if (icons.length > 50) {
      alert(`Downloaded first 50 icons. Full collection has ${icons.length} icons.`);
    }
  } catch (error) {
    console.error('Failed to download collection:', error);
  } finally {
    isLoading.set(false);
  }
}

// Clear cache
export function clearCache() {
  cache.clear();
}
