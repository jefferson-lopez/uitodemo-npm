# `uitodemo`

`uitodemo` is a small timeline-driven UI demo player extracted from the landing demo system in this repo.

It is designed for:

- product walkthroughs
- hero demos
- onboarding simulations
- fake but believable in-app interactions

## What it includes

- `DemoPlayer`: the main player component
- `DemoControls`: optional playback controls
- `DemoHighlight`: optional target highlight overlay
- timeline engine
- playback hooks
- DOM helpers for `click`, `type`, `wait`, `highlight`
- simulated cursor support

## Core idea

You render your real UI inside `DemoPlayer` and annotate clickable/typable elements with `data-demo="target-id"`.

Then you pass a timeline:

```tsx
const timeline = [
  { type: "focus", target: "search", cursor: "text", label: "Focus search" },
  { type: "type", target: "search", value: "Coffee", delay: 90, cursor: "text" },
  { type: "wait", delay: 600, label: "Review results" },
  { type: "click", target: "product-1", cursor: "pointer", hover: true, label: "Open product" },
];
```

## Quick example

```tsx
import { DemoPlayer, type DemoTimeline } from "uitodemo";

const timeline: DemoTimeline = [
  { type: "focus", target: "search", cursor: "text" },
  { type: "type", target: "search", value: "Coffee", delay: 90, cursor: "text" },
  { type: "wait", delay: 500 },
  { type: "click", target: "row-1", cursor: "pointer", hover: true },
];

export function Example() {
  return (
    <DemoPlayer
      timeline={timeline}
      isActive
      frameBorderRadius="xl"
      cursor={{
        enabled: true,
        theme: "black",
        hideNativeCursor: true,
      }}
    >
      <div>
        <input data-demo="search" readOnly defaultValue="" />
        <button data-demo="row-1">Open</button>
      </div>
    </DemoPlayer>
  );
}
```

## Cursor assets

The package now resolves its built-in cursor artwork internally. Consumers do not need to copy files into `public/`.

## Monorepo context

Inside this repo, the package lives at `packages/uitodemo` and the demo site at `apps/www`.

## Build

From the monorepo root:

```bash
pnpm --filter uitodemo build
```

## Publishing notes

Consumers can install the package and use it directly without copying static cursor files.
