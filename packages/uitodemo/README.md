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

Wrap your UI with `DemoPlayer`, add `data-demo` attributes to the elements you want to target, and pass a timeline.

```tsx
import { DemoPlayer, type DemoTimeline } from "uitodemo";

const timeline: DemoTimeline = [
  { type: "focus", target: "search", cursor: "text" },
  { type: "type", target: "search", value: "Cold brew", delay: 90, cursor: "text" },
  { type: "wait", delay: 500 },
  { type: "click", target: "product-1", cursor: "pointer", hover: true },
];

export function Example() {
  return (
    <DemoPlayer
      timeline={timeline}
      isActive
      cursor={{ enabled: true, hideNativeCursor: true }}
    >
      <div>
        <input data-demo="search" readOnly defaultValue="" />
        <button data-demo="product-1">Open product</button>
      </div>
    </DemoPlayer>
  );
}
```

## How to use it

1. Render your normal UI inside `DemoPlayer`.
2. Add `data-demo="some-id"` to the elements you want the demo to control.
3. Create a timeline with steps like `focus`, `type`, `scroll`, `click`, and `wait`.
4. Activate playback and let the story run.

## Basic example

```tsx
import { DemoPlayer, type DemoTimeline } from "uitodemo";

const timeline: DemoTimeline = [
  { type: "focus", target: "email", cursor: "text" },
  { type: "type", target: "email", value: "hello@uitodemo.dev", delay: 80, cursor: "text" },
  { type: "wait", delay: 400 },
  { type: "click", target: "continue", cursor: "pointer", hover: true },
];

export function SignupDemo() {
  return (
    <DemoPlayer timeline={timeline} isActive>
      <form>
        <input data-demo="email" readOnly defaultValue="" />
        <button type="button" data-demo="continue">
          Continue
        </button>
      </form>
    </DemoPlayer>
  );
}
```

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
  DemoPlayer,
  DEFAULT_DEMO_TIMINGS,
  type DemoCursorConfig,
  type DemoPlayerProps,
  type DemoStep,
  type DemoTimeline,
} from "uitodemo";
```

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
