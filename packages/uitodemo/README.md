# `uitodemo`

`uitodemo` is a React library for showing product demos with real UI.

Instead of exporting a video, you render your actual interface and describe the flow with a timeline. The library replays typing, clicks, scrolling, pauses, and cursor movement so the demo feels interactive while staying easy to maintain.

It works well for:

- landing pages
- product walkthroughs
- onboarding flows
- documentation examples
- in-app feature previews

## Installation

```bash
npm i uitodemo
```

You can also use:

```bash
pnpm add uitodemo
yarn add uitodemo
```

## Quick start

Use the authoring helpers first. They make the API feel much less like an internal engine.

```tsx
import { DemoPlayer, demo, demoTarget } from "uitodemo";

const steps = demo()
  .focus("search", { cursor: "text" })
  .type("search", "Cold brew", { delay: 90, cursor: "text" })
  .wait(500)
  .click("product-1", { cursor: "pointer", hover: true })
  .build();

export function Example() {
  return (
    <DemoPlayer
      steps={steps}
      isActive
      cursor={{ enabled: true, hideNativeCursor: true }}
    >
      <div>
        <input {...demoTarget("search")} readOnly defaultValue="" />
        <button {...demoTarget("product-1")}>Open product</button>
      </div>
    </DemoPlayer>
  );
}
```

## Quick path

1. Build steps with `demo()`.
2. Mark targets with `demoTarget("id")` or `demo-id="id"`.
3. Pass `steps` or `timeline` into `DemoPlayer`.
4. Turn on `isActive`.

## Recommended convention

Use **one target convention only**:

- Public helper: `demoTarget("search")`
- DOM output: `demo-id="search"`

That keeps the authoring API simple and the DOM contract explicit.

## Two authoring styles

### 1) Recommended: builder style

```tsx
import { DemoPlayer, demo, demoTarget } from "uitodemo";

const steps = demo()
  .focus("email", { cursor: "text" })
  .type("email", "hello@uitodemo.dev", { delay: 80, cursor: "text" })
  .wait(400)
  .click("continue", { cursor: "pointer", hover: true })
  .build();

export function SignupDemo() {
  return (
    <DemoPlayer steps={steps} isActive>
      <form>
        <input {...demoTarget("email")} readOnly defaultValue="" />
        <button type="button" {...demoTarget("continue")}>
          Continue
        </button>
      </form>
    </DemoPlayer>
  );
}
```

### 2) Advanced: raw timeline objects

```tsx
import { DemoPlayer, type DemoTimeline } from "uitodemo";

const timeline: DemoTimeline = [
  { type: "focus", target: "email", cursor: "text" },
  { type: "type", target: "email", value: "hello@uitodemo.dev", delay: 80, cursor: "text" },
  { type: "wait", delay: 400 },
  { type: "click", target: "continue", cursor: "pointer", hover: true },
];

<DemoPlayer timeline={timeline} isActive>{/* ... */}</DemoPlayer>;
```

## Compound components

For a more composable API, you can now split the player into visible pieces:

```tsx
import {
  DemoControls,
  DemoOverlay,
  DemoPlayer,
  DemoStage,
  demo,
  demoTarget,
} from "uitodemo";

const steps = demo()
  .focus("search", { cursor: "text" })
  .type("search", "Cold brew", { delay: 90, cursor: "text" })
  .click("product-1", { cursor: "pointer", hover: true })
  .build();

export function HeroDemo() {
  return (
    <DemoPlayer steps={steps} isActive>
      <DemoStage>
        <div>
          <input {...demoTarget("search")} readOnly defaultValue="" />
          <button {...demoTarget("product-1")}>Open product</button>
        </div>
      </DemoStage>
      <DemoOverlay />
      <DemoControls />
    </DemoPlayer>
  );
}
```

Available pieces:

- `DemoStage` → the actual interactive demo surface
- `DemoOverlay` → cursor layer and centered play/restart overlay
- `DemoControls` → bottom playback controls
- `DemoProgress` → progress bar primitive you can use separately

## What the package includes

- `DemoPlayer` for rendering and replaying the demo
- `DemoControls` for optional playback controls
- timeline helpers and playback hooks
- simulated cursor support
- testing helpers from `uitodemo/testing`

## Public API

Import the package from the root:

```tsx
import {
  DemoControls,
  DemoOverlay,
  DemoPlayer,
  DemoProgress,
  DemoStage,
  DEFAULT_DEMO_TIMINGS,
  demo,
  demoTarget,
  type DemoBuilder,
  type DemoCursorConfig,
  type DemoPlayerProps,
  type DemoStep,
  type DemoTimeline,
} from "uitodemo";
```

## API shape

| API | Use it for |
|-----|------------|
| `demo()` | Build timelines fluently with autocomplete |
| `demoTarget("id")` | Mark DOM targets and generate `demo-id` |
| `steps` | Friendly prop name for most usage |
| `timeline` | Advanced/raw timeline authoring |
| `DemoStage` | Stage primitive for compound composition |
| `DemoOverlay` | Cursor and centered overlay primitive |
| `DemoControls` | Drop-in playback controls |
| `DemoProgress` | Standalone progress primitive |
| `DEFAULT_DEMO_TIMINGS` | Shared timing defaults and overrides |

## Choose the right API level

| If you want... | Use |
|---|---|
| The easiest authoring path | `demo()` + `demoTarget()` + `steps` |
| Full low-level control | raw `timeline` objects |
| Timing customization | `timings` |
| Built-in controls | `DemoControls` or `renderControls` |

For tests and timeline metadata helpers:

```tsx
import {
  createTimelineRunner,
  getStepDuration,
  getTimelineDuration,
  resolveDemoTimeline,
} from "uitodemo/testing";
```

## Good use cases

- show a search flow in a homepage hero
- preview dashboard interactions before signup
- explain a feature in docs without recording a video
- build believable onboarding simulations with real components

## Development

Inside this repository, the package lives in `packages/uitodemo` and the demo site lives in `apps/www`.

## Publish

From the monorepo root:

```bash
pnpm publish:uitodemo
```

Or directly from the package:

```bash
cd packages/uitodemo
npm publish --access public
```
