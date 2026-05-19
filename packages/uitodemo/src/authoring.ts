import type { DemoCursorVariant, DemoStep, DemoTimeline } from "./types";

type BaseStepOptions = {
  label?: string;
  cursor?: DemoCursorVariant;
};

type ClickStepOptions = BaseStepOptions & {
  hover?: boolean;
};

type TypeStepOptions = BaseStepOptions & {
  delay?: number;
};

type WaitStepOptions = {
  label?: string;
};

type ScrollStepOptions = BaseStepOptions & {
  align?: ScrollLogicalPosition;
  delay?: number;
};

type HighlightStepOptions = BaseStepOptions & {
  delay?: number;
};

export type DemoBuilder = {
  step: (step: DemoStep) => DemoBuilder;
  focus: (target: string, options?: BaseStepOptions) => DemoBuilder;
  type: (
    target: string,
    value: string,
    options?: TypeStepOptions,
  ) => DemoBuilder;
  click: (target: string, options?: ClickStepOptions) => DemoBuilder;
  wait: (delay: number, options?: WaitStepOptions) => DemoBuilder;
  scroll: (target: string, options?: ScrollStepOptions) => DemoBuilder;
  highlight: (target: string, options?: HighlightStepOptions) => DemoBuilder;
  build: () => DemoTimeline;
};

function createBuilder(seed: DemoTimeline = []): DemoBuilder {
  const steps = [...seed];

  const append = (step: DemoStep) => {
    steps.push(step);
    return builder;
  };

  const builder: DemoBuilder = {
    step(step) {
      return append(step);
    },
    focus(target, options = {}) {
      return append({
        type: "focus",
        target,
        ...options,
      });
    },
    type(target, value, options = {}) {
      return append({
        type: "type",
        target,
        value,
        ...options,
      });
    },
    click(target, options = {}) {
      return append({
        type: "click",
        target,
        ...options,
      });
    },
    wait(delay, options = {}) {
      return append({
        type: "wait",
        delay,
        ...options,
      });
    },
    scroll(target, options = {}) {
      return append({
        type: "scroll",
        target,
        ...options,
      });
    },
    highlight(target, options = {}) {
      return append({
        type: "highlight",
        target,
        ...options,
      });
    },
    build() {
      return [...steps];
    },
  };

  return builder;
}

export function demo(seed: DemoTimeline = []) {
  return createBuilder(seed);
}

export function demoTarget(target: string) {
  return {
    "demo-id": target,
  } as const;
}
