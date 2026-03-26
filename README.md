# `uitodemo`

`uitodemo` is a React library for showing product demos with real UI.

Instead of recording a video, you render your actual interface and describe the story with a small timeline. `uitodemo` replays the flow with typing, clicking, scrolling, pauses, and a simulated cursor so the demo feels alive without becoming hard to maintain.

It is useful for:

- landing pages
- product walkthroughs
- onboarding flows
- documentation pages
- lightweight interactive demos

## Why use it

Most product demos are either videos that go out of date fast, or custom animations that take too much effort to maintain.

`uitodemo` gives you a simpler approach:

- use your real components
- script the interaction once
- update the demo as your product changes
- keep the result embedded directly in your site or app

## Installation

Install the package with npm:

```bash
npm i uitodemo
```

You can also use `pnpm add uitodemo` or `yarn add uitodemo`.

## Quick usage

Wrap your UI with `DemoPlayer`, mark the elements you want to target with `data-demo`, and pass a timeline.

```tsx
import { DemoPlayer, type DemoTimeline } from "uitodemo";

const timeline: DemoTimeline = [
  { type: "focus", target: "search", cursor: "text" },
  { type: "type", target: "search", value: "Cold brew", delay: 90, cursor: "text" },
  { type: "wait", delay: 500 },
  { type: "click", target: "result-1", cursor: "pointer", hover: true },
];

export function ProductDemo() {
  return (
    <DemoPlayer
      timeline={timeline}
      isActive
      cursor={{ enabled: true, hideNativeCursor: true }}
    >
      <div>
        <input data-demo="search" readOnly defaultValue="" />
        <button data-demo="result-1">Open product</button>
      </div>
    </DemoPlayer>
  );
}
```

## How it works

1. Render your normal interface inside `DemoPlayer`.
2. Add `data-demo="some-id"` to the parts of the UI you want to control.
3. Create a timeline with steps like `focus`, `type`, `scroll`, `click`, and `wait`.
4. Let `uitodemo` play the sequence for you.

## Good use cases

- show a search flow in a hero section
- preview a dashboard interaction before signup
- explain a feature in docs without recording a video
- simulate onboarding steps with believable UI behavior

## Monorepo

This repository also includes the demo website used to showcase the package and develop it locally.

```text
apps/www             # demo site
packages/uitodemo    # npm package
```

If you want more package details and additional examples, see `packages/uitodemo/README.md`.
