export { default as DemoPlayer } from "./components/demo-player";
export { default as DemoControls } from "./components/demo-controls";
export { default as DemoHighlight } from "./components/demo-highlight";
export { useDemoController } from "./hooks/use-demo-controller";
export { useTimeline } from "./hooks/use-timeline";
export { useElementInView } from "./hooks/use-element-in-view";
export { createTimelineRunner } from "./engine/timeline-runner";
export { getTimelineDuration, getTimelineStepMeta, getStepDuration } from "./engine/timeline-metadata";
export type {
  DemoCursorConfig,
  DemoCursorVariant,
  DemoHighlightState,
  DemoPlaybackSnapshot,
  DemoPlayerControlsRenderProps,
  DemoPlayerProps,
  DemoStatus,
  DemoStep,
  DemoStepType,
  DemoTimeline,
} from "./types";
