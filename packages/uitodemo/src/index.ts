export { default as DemoPlayer } from "./components/demo-player";
export { default as DemoControls } from "./components/demo-controls";
export { default as DemoOverlay } from "./components/demo-overlay";
export { default as DemoProgress } from "./components/demo-progress";
export { default as DemoStage } from "./components/demo-stage";
export { DEFAULT_DEMO_TIMINGS } from "./config/defaults";
export { demo, demoTarget } from "./authoring";
export type { DemoBuilder } from "./authoring";
export type {
  DemoHighlightState,
  DemoCursorConfig,
  DemoPerformanceProfile,
  DemoCursorVariant,
  DemoPlayerProps,
  DemoRadiusPreset,
  DemoStatus,
  DemoStep,
  DemoTimingConfig,
  DemoTimeline,
} from "./types";
