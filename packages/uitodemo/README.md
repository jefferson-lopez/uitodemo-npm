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
- timeline engine
- playback hooks
- DOM helpers for `click`, `scroll`, `type`, `wait`, `highlight`
- simulated cursor support

## Folder architecture

The package is split into a few focused layers:

- `src/components`: rendering primitives such as `DemoPlayer` and `DemoControls`
- `src/hooks`: playback and cursor coordination hooks
- `src/engine`: timeline runner and DOM action execution
- `src/cursor`: cursor geometry and positioning helpers
- `src/config`: shared defaults such as timings, root target setup, and frame radius presets

This separation keeps the runner logic reusable while the demo presentation stays in the component layer.

## Public API

For normal usage, import only from the package root:

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

For tests and timeline metadata helpers, use the testing subpath:

```tsx
import {
  createTimelineRunner,
  getStepDuration,
  getTimelineDuration,
  resolveDemoTimeline,
} from "uitodemo/testing";
```

## Core idea

You render your real UI inside `DemoPlayer` and annotate clickable/typable elements with `data-demo="target-id"`.

Then you pass a timeline:

```tsx
const timeline = [
  { type: "focus", target: "search", cursor: "text", label: "Focus search" },
  { type: "type", target: "search", value: "Coffee", delay: 90, cursor: "text" },
  { type: "scroll", target: "product-1", align: "center", delay: 700, cursor: "arrow", label: "Bring product into view" },
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
  { type: "scroll", target: "row-1", align: "center", delay: 700, cursor: "arrow" },
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

## Timing configuration

The player exposes shared timing overrides through the `timings` prop.

```tsx
<DemoPlayer
  timeline={timeline}
  isActive
  timings={{
    clickSettleMs: 450,
    clickActionMs: 320,
    typeSettleMs: 1000,
  }}
>
  <YourUI />
</DemoPlayer>
```

You can also import the built-in defaults:

```tsx
import { DEFAULT_DEMO_TIMINGS } from "uitodemo";
```

These defaults are meant to control the baseline rhythm of the player:

- cursor arrival before a press begins
- click press duration before `element.click()`
- default settle time for scroll steps
- initial pause before typing starts
- how long playback controls stay visible after pointer activity

Use the timeline for intentional storytelling beats such as "pause and let the user read this card". Use `timings` for the global feel of the player.

## Recipes

### 1. Search and open a result

```tsx
const timeline: DemoTimeline = [
  { type: "focus", target: "search", cursor: "text", label: "Focus search" },
  { type: "type", target: "search", value: "Cold brew", delay: 90, cursor: "text" },
  { type: "wait", delay: 500, label: "Pause briefly" },
  { type: "click", target: "product-2", cursor: "pointer", hover: true, label: "Open product" },
];
```

### 2. Simulate a real UI action on click

`click` steps call `element.click()`, so the target can mutate live state.

```tsx
function Example() {
  const [items, setItems] = useState([{ id: "product-1", name: "Cold Brew" }]);

  return (
    <DemoPlayer
      timeline={[
        { type: "click", target: "remove-product-1", cursor: "pointer", hover: true },
      ]}
      isActive
    >
      <button
        type="button"
        data-demo="remove-product-1"
        onClick={() => {
          setItems((current) => current.filter((item) => item.id !== "product-1"));
        }}
      >
        Remove
      </button>
    </DemoPlayer>
  );
}
```

### 3. Scroll to a target before clicking it

```tsx
const timeline: DemoTimeline = [
  { type: "scroll", target: "product-8", align: "center", delay: 700, cursor: "arrow", label: "Scroll to product" },
  { type: "click", target: "product-8", cursor: "pointer", hover: true, label: "Open product" },
];
```

### 4. Use your own controls renderer

```tsx
import { DemoControls, DemoPlayer } from "uitodemo";

<DemoPlayer
  timeline={timeline}
  isActive
  renderControls={(controls) => <DemoControls {...controls} />}
>
  <YourUI />
</DemoPlayer>;
```

### 5. Adjust the frame shell without touching the core UI

```tsx
<DemoPlayer
  timeline={timeline}
  isActive
  className="shadow-2xl"
  frameBorderRadius="lg"
>
  <YourUI />
</DemoPlayer>
```

Use `frameBorderRadius` for the visible stage radius. Styling the outer `className` alone does not change the inner frame rounding.

### 6. Dashboard flow with live state changes

```tsx
function Example() {
  const [items, setItems] = useState([
    { id: "product-1", name: "Cold Brew" },
    { id: "product-2", name: "Oat Latte" },
  ]);

  return (
    <DemoPlayer
      isActive
      cursor={{ enabled: true, hideNativeCursor: true }}
      timeline={[
        { type: "click", target: "product-2", cursor: "pointer", hover: true, label: "Open product" },
        { type: "wait", delay: 500, label: "Read details" },
        { type: "click", target: "remove-product-2", cursor: "pointer", hover: true, label: "Remove product" },
      ]}
    >
      <div>
        {items.map((item) => (
          <article key={item.id} data-demo={item.id}>
            <strong>{item.name}</strong>
            <button
              type="button"
              data-demo={`remove-${item.id}`}
              onClick={() => {
                setItems((current) => current.filter((entry) => entry.id !== item.id));
              }}
            >
              Remove
            </button>
          </article>
        ))}
      </div>
    </DemoPlayer>
  );
}
```

## Cursor assets

The package now resolves its built-in cursor artwork internally. Consumers do not need to copy files into `public/`.

## Testing

From the monorepo root:

```bash
pnpm --filter uitodemo test
```

This runs a small baseline suite against the built package for timing metadata and exported defaults.

The current test coverage focuses on:

- duration metadata
- exported defaults
- auto-injected cursor bootstrap step
- runner playback for `click`, `wait`, `seek`, and `restart`

## Monorepo context

Inside this repo, the package lives at `packages/uitodemo` and the demo site at `apps/www`.

## Build

From the monorepo root:

```bash
pnpm --filter uitodemo build
```

## Publishing notes

Consumers can install the package and use it directly without copying static cursor files.
