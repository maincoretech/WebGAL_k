# WebGAL_k

**[中文版](./README.md)**

> WebGAL + hexz = Encrypted · Random-access · Delta-updatable desktop visual novel engine

Built on [WebGAL](https://github.com/OpenWebGAL/WebGAL) / [Tauri v2](https://v2.tauri.app) / [hexz](https://github.com/maincoretech/hexz_k). Packs game assets into a single encrypted `.hxz` archive, fully compatible with Steamworks delta patching.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Engine | **React 18** · **PIXI.js 7.4** · **TypeScript 5.9** |
| Native | **Tauri v2** (Rust) · WKWebView (macOS) / WebView2 (Windows) |
| Crypto Archive | **hexz 0.8** — AES-256-GCM · O(1) random access · lock-free concurrent reads |
| Build | **Bun** · Vite 5 · Sass |
| Fonts | MavenPro (Latin) + Hanazono MinchoA subset (CJK + kana, 4.6MB) |

### Dependency Cleanup

Removed heavy dependencies, replaced with native APIs or lightweight implementations:

| Removed | Replacement |
|---------|-------------|
| lodash | `src/Core/util/lite.ts` — `cloneDeep` → `structuredClone`, custom `omitBy`/`pickBy`/`throttle`/`isEqual` |
| localforage | Tauri `LazyStore` (auto-save, 100ms debounce) |
| mitt | Removed, direct calls |
| axios | Removed, Tauri IPC / `hexz://` protocol |
| cloudlogjs | Removed, `src/Core/util/logger.ts` |

### Tauri Plugins

| Plugin | Purpose |
|--------|---------|
| `plugin-store` | Save data / settings persistence |
| `plugin-fs` | Native file import / export |
| `plugin-dialog` | Native file picker dialogs |
| `plugin-process` | Process management |
| `plugin-single-instance` | Prevent multiple instances |
| `plugin-opener` | Open external links in system browser (WKWebView blocks `target="_blank"`) |

---

## Architecture

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'fontSize': '13px'}}}%%
flowchart LR
    subgraph Disk["💾 Distribution"]
        HXZ["📦 game.hxz<br/>AES-256-GCM encrypted<br/>random-access index"]
        APP["🖥️ webgal-k.app"]
        HXZ -. "independent of .app<br/>delta-patching friendly" .- APP
    end

    subgraph Rust["🦀 src-tauri/src/lib.rs"]
        Protocol["hexz:// protocol"]
        IPC["read_hexz_file IPC"]
        Store["Arc&lt;ResourcePack&gt;<br/>lock-free concurrent reads"]
    end

    subgraph JS["📦 hexzFetch.ts"]
        Text["hexzText() / hexzJson()"]
        Asset["assetSetter() → hexz://localhost/xxx"]
    end

    HXZ --> Protocol
    HXZ --> IPC
    Protocol -- "img/audio/video/font" --> Browser["🌐 WebView"]
    IPC -- "json/txt/scss" --> Text
    Text --> Browser
    Asset --> Protocol
    Asset --> Text
```

**Dual-channel design** — `hexz://` protocol for no-cors media, Tauri IPC for text resources (WKWebView blocks cross-origin XHR).

| Resource Type | Channel | Reason |
|---------------|---------|--------|
| images / audio / video / fonts | `hexz://` protocol | native browser support, zero overhead |
| json / txt / scss | Tauri IPC | WKWebView CORS restriction |

---

## Differences from Upstream WebGAL

### Asset Loading

| Upstream WebGAL | WebGAL_k |
|-----------------|----------|
| Assets scattered in `public/game/` | Packed into single `game.hxz` encrypted archive |
| Loaded via relative path `./game/xxx` | Loaded via `hexz://localhost/xxx` protocol |
| All requests use browser fetch/XHR | Dual channels: no-cors via protocol, text via IPC |
| Service Worker for caching/relay | No SW (WKWebView incompatible) |

### Security

| Upstream WebGAL | WebGAL_k |
|-----------------|----------|
| Assets stored in plaintext on disk | AES-256-GCM encryption |
| No native password support | `HEXZ_PASSWORD` env var for decryption |

### Distribution & Updates

| Upstream WebGAL | WebGAL_k |
|-----------------|----------|
| Web deployment, assets load with page | Desktop app via Tauri |
| Full redeploy on update | `.hxz` independent of executable, Steamworks delta patch ready |
| Client fetches full resource per request | O(1) random access, single-file reads on demand |

### Concurrency

| Upstream WebGAL | WebGAL_k |
|-----------------|----------|
| Browser-native concurrency | `Arc<ResourcePack>` lock-free, protocol + IPC parallel channels |

### Rendering Optimizations

| Upstream WebGAL | WebGAL_k |
|-----------------|----------|
| PIXI default resolution (Retina 2x) | `resolution: 1`, lower GPU memory |
| Default antialiasing | `antialias: false` |
| Font smoothing `antialiased` (grayscale) | `subpixel-antialiased` (macOS subpixel) |
| `setTimeout(0)` frame misalignment | `requestAnimationFrame` frame-aligned |
| No GPU texture cleanup on scene switch | `AssetLoader.clear()` releases GPU textures |
| Font 7.3MB (includes Latin/Hangul) | CJK + kana subset 4.6MB |

### Redux Purity

| Upstream WebGAL | WebGAL_k |
|-----------------|----------|
| Reducer calls `getStorage()` (I/O side effect) | Pure reducers, side effects at call sites |
| debounce implementation bug (always returns undefined) | Fixed as standard fire-and-forget debounce |
| `storeGet` returns `undefined` for missing keys | Normalized to `null` for consistent null checks |

---

## Build

```bash
# 1. Pack game assets into .hxz archive (unencrypted)
# You can also use the GUI tool for this step
cargo run --manifest-path hexz_k/Cargo.toml -- pack game/ game.hxz

# 2. Build desktop app
bun tauri build

# 3. Deploy: place game.hxz alongside the executable
cp game.hxz src-tauri/target/release/bundle/macos/webgal-k.app/Contents/MacOS/
```

`find_hexz()` searches exe directory, parent directory, and macOS `.app` bundle root.

---

## hexz Features in Use

| Feature | Implementation |
|---------|---------------|
| **Encryption** | AES-256-GCM, `HEXZ_PASSWORD` env var |
| **Random access** | O(1) index lookup, per-file reads |
| **Concurrent reads** | `Arc<ResourcePack>`, protocol + IPC in parallel |
| **Delta updates** | `.hxz` independent of executable, Steamworks-ready |

---

## License

MIT · Built on [WebGAL](https://github.com/OpenWebGAL/WebGAL)

