# enowX Forger

A cross-platform desktop application for generating app icons across multiple platforms from a single source image. Built with Tauri v2, SvelteKit, and Tailwind CSS.

![enowX Forger](static/app-icon-hd.png)

## Features

### Icon Generation
- Support for 35+ platform templates including:
  - Desktop: Tauri, Electron, NW.js, Wails, Windows, macOS, Linux
  - Mobile: Android, iOS, Flutter, React Native, Capacitor, Xamarin, .NET MAUI
  - Web: Next.js, Nuxt, SvelteKit, PWA, Favicon, Chrome/Firefox Extensions
  - Game Engines: Unity, Unreal Engine, Godot, GameMaker, Steam, itch.io
  - Other: VS Code Extension, JetBrains Plugin, npm, GitHub, Discord Bot, Slack App
- Drag & drop image upload
- Background remover tool
- Custom template support for specific icon sizes

### Built-in Editor
- Layer-based image editing
- Drawing tools: Rectangle, Circle, Triangle, Star, Line, Pen, Brush, Eraser
- Text tool with font customization
- Fill and stroke options
- Transform controls (position, size, rotation)
- Keyboard shortcuts for efficient workflow

### Icon Discovery
- Browse 150,000+ icons from Iconify
- Search icons and collections
- Favorite icons and collections
- Download in SVG, PNG, or WebP format
- Multiple size options

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- [Rust](https://www.rust-lang.org/tools/install)
- Platform-specific dependencies for Tauri: [Tauri Prerequisites](https://v2.tauri.app/start/prerequisites/)

### Setup

```bash
# Clone the repository
git clone https://github.com/enowdev/enowX-Forger.git
cd enowX-Forger

# Install dependencies
bun install
# or
npm install

# Run in development mode
bun run tauri dev
# or
npm run tauri dev
```

## Building

```bash
# Build for production
bun run tauri build
# or
npm run tauri build
```

The built application will be available in `src-tauri/target/release/bundle/`.

## Usage

1. **Generate Tab**: Upload a source image, select target platforms, and generate icons
2. **Editor Tab**: Create or edit icons using the built-in editor
3. **Discovery Tab**: Browse and download icons from Iconify
4. **Settings Tab**: Configure output paths and default formats

## Project Structure

```
enowX-Forger/
├── src/                    # SvelteKit frontend
│   ├── lib/
│   │   ├── components/     # UI components
│   │   ├── stores/         # Svelte stores
│   │   └── data/           # Templates and static data
│   └── routes/             # SvelteKit routes
├── src-tauri/              # Tauri backend (Rust)
│   ├── src/                # Rust source code
│   └── icons/              # Application icons
└── static/                 # Static assets
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Tech Stack

- [Tauri v2](https://v2.tauri.app/) - Desktop application framework
- [SvelteKit](https://kit.svelte.dev/) - Frontend framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide Icons](https://lucide.dev/) - UI icons
- [Iconify](https://iconify.design/) - Icon discovery API

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

Developed by [enowdev](https://github.com/enowdev)

---

If you find this project useful, please consider giving it a star on GitHub!
