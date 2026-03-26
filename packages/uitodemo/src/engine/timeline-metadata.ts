import { DEFAULT_DEMO_TIMINGS } from "../config/defaults";
import type { DemoStep, DemoTimeline, DemoTimingConfig } from "../types";

export function getStepDuration(
  step: DemoStep,
  timings: DemoTimingConfig = DEFAULT_DEMO_TIMINGS,
) {
  if (step.type === "scroll") {
    return step.delay ?? timings.scrollSettleMs;
  }

  if (step.type === "click") {
    return timings.clickSettleMs + timings.clickActionMs;
  }

  if (step.type === "focus") {
    return 0;
  }

  if (step.type === "type") {
    return timings.typeSettleMs + (step.value?.length ?? 0) * (step.delay ?? 80);
  }

  if (step.type === "wait") {
    return step.delay ?? 0;
  }

  if (step.type === "highlight") {
    return step.delay ?? 0;
  }

  return 0;
}

export function getTimelineDuration(
  timeline: DemoTimeline,
  timings: DemoTimingConfig = DEFAULT_DEMO_TIMINGS,
) {
  return Math.max(
    1,
    timeline.reduce((total, step) => total + getStepDuration(step, timings), 0),
  );
}

export function getTimelineStepMeta(
  timeline: DemoTimeline,
  timings: DemoTimingConfig = DEFAULT_DEMO_TIMINGS,
) {
  const totalDuration = getTimelineDuration(timeline, timings);
  let elapsed = 0;

  return timeline.map((step, index) => {
    elapsed += getStepDuration(step, timings);

    return {
      index,
      label: step.label ?? `Step ${index + 1}`,
      progress: elapsed / totalDuration,
    };
  });
}
