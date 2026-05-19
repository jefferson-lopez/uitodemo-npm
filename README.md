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

Start with the authoring helpers. They make the API much easier to read.

```tsx
import { DemoPlayer, demo, demoTarget } from "uitodemo";

const steps = demo()
  .focus("search", { cursor: "text" })
  .type("search", "Cold brew", { delay: 90, cursor: "text" })
  .wait(500)
  .click("result-1", { cursor: "pointer", hover: true })
  .build();

export function ProductDemo() {
  return (
    <DemoPlayer
      steps={steps}
      isActive
      cursor={{ enabled: true, hideNativeCursor: true }}
    >
      <div>
        <input {...demoTarget("search")} readOnly defaultValue="" />
        <button {...demoTarget("result-1")}>Open product</button>
      </div>
    </DemoPlayer>
  );
}
```

## Quick path

1. Build steps with `demo()`.
2. Mark targets with `demoTarget("id")` or `demo-id="id"`.
3. Pass `steps` or `timeline` into `DemoPlayer`.
4. Let `uitodemo` play the sequence.

## Recommended convention

Use one convention only:

- write targets with `demoTarget("search")`
- which renders `demo-id="search"`

That keeps the API easy to remember and avoids “black box” magic.

## Compound API

You can also compose the player in visible pieces:

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
  .click("result-1", { cursor: "pointer", hover: true })
  .build();

<DemoPlayer steps={steps} isActive>
  <DemoStage>
    <div>
      <input {...demoTarget("search")} readOnly defaultValue="" />
      <button {...demoTarget("result-1")}>Open product</button>
    </div>
  </DemoStage>
  <DemoOverlay />
  <DemoControls />
</DemoPlayer>;
```

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
