# enowX Forger

A cross-platform desktop application for generating app icons across multiple platforms from a single source image.

<p align="center">
  <img src="static/app-icon-hd.png" alt="enowX Forger" width="128" height="128">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-24C8D8?style=for-the-badge&logo=tauri&logoColor=white" alt="Tauri">
  <img src="https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" alt="SvelteKit">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white" alt="Rust">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
</p>

## Table of Contents

- [Download](#download)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Building](#building)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Tech Stack](#tech-stack)
- [License](#license)
- [Author](#author)

## Download

Download the latest version from [GitHub Releases](https://github.com/enowdev/enowX-Forger/releases/latest).

| Platform | Download |
|----------|----------|
| Windows (Installer) | `.exe` or `.msi` |
| Windows (Portable) | `_portable.zip` |
| macOS (Apple Silicon) | `_aarch64.dmg` |
| macOS (Intel) | `_x64.dmg` |
| Linux (Universal) | `.AppImage` |
| Linux (Debian/Ubuntu) | `.deb` |

> Windows and Linux users will receive automatic updates. macOS users please download manually.

## Features

### Icon Generation
- Support for 35+ platform templates:
  - **Desktop**: Tauri, Electron, NW.js, Wails, Windows, macOS, Linux
  - **Mobile**: Android, iOS, Flutter, React Native, Capacitor, Xamarin, .NET MAUI
  - **Web**: Next.js, Nuxt, SvelteKit, PWA, Favicon, Chrome/Firefox Extensions
  - **Game Engines**: Unity, Unreal Engine, Godot, GameMaker, Steam, itch.io
  - **Other**: VS Code Extension, JetBrains Plugin, npm, GitHub, Discord Bot, Slack App
- Drag & drop image upload
- Background remover tool
- Custom template support
- Batch generation with progress tracking

### Built-in Editor
- Layer-based image editing
- Drawing tools: Rectangle, Circle, Triangle, Star, Line, Pen, Brush, Eraser
- Text tool with font customization
- Fill and stroke options
- Transform controls (position, size, rotation)
- Keyboard shortcuts

### Icon Discovery
- Browse 150,000+ icons from Iconify
- Search icons and collections
- Favorite icons and collections
- Download in SVG, PNG, or WebP format

## Installation

For most users, download the pre-built binaries from the [Download](#download) section above.

### Development Setup

If you want to build from source:

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- [Rust](https://www.rust-lang.org/tools/install)
- Platform-specific dependencies: [Tauri Prerequisites](https://v2.tauri.app/start/prerequisites/)

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

## Usage

1. **Generate Tab** - Upload a source image, select target platforms, and generate icons
2. **Editor Tab** - Create or edit icons using the built-in editor
3. **Discovery Tab** - Browse and download icons from Iconify
4. **Settings Tab** - Configure output paths and default formats

## Building

### Local Build

```bash
# Build for production
bun run tauri build
# or
npm run tauri build
```

Output locations:
- **Windows**: `src-tauri/target/release/bundle/nsis/` (installer) and `src-tauri/target/release/` (portable .exe)
- **macOS**: `src-tauri/target/release/bundle/dmg/` and `src-tauri/target/release/bundle/macos/`
- **Linux**: `src-tauri/target/release/bundle/appimage/` and `src-tauri/target/release/bundle/deb/`

### Cross-Platform Notes

- **Windows**: Builds `.exe` (portable) and `.msi`/NSIS installer
- **macOS**: Requires macOS to build (Apple code signing). Builds `.dmg` and `.app`
- **Linux**: Builds `.AppImage` (portable) and `.deb`

> Note: macOS builds require a Mac due to Apple's code signing requirements. Use GitHub Actions for automated cross-platform builds.

## Project Structure

```
enowX-Forger/
├── src/                    # SvelteKit frontend
│   ├── lib/
│   │   ├── components/     # UI components
│   │   ├── stores/         # Svelte stores
│   │   └── data/           # Templates data
│   └── routes/             # SvelteKit routes
├── src-tauri/              # Tauri backend (Rust)
│   ├── src/                # Rust source code
│   └── icons/              # App icons
└── static/                 # Static assets
```

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Tech Stack

| Technology | Description |
|------------|-------------|
| [Tauri v2](https://v2.tauri.app/) | Desktop application framework |
| [SvelteKit](https://kit.svelte.dev/) | Frontend framework |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS |
| [Rust](https://www.rust-lang.org/) | Backend language |
| [Lucide Icons](https://lucide.dev/) | UI icons |
| [Iconify](https://iconify.design/) | Icon discovery API |

## License

This project is open source under the [MIT License](LICENSE).

## Author

Developed by [enowdev](https://github.com/enowdev)

---

If you find this project useful, please consider giving it a star!
