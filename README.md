# l2d-widget

A lightweight Live2D widget for the web. Drop a Live2D model onto any page with a single function call.

[中文](./README.zh.md)

## Features

- One-line setup via `createWidget()`
- Supports Cubism 2 and Cubism 6 models
- Multi-model switching with smooth transition animations
- Hover-activated menu with [Iconify](https://iconify.design/) icons
- Tip bubbles with typing animation and lip-sync support
- Status bar for loading and sleep states
- Slide or fade entrance/exit transitions
- Zero UI framework dependencies — pure DOM + CSS animations
- Ships as ES module and IIFE (CDN-ready)

## Installation

```bash
npm install l2d-widget
```

Or use a CDN:

```html
<script src="https://unpkg.com/l2d-widget/dist/index.min.js"></script>
```

## Quick Start

```ts
import { createWidget } from 'l2d-widget';

const widget = createWidget({
  model: {
    path: 'https://model.hacxy.cn/cat-black/model.json',
  },
});
```

This renders a Live2D model at the bottom-left corner of the page with default settings.

## Options

### `WidgetOptions`

| Option               | Type                              | Default                  | Description                                           |
| -------------------- | --------------------------------- | ------------------------ | ----------------------------------------------------- |
| `model`              | `ModelOptions \| ModelOptions[]`  | _required_               | Model config. Pass an array for multi-model switching |
| `position`           | `'bottom-left' \| 'bottom-right'` | `'bottom-left'`          | Widget position on screen                             |
| `size`               | `number \| { width, height }`     | `300`                    | Canvas size in px                                     |
| `primaryColor`       | `string`                          | `'rgba(96,165,250,0.9)'` | Theme color for menu, status bar, tips                |
| `transitionDuration` | `number`                          | `1500`                   | Entrance/exit animation duration (ms)                 |
| `transitionType`     | `'slide' \| 'fade'`               | `'slide'`                | Animation type                                        |
| `menus`              | `MenusOptions`                    | —                        | Menu configuration                                    |

### `ModelOptions`

| Option     | Type                                     | Default    | Description                             |
| ---------- | ---------------------------------------- | ---------- | --------------------------------------- |
| `path`     | `string`                                 | _required_ | Path to `.model.json` or `.model3.json` |
| `scale`    | `number`                                 | `1`        | Model scale                             |
| `offset`   | `[x, y]`                                 | —          | Position offset, range roughly -2 ~ 2   |
| `volume`   | `number`                                 | `0`        | Motion sound volume (0~1)               |
| `logLevel` | `'error' \| 'warn' \| 'info' \| 'trace'` | `'warn'`   | Log level                               |
| `tips`     | `TipsOptions`                            | —          | Per-model tips configuration            |

### `MenusOptions`

| Option       | Type                | Default   | Description                      |
| ------------ | ------------------- | --------- | -------------------------------- |
| `items`      | `MenuItem[]`        | —         | Fully replace default menu items |
| `extraItems` | `MenuItem[]`        | —         | Append to default menu           |
| `align`      | `'left' \| 'right'` | `'right'` | Menu alignment                   |

### `TipsOptions`

| Option            | Type         | Default           | Description                                           |
| ----------------- | ------------ | ----------------- | ----------------------------------------------------- |
| `welcomeMessage`  | `string[]`   | Built-in messages | Random welcome message on first appearance            |
| `messages`        | `string[]`   | Built-in messages | Looping tip messages                                  |
| `duration`        | `number`     | `3000`            | Display duration per tip (ms)                         |
| `interval`        | `number`     | `5000`            | Interval between tips (ms)                            |
| `offset`          | `{ x?, y? }` | —                 | Position offset in px                                 |
| `typing`          | `object`     | —                 | Enable typing animation and lip-sync                  |
| `typing.param`    | `string`     | —                 | Lip-sync parameter name (e.g. `'PARAM_MOUTH_OPEN_Y'`) |
| `typing.speed`    | `number`     | `100`             | Typing speed (ms/char)                                |
| `typing.minValue` | `number`     | `0.5`             | Min mouth open value (0~1)                            |
| `typing.maxValue` | `number`     | `1`               | Max mouth open value (0~1)                            |

## Examples

### Position & Transition

```ts
createWidget({
  model: { path: '/models/my-model/model.json' },
  position: 'bottom-right',
  transitionType: 'fade',
});
```

### Multi-Model Switching

```ts
createWidget({
  model: [
    { path: '/models/cat-black/model.json' },
    { path: '/models/cat-white/model.json' },
  ],
});
```

A shuffle button appears automatically in the menu when multiple models are provided.

### Custom Menu Items

```ts
createWidget({
  model: { path: '/models/cat-black/model.json' },
  menus: {
    extraItems: [
      {
        icon: 'mdi:emoticon-happy-outline',
        label: 'Play motion',
        onClick(widget) {
          const motions = widget.l2d.getMotions();
          const groups = Object.keys(motions);
          if (groups.length > 0) {
            widget.l2d.playMotion(groups[0]!);
          }
        },
      },
    ],
  },
});
```

### Typing Animation with Lip-Sync

```ts
createWidget({
  model: {
    path: '/models/cat-black/model.json',
    tips: {
      typing: {
        param: 'PARAM_MOUTH_OPEN_Y',
        speed: 200,
      },
      welcomeMessage: ['Hello!', 'Nice to meet you!'],
      messages: ['Take a break~', 'Stay hydrated!'],
      duration: 4000,
      interval: 6000,
    },
  },
});
```

## Widget Instance

`createWidget()` returns a `Widget` object:

| Property / Method    | Description                                               |
| -------------------- | --------------------------------------------------------- |
| `l2d`                | Underlying `l2d` instance for advanced usage              |
| `switchModel(index)` | Switch to a model by index (async)                        |
| `sleep()`            | Hide model and show a "resting" status bar; click to wake |
| `destroy()`          | Tear down the widget, release WebGL resources, remove DOM |

## Project Structure

```
src/
├── index.ts           # Public API exports
├── types.ts           # TypeScript interfaces
├── widget.ts          # Core createWidget() logic
├── defaults.ts        # Default menu items
└── modules/
    ├── menu.ts        # Hover menu with Iconify icons
    ├── tips.ts        # Tip bubble with typing animation
    └── status-bar.ts  # Loading / sleep status bar
```

## Development

```bash
pnpm install
pnpm dev          # Watch build with sourcemaps
pnpm demo         # Start demo server at localhost:3000
pnpm build        # Production build
pnpm lint         # Lint
```

## License

[MIT](LICENSE)

---

> 中文文档请见 [README.zh.md](./README.zh.md)
