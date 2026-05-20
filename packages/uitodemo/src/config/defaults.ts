import type {
  DemoPerformanceProfile,
  DemoRadiusPreset,
  DemoStep,
  DemoTimingConfig,
  DemoTimeline,
} from "../types";

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

export type DemoPerformanceTuning = {
  metricsCommitIntervalMs: number;
  timeSyncIntervalMs: number;
  pausePollIntervalMs: number;
  typeChunkSize: number;
  inViewAmount: number;
  cursorClickPulseDefault: boolean;
};

export function getDemoPerformanceTuning(
  profile: DemoPerformanceProfile = "default",
): DemoPerformanceTuning {
  if (profile === "marketing") {
    return {
      metricsCommitIntervalMs: 500,
      timeSyncIntervalMs: 500,
      pausePollIntervalMs: 200,
      typeChunkSize: 3,
      inViewAmount: 0.2,
      cursorClickPulseDefault: false,
    };
  }

  return {
    metricsCommitIntervalMs: 250,
    timeSyncIntervalMs: 250,
    pausePollIntervalMs: 125,
    typeChunkSize: 1,
    inViewAmount: 0.2,
    cursorClickPulseDefault: true,
  };
}

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
