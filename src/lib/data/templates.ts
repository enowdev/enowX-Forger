export interface IconSize {
  name: string;
  width: number;
  height: number;
  format: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string; // Icon name from logos collection (SVG Logos by Gil Barbara)
  icons: IconSize[];
}

export const categories = [
  { id: 'desktop', name: 'Desktop' },
  { id: 'mobile', name: 'Mobile' },
  { id: 'web', name: 'Web' },
  { id: 'game', name: 'Game Engines' },
  { id: 'other', name: 'Other' }
];

// Helper to get icon URL from SVG Logos collection
export function getTemplateIconUrl(iconName: string): string {
  return `https://api.iconify.design/logos/${iconName}.svg`;
}

export const templates: ProjectTemplate[] = [
  // Desktop
  {
    id: 'tauri',
    name: 'Tauri',
    description: 'Desktop app icons for Tauri v2',
    category: 'desktop',
    icon: 'tauri',
    icons: [
      { name: '32x32.png', width: 32, height: 32, format: 'png' },
      { name: '128x128.png', width: 128, height: 128, format: 'png' },
      { name: '128x128@2x.png', width: 256, height: 256, format: 'png' },
      { name: 'icon.icns', width: 512, height: 512, format: 'icns' },
      { name: 'icon.ico', width: 256, height: 256, format: 'ico' },
      { name: 'icon.png', width: 512, height: 512, format: 'png' },
      { name: 'Square30x30Logo.png', width: 30, height: 30, format: 'png' },
      { name: 'Square44x44Logo.png', width: 44, height: 44, format: 'png' },
      { name: 'Square71x71Logo.png', width: 71, height: 71, format: 'png' },
      { name: 'Square89x89Logo.png', width: 89, height: 89, format: 'png' },
      { name: 'Square107x107Logo.png', width: 107, height: 107, format: 'png' },
      { name: 'Square142x142Logo.png', width: 142, height: 142, format: 'png' },
      { name: 'Square150x150Logo.png', width: 150, height: 150, format: 'png' },
      { name: 'Square284x284Logo.png', width: 284, height: 284, format: 'png' },
      { name: 'Square310x310Logo.png', width: 310, height: 310, format: 'png' },
      { name: 'StoreLogo.png', width: 50, height: 50, format: 'png' }
    ]
  },
  {
    id: 'electron',
    name: 'Electron',
    description: 'Desktop app icons for Electron',
    category: 'desktop',
    icon: 'electron',
    icons: [
      { name: 'icon.png', width: 512, height: 512, format: 'png' },
      { name: 'icon.ico', width: 256, height: 256, format: 'ico' },
      { name: 'icon.icns', width: 512, height: 512, format: 'icns' },
      { name: '16x16.png', width: 16, height: 16, format: 'png' },
      { name: '24x24.png', width: 24, height: 24, format: 'png' },
      { name: '32x32.png', width: 32, height: 32, format: 'png' },
      { name: '48x48.png', width: 48, height: 48, format: 'png' },
      { name: '64x64.png', width: 64, height: 64, format: 'png' },
      { name: '128x128.png', width: 128, height: 128, format: 'png' },
      { name: '256x256.png', width: 256, height: 256, format: 'png' },
      { name: '512x512.png', width: 512, height: 512, format: 'png' },
      { name: '1024x1024.png', width: 1024, height: 1024, format: 'png' }
    ]
  },
  {
    id: 'nwjs',
    name: 'NW.js',
    description: 'Desktop app icons for NW.js',
    category: 'desktop',
    icon: 'nodejs-icon',
    icons: [
      { name: 'icon.png', width: 512, height: 512, format: 'png' },
      { name: 'icon.ico', width: 256, height: 256, format: 'ico' },
      { name: 'icon.icns', width: 512, height: 512, format: 'icns' }
    ]
  },
  {
    id: 'wails',
    name: 'Wails',
    description: 'Desktop app icons for Wails (Go)',
    category: 'desktop',
    icon: 'go',
    icons: [
      { name: 'appicon.png', width: 1024, height: 1024, format: 'png' },
      { name: 'icon.ico', width: 256, height: 256, format: 'ico' },
      { name: 'icon.icns', width: 512, height: 512, format: 'icns' }
    ]
  },
  {
    id: 'neutralino',
    name: 'Neutralino',
    description: 'Desktop app icons for Neutralino.js',
    category: 'desktop',
    icon: 'javascript',
    icons: [
      { name: 'icon.png', width: 512, height: 512, format: 'png' },
      { name: 'icon.ico', width: 256, height: 256, format: 'ico' },
      { name: 'icon.icns', width: 512, height: 512, format: 'icns' }
    ]
  },
  {
    id: 'windows',
    name: 'Windows',
    description: 'Windows application icons',
    category: 'desktop',
    icon: 'microsoft-windows-icon',
    icons: [
      { name: 'icon.ico', width: 256, height: 256, format: 'ico' },
      { name: '16x16.png', width: 16, height: 16, format: 'png' },
      { name: '32x32.png', width: 32, height: 32, format: 'png' },
      { name: '48x48.png', width: 48, height: 48, format: 'png' },
      { name: '256x256.png', width: 256, height: 256, format: 'png' }
    ]
  },
  {
    id: 'macos',
    name: 'macOS',
    description: 'macOS application icons',
    category: 'desktop',
    icon: 'apple',
    icons: [
      { name: 'icon.icns', width: 1024, height: 1024, format: 'icns' },
      { name: 'icon_16x16.png', width: 16, height: 16, format: 'png' },
      { name: 'icon_16x16@2x.png', width: 32, height: 32, format: 'png' },
      { name: 'icon_32x32.png', width: 32, height: 32, format: 'png' },
      { name: 'icon_32x32@2x.png', width: 64, height: 64, format: 'png' },
      { name: 'icon_128x128.png', width: 128, height: 128, format: 'png' },
      { name: 'icon_128x128@2x.png', width: 256, height: 256, format: 'png' },
      { name: 'icon_256x256.png', width: 256, height: 256, format: 'png' },
      { name: 'icon_256x256@2x.png', width: 512, height: 512, format: 'png' },
      { name: 'icon_512x512.png', width: 512, height: 512, format: 'png' },
      { name: 'icon_512x512@2x.png', width: 1024, height: 1024, format: 'png' }
    ]
  },
  {
    id: 'linux',
    name: 'Linux',
    description: 'Linux application icons (freedesktop)',
    category: 'desktop',
    icon: 'linux-tux',
    icons: [
      { name: '16x16.png', width: 16, height: 16, format: 'png' },
      { name: '22x22.png', width: 22, height: 22, format: 'png' },
      { name: '24x24.png', width: 24, height: 24, format: 'png' },
      { name: '32x32.png', width: 32, height: 32, format: 'png' },
      { name: '48x48.png', width: 48, height: 48, format: 'png' },
      { name: '64x64.png', width: 64, height: 64, format: 'png' },
      { name: '128x128.png', width: 128, height: 128, format: 'png' },
      { name: '256x256.png', width: 256, height: 256, format: 'png' },
      { name: '512x512.png', width: 512, height: 512, format: 'png' },
      { name: 'scalable.svg', width: 512, height: 512, format: 'svg' }
    ]
  },
  // Mobile
  {
    id: 'android',
    name: 'Android',
    description: 'Android app launcher icons',
    category: 'mobile',
    icon: 'android-icon',
    icons: [
      { name: 'mipmap-mdpi/ic_launcher.png', width: 48, height: 48, format: 'png' },
      { name: 'mipmap-hdpi/ic_launcher.png', width: 72, height: 72, format: 'png' },
      { name: 'mipmap-xhdpi/ic_launcher.png', width: 96, height: 96, format: 'png' },
      { name: 'mipmap-xxhdpi/ic_launcher.png', width: 144, height: 144, format: 'png' },
      { name: 'mipmap-xxxhdpi/ic_launcher.png', width: 192, height: 192, format: 'png' },
      { name: 'playstore-icon.png', width: 512, height: 512, format: 'png' }
    ]
  },
  {
    id: 'android-adaptive',
    name: 'Android Adaptive',
    description: 'Android adaptive icons (foreground/background)',
    category: 'mobile',
    icon: 'android-icon',
    icons: [
      { name: 'mipmap-mdpi/ic_launcher_foreground.png', width: 108, height: 108, format: 'png' },
      { name: 'mipmap-hdpi/ic_launcher_foreground.png', width: 162, height: 162, format: 'png' },
      { name: 'mipmap-xhdpi/ic_launcher_foreground.png', width: 216, height: 216, format: 'png' },
      { name: 'mipmap-xxhdpi/ic_launcher_foreground.png', width: 324, height: 324, format: 'png' },
      { name: 'mipmap-xxxhdpi/ic_launcher_foreground.png', width: 432, height: 432, format: 'png' }
    ]
  },
  {
    id: 'ios',
    name: 'iOS',
    description: 'iOS app icons',
    category: 'mobile',
    icon: 'apple-app-store',
    icons: [
      { name: 'Icon-20.png', width: 20, height: 20, format: 'png' },
      { name: 'Icon-20@2x.png', width: 40, height: 40, format: 'png' },
      { name: 'Icon-20@3x.png', width: 60, height: 60, format: 'png' },
      { name: 'Icon-29.png', width: 29, height: 29, format: 'png' },
      { name: 'Icon-29@2x.png', width: 58, height: 58, format: 'png' },
      { name: 'Icon-29@3x.png', width: 87, height: 87, format: 'png' },
      { name: 'Icon-40.png', width: 40, height: 40, format: 'png' },
      { name: 'Icon-40@2x.png', width: 80, height: 80, format: 'png' },
      { name: 'Icon-40@3x.png', width: 120, height: 120, format: 'png' },
      { name: 'Icon-60@2x.png', width: 120, height: 120, format: 'png' },
      { name: 'Icon-60@3x.png', width: 180, height: 180, format: 'png' },
      { name: 'Icon-76.png', width: 76, height: 76, format: 'png' },
      { name: 'Icon-76@2x.png', width: 152, height: 152, format: 'png' },
      { name: 'Icon-83.5@2x.png', width: 167, height: 167, format: 'png' },
      { name: 'Icon-1024.png', width: 1024, height: 1024, format: 'png' }
    ]
  },
  {
    id: 'flutter',
    name: 'Flutter',
    description: 'Flutter app icons (iOS & Android)',
    category: 'mobile',
    icon: 'flutter',
    icons: [
      { name: 'android/mipmap-mdpi/ic_launcher.png', width: 48, height: 48, format: 'png' },
      { name: 'android/mipmap-hdpi/ic_launcher.png', width: 72, height: 72, format: 'png' },
      { name: 'android/mipmap-xhdpi/ic_launcher.png', width: 96, height: 96, format: 'png' },
      { name: 'android/mipmap-xxhdpi/ic_launcher.png', width: 144, height: 144, format: 'png' },
      { name: 'android/mipmap-xxxhdpi/ic_launcher.png', width: 192, height: 192, format: 'png' },
      { name: 'ios/Icon-App-20x20@1x.png', width: 20, height: 20, format: 'png' },
      { name: 'ios/Icon-App-20x20@2x.png', width: 40, height: 40, format: 'png' },
      { name: 'ios/Icon-App-20x20@3x.png', width: 60, height: 60, format: 'png' },
      { name: 'ios/Icon-App-29x29@1x.png', width: 29, height: 29, format: 'png' },
      { name: 'ios/Icon-App-29x29@2x.png', width: 58, height: 58, format: 'png' },
      { name: 'ios/Icon-App-29x29@3x.png', width: 87, height: 87, format: 'png' },
      { name: 'ios/Icon-App-40x40@1x.png', width: 40, height: 40, format: 'png' },
      { name: 'ios/Icon-App-40x40@2x.png', width: 80, height: 80, format: 'png' },
      { name: 'ios/Icon-App-40x40@3x.png', width: 120, height: 120, format: 'png' },
      { name: 'ios/Icon-App-60x60@2x.png', width: 120, height: 120, format: 'png' },
      { name: 'ios/Icon-App-60x60@3x.png', width: 180, height: 180, format: 'png' },
      { name: 'ios/Icon-App-76x76@1x.png', width: 76, height: 76, format: 'png' },
      { name: 'ios/Icon-App-76x76@2x.png', width: 152, height: 152, format: 'png' },
      { name: 'ios/Icon-App-83.5x83.5@2x.png', width: 167, height: 167, format: 'png' },
      { name: 'ios/Icon-App-1024x1024@1x.png', width: 1024, height: 1024, format: 'png' }
    ]
  },
  {
    id: 'react-native',
    name: 'React Native',
    description: 'React Native app icons',
    category: 'mobile',
    icon: 'react',
    icons: [
      { name: 'android/mipmap-mdpi/ic_launcher.png', width: 48, height: 48, format: 'png' },
      { name: 'android/mipmap-hdpi/ic_launcher.png', width: 72, height: 72, format: 'png' },
      { name: 'android/mipmap-xhdpi/ic_launcher.png', width: 96, height: 96, format: 'png' },
      { name: 'android/mipmap-xxhdpi/ic_launcher.png', width: 144, height: 144, format: 'png' },
      { name: 'android/mipmap-xxxhdpi/ic_launcher.png', width: 192, height: 192, format: 'png' },
      { name: 'ios/Icon-1024.png', width: 1024, height: 1024, format: 'png' }
    ]
  },
  {
    id: 'capacitor',
    name: 'Capacitor',
    description: 'Capacitor/Ionic app icons',
    category: 'mobile',
    icon: 'capacitorjs-icon',
    icons: [
      { name: 'android/mipmap-mdpi/ic_launcher.png', width: 48, height: 48, format: 'png' },
      { name: 'android/mipmap-hdpi/ic_launcher.png', width: 72, height: 72, format: 'png' },
      { name: 'android/mipmap-xhdpi/ic_launcher.png', width: 96, height: 96, format: 'png' },
      { name: 'android/mipmap-xxhdpi/ic_launcher.png', width: 144, height: 144, format: 'png' },
      { name: 'android/mipmap-xxxhdpi/ic_launcher.png', width: 192, height: 192, format: 'png' },
      { name: 'ios/AppIcon.png', width: 1024, height: 1024, format: 'png' }
    ]
  },
  {
    id: 'xamarin',
    name: 'Xamarin',
    description: 'Xamarin app icons',
    category: 'mobile',
    icon: 'xamarin',
    icons: [
      { name: 'android/icon.png', width: 192, height: 192, format: 'png' },
      { name: 'ios/Icon-App-1024x1024.png', width: 1024, height: 1024, format: 'png' }
    ]
  },
  {
    id: 'maui',
    name: '.NET MAUI',
    description: '.NET MAUI app icons',
    category: 'mobile',
    icon: 'dotnet',
    icons: [
      { name: 'appicon.svg', width: 512, height: 512, format: 'svg' },
      { name: 'appiconfg.svg', width: 512, height: 512, format: 'svg' }
    ]
  },
  {
    id: 'kotlin-multiplatform',
    name: 'Kotlin Multiplatform',
    description: 'KMP app icons',
    category: 'mobile',
    icon: 'kotlin-icon',
    icons: [
      { name: 'android/ic_launcher.png', width: 192, height: 192, format: 'png' },
      { name: 'ios/AppIcon.png', width: 1024, height: 1024, format: 'png' }
    ]
  },
  // Web
  {
    id: 'nextjs',
    name: 'Next.js',
    description: 'Next.js app icons',
    category: 'web',
    icon: 'nextjs-icon',
    icons: [
      { name: 'favicon.ico', width: 48, height: 48, format: 'ico' },
      { name: 'icon.png', width: 512, height: 512, format: 'png' },
      { name: 'icon-192.png', width: 192, height: 192, format: 'png' },
      { name: 'icon-512.png', width: 512, height: 512, format: 'png' },
      { name: 'apple-icon.png', width: 180, height: 180, format: 'png' },
      { name: 'opengraph-image.png', width: 1200, height: 630, format: 'png' }
    ]
  },
  {
    id: 'nuxt',
    name: 'Nuxt',
    description: 'Nuxt.js app icons',
    category: 'web',
    icon: 'nuxt-icon',
    icons: [
      { name: 'favicon.ico', width: 48, height: 48, format: 'ico' },
      { name: 'icon-192.png', width: 192, height: 192, format: 'png' },
      { name: 'icon-512.png', width: 512, height: 512, format: 'png' },
      { name: 'apple-touch-icon.png', width: 180, height: 180, format: 'png' }
    ]
  },
  {
    id: 'sveltekit',
    name: 'SvelteKit',
    description: 'SvelteKit app icons',
    category: 'web',
    icon: 'svelte-icon',
    icons: [
      { name: 'favicon.png', width: 512, height: 512, format: 'png' },
      { name: 'favicon.ico', width: 48, height: 48, format: 'ico' },
      { name: 'apple-touch-icon.png', width: 180, height: 180, format: 'png' }
    ]
  },
  {
    id: 'pwa',
    name: 'PWA',
    description: 'Progressive Web App icons',
    category: 'web',
    icon: 'pwa',
    icons: [
      { name: 'icon-72x72.png', width: 72, height: 72, format: 'png' },
      { name: 'icon-96x96.png', width: 96, height: 96, format: 'png' },
      { name: 'icon-128x128.png', width: 128, height: 128, format: 'png' },
      { name: 'icon-144x144.png', width: 144, height: 144, format: 'png' },
      { name: 'icon-152x152.png', width: 152, height: 152, format: 'png' },
      { name: 'icon-192x192.png', width: 192, height: 192, format: 'png' },
      { name: 'icon-384x384.png', width: 384, height: 384, format: 'png' },
      { name: 'icon-512x512.png', width: 512, height: 512, format: 'png' },
      { name: 'maskable-icon-512.png', width: 512, height: 512, format: 'png' }
    ]
  },
  {
    id: 'favicon',
    name: 'Favicon',
    description: 'Standard website favicons',
    category: 'web',
    icon: 'html-5',
    icons: [
      { name: 'favicon.ico', width: 48, height: 48, format: 'ico' },
      { name: 'favicon-16x16.png', width: 16, height: 16, format: 'png' },
      { name: 'favicon-32x32.png', width: 32, height: 32, format: 'png' },
      { name: 'apple-touch-icon.png', width: 180, height: 180, format: 'png' },
      { name: 'android-chrome-192x192.png', width: 192, height: 192, format: 'png' },
      { name: 'android-chrome-512x512.png', width: 512, height: 512, format: 'png' },
      { name: 'mstile-150x150.png', width: 150, height: 150, format: 'png' },
      { name: 'safari-pinned-tab.svg', width: 512, height: 512, format: 'svg' }
    ]
  },
  {
    id: 'chrome-extension',
    name: 'Chrome Extension',
    description: 'Chrome/Edge extension icons',
    category: 'web',
    icon: 'chrome',
    icons: [
      { name: 'icon-16.png', width: 16, height: 16, format: 'png' },
      { name: 'icon-32.png', width: 32, height: 32, format: 'png' },
      { name: 'icon-48.png', width: 48, height: 48, format: 'png' },
      { name: 'icon-128.png', width: 128, height: 128, format: 'png' }
    ]
  },
  {
    id: 'firefox-addon',
    name: 'Firefox Add-on',
    description: 'Firefox extension icons',
    category: 'web',
    icon: 'firefox',
    icons: [
      { name: 'icon-48.png', width: 48, height: 48, format: 'png' },
      { name: 'icon-96.png', width: 96, height: 96, format: 'png' }
    ]
  },
  // Game Engines
  {
    id: 'unity',
    name: 'Unity',
    description: 'Unity game icons',
    category: 'game',
    icon: 'unity',
    icons: [
      { name: 'icon.png', width: 512, height: 512, format: 'png' },
      { name: 'icon-192.png', width: 192, height: 192, format: 'png' },
      { name: 'icon-96.png', width: 96, height: 96, format: 'png' },
      { name: 'icon-48.png', width: 48, height: 48, format: 'png' }
    ]
  },
  {
    id: 'unreal',
    name: 'Unreal Engine',
    description: 'Unreal Engine game icons',
    category: 'game',
    icon: 'unrealengine-icon',
    icons: [
      { name: 'icon.ico', width: 256, height: 256, format: 'ico' },
      { name: 'icon.png', width: 512, height: 512, format: 'png' }
    ]
  },
  {
    id: 'godot',
    name: 'Godot',
    description: 'Godot game icons',
    category: 'game',
    icon: 'godot-icon',
    icons: [
      { name: 'icon.png', width: 512, height: 512, format: 'png' },
      { name: 'icon.ico', width: 256, height: 256, format: 'ico' },
      { name: 'icon.svg', width: 512, height: 512, format: 'svg' }
    ]
  },
  {
    id: 'gamemaker',
    name: 'GameMaker',
    description: 'GameMaker Studio icons',
    category: 'game',
    icon: 'gamemaker',
    icons: [
      { name: 'icon.png', width: 1024, height: 1024, format: 'png' }
    ]
  },
  {
    id: 'rpgmaker',
    name: 'RPG Maker',
    description: 'RPG Maker game icons',
    category: 'game',
    icon: 'ruby',
    icons: [
      { name: 'icon.ico', width: 256, height: 256, format: 'ico' },
      { name: 'icon.png', width: 512, height: 512, format: 'png' }
    ]
  },
  {
    id: 'construct',
    name: 'Construct',
    description: 'Construct 3 game icons',
    category: 'game',
    icon: 'c',
    icons: [
      { name: 'icon-16.png', width: 16, height: 16, format: 'png' },
      { name: 'icon-32.png', width: 32, height: 32, format: 'png' },
      { name: 'icon-64.png', width: 64, height: 64, format: 'png' },
      { name: 'icon-128.png', width: 128, height: 128, format: 'png' },
      { name: 'icon-256.png', width: 256, height: 256, format: 'png' },
      { name: 'icon-512.png', width: 512, height: 512, format: 'png' }
    ]
  },
  {
    id: 'steam',
    name: 'Steam',
    description: 'Steam store assets',
    category: 'game',
    icon: 'steam-icon',
    icons: [
      { name: 'icon.ico', width: 256, height: 256, format: 'ico' },
      { name: 'header.png', width: 460, height: 215, format: 'png' },
      { name: 'capsule_231x87.png', width: 231, height: 87, format: 'png' },
      { name: 'capsule_467x181.png', width: 467, height: 181, format: 'png' },
      { name: 'capsule_616x353.png', width: 616, height: 353, format: 'png' },
      { name: 'library_600x900.png', width: 600, height: 900, format: 'png' },
      { name: 'library_hero.png', width: 3840, height: 1240, format: 'png' },
      { name: 'library_logo.png', width: 1280, height: 720, format: 'png' }
    ]
  },
  {
    id: 'itchio',
    name: 'itch.io',
    description: 'itch.io store assets',
    category: 'game',
    icon: 'itch-io',
    icons: [
      { name: 'cover.png', width: 630, height: 500, format: 'png' },
      { name: 'screenshot.png', width: 1920, height: 1080, format: 'png' }
    ]
  },
  // Other
  {
    id: 'vscode-extension',
    name: 'VS Code Extension',
    description: 'VS Code extension icons',
    category: 'other',
    icon: 'visual-studio-code',
    icons: [
      { name: 'icon.png', width: 128, height: 128, format: 'png' }
    ]
  },
  {
    id: 'jetbrains-plugin',
    name: 'JetBrains Plugin',
    description: 'JetBrains IDE plugin icons',
    category: 'other',
    icon: 'jetbrains-icon',
    icons: [
      { name: 'pluginIcon.svg', width: 40, height: 40, format: 'svg' },
      { name: 'pluginIcon_dark.svg', width: 40, height: 40, format: 'svg' }
    ]
  },
  {
    id: 'npm',
    name: 'npm Package',
    description: 'npm package icon',
    category: 'other',
    icon: 'npm-icon',
    icons: [
      { name: 'logo.png', width: 512, height: 512, format: 'png' }
    ]
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'GitHub repository assets',
    category: 'other',
    icon: 'github-icon',
    icons: [
      { name: 'logo.png', width: 512, height: 512, format: 'png' },
      { name: 'social-preview.png', width: 1280, height: 640, format: 'png' }
    ]
  },
  {
    id: 'discord-bot',
    name: 'Discord Bot',
    description: 'Discord bot avatar',
    category: 'other',
    icon: 'discord-icon',
    icons: [
      { name: 'avatar.png', width: 512, height: 512, format: 'png' }
    ]
  },
  {
    id: 'slack-app',
    name: 'Slack App',
    description: 'Slack app icons',
    category: 'other',
    icon: 'slack-icon',
    icons: [
      { name: 'icon-512.png', width: 512, height: 512, format: 'png' },
      { name: 'icon-192.png', width: 192, height: 192, format: 'png' },
      { name: 'icon-96.png', width: 96, height: 96, format: 'png' },
      { name: 'icon-32.png', width: 32, height: 32, format: 'png' }
    ]
  },
  {
    id: 'microsoft-store',
    name: 'Microsoft Store',
    description: 'Microsoft Store app assets',
    category: 'other',
    icon: 'microsoft-icon',
    icons: [
      { name: 'StoreLogo.png', width: 50, height: 50, format: 'png' },
      { name: 'Square44x44Logo.png', width: 44, height: 44, format: 'png' },
      { name: 'Square150x150Logo.png', width: 150, height: 150, format: 'png' },
      { name: 'Wide310x150Logo.png', width: 310, height: 150, format: 'png' },
      { name: 'LargeTile.png', width: 310, height: 310, format: 'png' },
      { name: 'SplashScreen.png', width: 620, height: 300, format: 'png' }
    ]
  },
  {
    id: 'app-store',
    name: 'App Store',
    description: 'Apple App Store assets',
    category: 'other',
    icon: 'apple-app-store',
    icons: [
      { name: 'icon-1024.png', width: 1024, height: 1024, format: 'png' },
      { name: 'screenshot-iphone-6.5.png', width: 1284, height: 2778, format: 'png' },
      { name: 'screenshot-ipad-12.9.png', width: 2048, height: 2732, format: 'png' }
    ]
  },
  {
    id: 'play-store',
    name: 'Play Store',
    description: 'Google Play Store assets',
    category: 'other',
    icon: 'google-play-icon',
    icons: [
      { name: 'icon-512.png', width: 512, height: 512, format: 'png' },
      { name: 'feature-graphic.png', width: 1024, height: 500, format: 'png' }
    ]
  }
];
