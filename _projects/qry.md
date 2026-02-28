---
title: Qry
stack: JavaScript · Chrome Manifest V3 · Fuse.js
summary: A keyboard-driven command palette for Chrome — instant tab search, workspace snapshots, split-view management, and browser control from a single shortcut.
github: https://github.com/pps-19012/qry
webstore: https://chromewebstore.google.com/detail/qry-your-browser-command/lglgfgnfgmgkgjhpohhdkhjdgfjakdmm
description: Qry is a Chrome extension that adds a keyboard-driven command palette for instant tab search, history, bookmarks, workspace snapshots, and split-view window management.
featured: true
order: 1
---

## The Problem

If you have 30+ tabs open, finding the right one is slow. You either scan through tiny favicons or Ctrl+Tab through them one by one. Browser history and bookmarks live behind separate menus. There's no single, fast way to search across everything and act on it from the keyboard.

## What I Built

<figure style="margin: 2rem 0;">
  <img src="{{ '/assets/projects/qry/qry-1.png' | relative_url }}" alt="Qry command palette showing tab search" style="width: 100%; border-radius: 4px; border: 1px solid var(--border-color);">
  <figcaption style="text-align: center; font-size: 0.85rem; color: var(--accent-color); margin-top: 0.5rem;">The command palette searching across open tabs</figcaption>
</figure>

Qry is a Chrome extension that adds a Spotlight/VS Code-style command palette to the browser. Hit **Cmd+Shift+Space** and a search bar appears over any page. From there you can:

- Search across all open tabs by title or URL and switch instantly
- Search browser history (`:h`) and bookmarks (`:b`)
- Run browser actions (`>`) — pin/mute tabs, split windows, clear cache
- Save workspace snapshots — capture all open tabs and restore them later
- Stash individual tabs — close them now, reopen with a keystroke later

Everything is keyboard-driven. No mouse needed.

<figure style="margin: 2rem 0;">
  <img src="{{ '/assets/projects/qry/qry-2.png' | relative_url }}" alt="Qry palette overlaid on a webpage" style="width: 100%; border-radius: 4px; border: 1px solid var(--border-color);">
  <figcaption style="text-align: center; font-size: 0.85rem; color: var(--accent-color); margin-top: 0.5rem;">The palette overlaid on any webpage — tab search with MRU ordering</figcaption>
</figure>

## How It Works

The extension runs across three isolated contexts that communicate via Chrome's message passing API:

- **Service Worker** — The brain. Handles all search logic, executes browser actions (tab switching, window splitting, stash/snapshot management), and tracks tab activation order for MRU ranking.
- **Content Script** — Injected into every page. Creates an isolated iframe for the palette UI and relays messages between the page and the service worker.
- **Palette UI** — Runs inside the iframe. Handles rendering search results, keyboard navigation, and the settings panel. Isolated from the host page's CSS/JS to avoid conflicts.

<figure style="margin: 2rem 0;">
  <img src="{{ '/assets/projects/qry/qry-3.png' | relative_url }}" alt="Qry actions menu" style="width: 100%; border-radius: 4px; border: 1px solid var(--border-color);">
  <figcaption style="text-align: center; font-size: 0.85rem; color: var(--accent-color); margin-top: 0.5rem;">Action commands — snapshots, stash, split view, pin, mute</figcaption>
</figure>

<figure style="margin: 2rem 0;">
  <img src="{{ '/assets/projects/qry/qry-4.png' | relative_url }}" alt="Qry bookmark search" style="width: 100%; border-radius: 4px; border: 1px solid var(--border-color);">
  <figcaption style="text-align: center; font-size: 0.85rem; color: var(--accent-color); margin-top: 0.5rem;">Bookmark search with the :b prefix</figcaption>
</figure>

## Key Design Decisions

- **Iframe isolation:** The palette runs in an iframe rather than being injected directly into the page DOM. This completely avoids CSS conflicts with websites and keeps the UI consistent everywhere.
- **Lazy content script injection:** Tabs opened before the extension was installed don't have the content script. Qry detects this and injects it on-demand when you first try to open the palette on that tab.
- **MRU tab ordering:** The default tab list is sorted by most-recently-used, not tab position. The tab you were just on is always at the top — one keystroke to switch back.
- **Fuzzy search:** Uses Fuse.js for intelligent matching. Typos and partial queries still find results.
- **Zero build tooling:** Pure ES6 modules with a single dependency (Fuse.js). No bundler, no compile step — just load and go.

## Features

- Prefix-based mode switching — `:h` history, `:b` bookmarks, `>` actions, default is tabs
- Split-view window management — snap current tab to left/right/top/bottom half of screen
- Workspace snapshots — save and restore entire sets of tabs
- Tab stashing — close now, restore later
- 6 themes (Chrome Dark/Light, Spotlight, VS Code, Gruvbox, Dracula) with 7 accent colors
- Adjustable opacity and interface scaling
- Full keyboard navigation throughout
