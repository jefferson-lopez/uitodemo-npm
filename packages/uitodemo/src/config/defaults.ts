import type { DemoRadiusPreset, DemoStep, DemoTimingConfig, DemoTimeline } from "../types";

export const ROOT_DEMO_TARGET = "app";

export const FRAME_BORDER_RADIUS_MAP: Record<DemoRadiusPreset, number> = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

export const DEFAULT_DEMO_TIMINGS: DemoTimingConfig = {
  scrollSettleMs: 700,
  clickSettleMs: 520,
  clickActionMs: 180,
  typeSettleMs: 640,
  cursorClickSettleMs: 520,
  cursorClickPressMs: 180,
  cursorStartStepMs: 520,
  pointerActivityMs: 1600,
};

export function resolveDemoTimeline(
  timeline: DemoTimeline,
  cursorEnabled: boolean,
  timings: DemoTimingConfig,
) {
  if (!cursorEnabled) return timeline;

  const firstStep = timeline[0];
  const alreadyStartsAtRoot =
    firstStep?.type === "highlight" &&
    firstStep.target === ROOT_DEMO_TARGET &&
    firstStep.cursor === "arrow";

  if (alreadyStartsAtRoot) return timeline;

  const startStep: DemoStep = {
    type: "highlight",
    target: ROOT_DEMO_TARGET,
    cursor: "arrow",
    label: "Start",
    delay: timings.cursorStartStepMs,
  };

  return [startStep, ...timeline];
}
