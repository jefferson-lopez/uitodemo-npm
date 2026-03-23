import type { DemoStep, DemoTimeline } from "../types";

export function getStepDuration(step: DemoStep) {
  if (step.type === "type") {
    return (step.value?.length ?? 0) * (step.delay ?? 80);
  }

  if (step.type === "wait") {
    return step.delay ?? 0;
  }

  if (step.type === "highlight") {
    return step.delay ?? 0;
  }

  return 0;
}

export function getTimelineDuration(timeline: DemoTimeline) {
  return Math.max(
    1,
    timeline.reduce((total, step) => total + getStepDuration(step), 0),
  );
}

export function getTimelineStepMeta(timeline: DemoTimeline) {
  const totalDuration = getTimelineDuration(timeline);
  let elapsed = 0;

  return timeline.map((step, index) => {
    elapsed += getStepDuration(step);

    return {
      index,
      label: step.label ?? `Step ${index + 1}`,
      progress: elapsed / totalDuration,
    };
  });
}
