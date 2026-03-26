import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_DEMO_TIMINGS,
  FRAME_BORDER_RADIUS_MAP,
  createTimelineRunner,
  getStepDuration,
  getTimelineDuration,
  resolveDemoTimeline,
  ROOT_DEMO_TARGET,
} from "../dist/testing.js";

function createFakeElement({
  tag = "div",
  dataset = {},
  rect = { top: 0, left: 0, width: 0, height: 0 },
  onClick,
  onScrollIntoView,
  parentElement = null,
  scrollHeight = 0,
  clientHeight = 0,
  scrollTop = 0,
  onScrollTo,
} = {}) {
  const listeners = new Map();

  return {
    dataset: { ...dataset },
    textContent: "",
    isContentEditable: false,
    parentElement,
    scrollHeight,
    clientHeight,
    scrollTop,
    click() {
      onClick?.();
      const handler = listeners.get("click");
      handler?.({ type: "click" });
    },
    focus() {},
    scrollIntoView(options) {
      onScrollIntoView?.(options);
    },
    scrollTo(options) {
      this.scrollTop = options.top;
      onScrollTo?.(options);
    },
    dispatchEvent(event) {
      const handler = listeners.get(event.type);
      handler?.(event);
      return true;
    },
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    matches(selector) {
      if (selector === "input,textarea,[contenteditable='true'],[data-slot='input-group-control']") {
        return tag === "input" || tag === "textarea";
      }

      return false;
    },
    closest(selector) {
      if (selector === "input,textarea,[contenteditable='true'],[data-slot='input-group-control']") {
        return tag === "input" || tag === "textarea" ? this : null;
      }

      return null;
    },
    getBoundingClientRect() {
      return rect;
    },
  };
}

function installFakeDomGlobals() {
  class FakeHTMLInputElement {}
  Object.defineProperty(FakeHTMLInputElement.prototype, "value", {
    get() {
      return this._value ?? "";
    },
    set(value) {
      this._value = value;
    },
    configurable: true,
  });

  class FakeHTMLTextAreaElement {}
  Object.defineProperty(FakeHTMLTextAreaElement.prototype, "value", {
    get() {
      return this._value ?? "";
    },
    set(value) {
      this._value = value;
    },
    configurable: true,
  });

  const previousWindow = globalThis.window;
  const previousInput = globalThis.HTMLInputElement;
  const previousTextarea = globalThis.HTMLTextAreaElement;
  const previousEvent = globalThis.Event;
  const previousGetComputedStyle = globalThis.getComputedStyle;

  globalThis.window = {
    setTimeout,
    clearTimeout,
    HTMLInputElement: FakeHTMLInputElement,
    HTMLTextAreaElement: FakeHTMLTextAreaElement,
    getComputedStyle(element) {
      return {
        overflowY: element.dataset.demoOverflowY ?? "visible",
      };
    },
  };
  globalThis.HTMLInputElement = FakeHTMLInputElement;
  globalThis.HTMLTextAreaElement = FakeHTMLTextAreaElement;
  globalThis.getComputedStyle = globalThis.window.getComputedStyle;
  globalThis.Event = class Event {
    constructor(type, init = {}) {
      this.type = type;
      this.bubbles = init.bubbles ?? false;
    }
  };

  return () => {
    if (previousWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = previousWindow;
    }

    if (previousInput === undefined) {
      delete globalThis.HTMLInputElement;
    } else {
      globalThis.HTMLInputElement = previousInput;
    }

    if (previousTextarea === undefined) {
      delete globalThis.HTMLTextAreaElement;
    } else {
      globalThis.HTMLTextAreaElement = previousTextarea;
    }

    if (previousEvent === undefined) {
      delete globalThis.Event;
    } else {
      globalThis.Event = previousEvent;
    }

    if (previousGetComputedStyle === undefined) {
      delete globalThis.getComputedStyle;
    } else {
      globalThis.getComputedStyle = previousGetComputedStyle;
    }
  };
}

function createFakeRoot(targets = {}) {
  return {
    querySelector(selector) {
      const match = selector.match(/\[data-demo="([^"]+)"\],\[data-demo-id="([^"]+)"\]/);
      const target = match?.[1] ?? match?.[2];
      return (target && targets[target]) || null;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: 1275, height: 750 };
    },
  };
}

function waitForStatus(statuses, expected, timeoutMs = 1000) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const check = () => {
      if (statuses.includes(expected)) {
        resolve();
        return;
      }

      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error(`Timed out waiting for status: ${expected}`));
        return;
      }

      setTimeout(check, 5);
    };

    check();
  });
}

test("getStepDuration includes highlight delay", () => {
  assert.equal(
    getStepDuration({ type: "highlight", target: "app", delay: 450 }),
    450,
  );
});

test("getStepDuration includes scroll settle timing", () => {
  assert.equal(
    getStepDuration({ type: "scroll", target: "product-8" }),
    DEFAULT_DEMO_TIMINGS.scrollSettleMs,
  );
});

test("getTimelineDuration accumulates timed steps", () => {
  const timeline = [
    { type: "highlight", target: "app", delay: 450 },
    { type: "wait", delay: 500 },
    { type: "type", target: "search", value: "Cold", delay: 100 },
  ];

  assert.equal(getTimelineDuration(timeline), 1990);
});

test("default timings expose shared runner and cursor config", () => {
  assert.equal(DEFAULT_DEMO_TIMINGS.scrollSettleMs, 700);
  assert.equal(DEFAULT_DEMO_TIMINGS.clickSettleMs, 520);
  assert.equal(DEFAULT_DEMO_TIMINGS.cursorStartStepMs, 520);
});

test("frame radius presets stay stable", () => {
  assert.deepEqual(FRAME_BORDER_RADIUS_MAP, {
    none: 0,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  });
});

test("resolveDemoTimeline prepends the cursor bootstrap step", () => {
  const resolved = resolveDemoTimeline(
    [{ type: "wait", delay: 500, label: "Pause" }],
    true,
    DEFAULT_DEMO_TIMINGS,
  );

  assert.equal(resolved[0]?.type, "highlight");
  assert.equal(resolved[0]?.target, ROOT_DEMO_TARGET);
  assert.equal(resolved[0]?.delay, DEFAULT_DEMO_TIMINGS.cursorStartStepMs);
});

test("createTimelineRunner completes click and wait steps", async () => {
  const restoreDomGlobals = installFakeDomGlobals();
  const clicked = [];
  const root = createFakeRoot({
    cta: createFakeElement({
      dataset: { demo: "cta" },
      onClick: () => clicked.push("cta"),
    }),
  });
  const statuses = [];
  const steps = [];
  const progress = [];

  const runner = createTimelineRunner({
    root,
    timeline: [
      { type: "click", target: "cta", cursor: "pointer" },
      { type: "wait", delay: 30 },
    ],
    timings: {
      ...DEFAULT_DEMO_TIMINGS,
      clickSettleMs: 5,
      clickActionMs: 5,
    },
    onStatusChange: (status) => statuses.push(status),
    onStepChange: (stepIndex) => steps.push(stepIndex),
    onProgressChange: (value) => progress.push(value),
  });

  runner.play();
  await waitForStatus(statuses, "completed");

  assert.deepEqual(clicked, ["cta"]);
  assert.equal(statuses.at(-1), "completed");
  assert.deepEqual(steps.slice(0, 2), [0, 1]);
  assert.equal(progress.at(-1), 1);
  restoreDomGlobals();
});

test("createTimelineRunner executes scroll steps before continuing", async () => {
  const restoreDomGlobals = installFakeDomGlobals();
  const scrollCalls = [];
  const scrollContainer = createFakeElement({
    dataset: { demoOverflowY: "auto" },
    rect: { top: 100, left: 0, width: 600, height: 320 },
    scrollHeight: 1200,
    clientHeight: 320,
    onScrollTo: (options) => scrollCalls.push(options),
  });
  const clicked = [];
  const product = createFakeElement({
    dataset: { demo: "product" },
    rect: { top: 580, left: 0, width: 300, height: 80 },
    parentElement: scrollContainer,
  });
  const root = createFakeRoot({
    product,
    cta: createFakeElement({
      dataset: { demo: "cta" },
      onClick: () => clicked.push("cta"),
    }),
  });
  const statuses = [];

  const runner = createTimelineRunner({
    root,
    timeline: [
      { type: "scroll", target: "product", align: "center", delay: 15, cursor: "arrow" },
      { type: "click", target: "cta", cursor: "pointer" },
    ],
    timings: {
      ...DEFAULT_DEMO_TIMINGS,
      clickSettleMs: 5,
      clickActionMs: 5,
    },
    onStatusChange: (status) => statuses.push(status),
  });

  runner.play();
  await waitForStatus(statuses, "completed");

  assert.equal(scrollCalls.length, 1);
  assert.equal(scrollCalls[0].behavior, "smooth");
  assert.equal(scrollCalls[0].top, 360);
  assert.deepEqual(clicked, ["cta"]);
  restoreDomGlobals();
});

test("scroll step snaps to the true top when start target is already near it", async () => {
  const restoreDomGlobals = installFakeDomGlobals();
  const scrollCalls = [];
  const scrollContainer = createFakeElement({
    dataset: { demoOverflowY: "auto" },
    rect: { top: 100, left: 0, width: 600, height: 320 },
    scrollHeight: 1200,
    clientHeight: 320,
    scrollTop: 120,
    onScrollTo: (options) => scrollCalls.push(options),
  });
  const topAnchor = createFakeElement({
    dataset: { demo: "catalog-top" },
    rect: { top: 110, left: 0, width: 300, height: 1 },
    parentElement: scrollContainer,
  });
  const statuses = [];

  const runner = createTimelineRunner({
    root: createFakeRoot({ "catalog-top": topAnchor }),
    timeline: [{ type: "scroll", target: "catalog-top", align: "start", delay: 15 }],
    timings: DEFAULT_DEMO_TIMINGS,
    onStatusChange: (status) => statuses.push(status),
  });

  runner.play();
  await waitForStatus(statuses, "completed");

  assert.equal(scrollCalls.length, 1);
  assert.deepEqual(scrollCalls[0], {
    top: 0,
    behavior: "smooth",
  });
  restoreDomGlobals();
});

test("createTimelineRunner seek applies prior type steps instantly", async () => {
  const restoreDomGlobals = installFakeDomGlobals();
  const input = createFakeElement({
    tag: "input",
    dataset: { demo: "search" },
  });
  let inputEvents = 0;
  input.addEventListener("input", () => {
    inputEvents += 1;
  });
  Object.setPrototypeOf(input, globalThis.HTMLInputElement.prototype);

  const root = createFakeRoot({
    search: input,
    cta: createFakeElement({ dataset: { demo: "cta" } }),
  });
  const statuses = [];
  const steps = [];

  const runner = createTimelineRunner({
    root,
    timeline: [
      { type: "type", target: "search", value: "Cold", delay: 5, cursor: "text" },
      { type: "click", target: "cta", cursor: "pointer" },
    ],
    timings: {
      ...DEFAULT_DEMO_TIMINGS,
      typeSettleMs: 5,
      clickSettleMs: 5,
      clickActionMs: 5,
    },
    onStatusChange: (status) => statuses.push(status),
    onStepChange: (stepIndex) => steps.push(stepIndex),
  });

  await runner.seek(1, false);

  assert.equal(input.value, "Cold");
  assert.ok(inputEvents >= 2);
  assert.equal(statuses.at(-1), "paused");
  assert.equal(steps.at(-1), 1);
  restoreDomGlobals();
});

test("createTimelineRunner restart returns to the first step and plays again", async () => {
  const restoreDomGlobals = installFakeDomGlobals();
  const clicked = [];
  const root = createFakeRoot({
    cta: createFakeElement({
      dataset: { demo: "cta" },
      onClick: () => clicked.push("cta"),
    }),
  });
  const statuses = [];
  const steps = [];

  const runner = createTimelineRunner({
    root,
    timeline: [{ type: "click", target: "cta", cursor: "pointer" }],
    timings: {
      ...DEFAULT_DEMO_TIMINGS,
      clickSettleMs: 5,
      clickActionMs: 5,
    },
    onStatusChange: (status) => statuses.push(status),
    onStepChange: (stepIndex) => steps.push(stepIndex),
  });

  runner.play();
  await waitForStatus(statuses, "completed");
  runner.restart();
  await new Promise((resolve) => setTimeout(resolve, 30));

  assert.equal(clicked.length, 2);
  assert.equal(statuses.at(-1), "completed");
  assert.deepEqual(steps.slice(0, 3), [0, 0, 0]);
  restoreDomGlobals();
});
