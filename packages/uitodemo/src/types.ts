import type { ReactNode } from "react";

/**
 * Playback lifecycle state for the demo runner.
 *
 * - `idle`: timeline has not started yet
 * - `playing`: timeline is currently advancing
 * - `paused`: playback is temporarily stopped
 * - `completed`: the timeline reached its final step
 */
export type DemoStatus = "idle" | "playing" | "paused" | "completed";

/**
 * Supported step kinds in a demo timeline.
 *
 * - `click`: moves to a target and triggers `element.click()`
 * - `focus`: moves to a target and switches the cursor state without mutating the DOM
 * - `highlight`: keeps the cursor/highlight anchored to a target for a timed beat
 * - `type`: types text into an input-like target
 * - `wait`: pauses timeline progression for a fixed amount of time
 */
export type DemoStepType = "click" | "focus" | "highlight" | "type" | "wait";

/**
 * Built-in simulated cursor variants.
 *
 * These map to the packaged cursor artwork and visual offsets used by the player.
 */
export type DemoCursorVariant =
  | "arrow"
  | "pointer"
  | "text"
  | "grab"
  | "move"
  | "crosshair"
  | "wait";

/**
 * A single timeline instruction executed by the DemoPlayer.
 *
 * A timeline is resolved sequentially from top to bottom. Depending on `type`,
 * some fields are optional and others only make sense for specific steps.
 *
 * @example
 * ```tsx
 * { type: "wait", delay: 600, label: "Pause briefly" }
 * ```
 *
 * @example
 * ```tsx
 * { type: "focus", target: "search", cursor: "text", label: "Focus search" }
 * ```
 *
 * @example
 * ```tsx
 * { type: "type", target: "search", value: "Coffee", delay: 90, cursor: "text" }
 * ```
 *
 * @example
 * ```tsx
 * { type: "click", target: "product-2", cursor: "pointer", hover: true, label: "Open product" }
 * ```
 *
 * @example
 * ```tsx
 * { type: "highlight", target: "app", cursor: "arrow", delay: 450, label: "Start" }
 * ```
 */
export type DemoStep = {
  /**
   * The kind of action to perform.
   *
   * This determines which other fields are used.
   */
  type: DemoStepType;
  /**
   * Target id matched against `data-demo` or `data-demo-id`.
   *
   * Required for `click`, `focus`, `highlight`, and `type` steps.
   * Ignored by `wait` steps.
   */
  target?: string;
  /**
   * Text content used by `type` steps.
   *
   * Ignored for non-`type` steps.
   */
  value?: string;
  /**
   * Delay in milliseconds used by `wait` and any step that supports timing.
   *
   * Typical usage:
   * - `wait`: total wait duration
   * - `type`: per-character delay
   * - `highlight`: how long to hold that highlighted state
   */
  delay?: number;
  /**
   * Human-readable label for controls or debugging.
   *
   * If omitted, the UI falls back to a generated step label.
   */
  label?: string;
  /**
   * Cursor variant to use while executing the step.
   *
   * If omitted, the player infers a cursor from the target element type.
   */
  cursor?: DemoCursorVariant;
  /**
   * Whether the target should show a hovered state before a click.
   *
   * Most useful for button-like targets.
   */
  hover?: boolean;
};

/**
 * Ordered list of steps consumed by the demo runner.
 *
 * The array is executed from index `0` to the end. The player may prepend
 * internal helper steps when certain features are enabled, such as the
 * simulated cursor bootstrap step.
 *
 * @example
 * ```tsx
 * const timeline: DemoTimeline = [
 *   { type: "focus", target: "search", cursor: "text", label: "Focus search" },
 *   { type: "type", target: "search", value: "Cold brew", delay: 90, cursor: "text" },
 *   { type: "wait", delay: 500, label: "Review results" },
 *   { type: "click", target: "product-2", cursor: "pointer", hover: true, label: "Open product" },
 * ];
 * ```
 *
 * @example
 * ```tsx
 * const timeline: DemoTimeline = [
 *   { type: "highlight", target: "app", cursor: "arrow", delay: 450, label: "Start" },
 *   { type: "wait", delay: 800, label: "Settle frame" },
 *   { type: "click", target: "cta", cursor: "pointer", hover: true, label: "Open CTA" },
 * ];
 * ```
 */
export type DemoTimeline = DemoStep[];

/**
 * Highlight overlay state for the currently focused target.
 *
 * Coordinates are relative to the demo root, not the viewport.
 */
export type DemoHighlightState = {
  /**
   * Target id currently being highlighted.
   */
  target: string;
  /**
   * Bounding rect relative to the demo root.
   */
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
} | null;

/**
 * Read-only playback snapshot exposed to consumers.
 *
 * Used by callbacks and custom control renderers.
 */
export type DemoPlaybackSnapshot = {
  /**
   * Current playback state.
   */
  status: DemoStatus;
  /**
   * Progress from `0` to `1`.
   *
   * This is based on timeline metadata duration, not on real wall-clock time.
   */
  progress: number;
  /**
   * Elapsed playback time in milliseconds.
   *
   * This is the resolved timeline time accumulated by the runner.
   */
  elapsedMs: number;
  /**
   * Total timeline duration in milliseconds.
   *
   * Includes explicit waits and supported timed actions.
   */
  durationMs: number;
};

/**
 * Visual cursor configuration for the DemoPlayer.
 *
 * This config only affects the simulated cursor layer, not the actual browser
 * cursor unless `hideNativeCursor` is enabled.
 */
export type DemoCursorConfig = {
  /**
   * Enables the simulated cursor.
   *
   * @default true
   */
  enabled?: boolean;
  /**
   * Plays a press animation on click-like steps.
   *
   * This affects the cursor visual only. The actual `click()` timing is still
   * managed by the timeline runner.
   *
   * @default true
   */
  clickPulse?: boolean;
  /**
   * Built-in cursor artwork theme.
   *
   * @default "black"
   */
  theme?: "black" | "white";
  /**
   * Hides the native cursor while the pointer is inside the demo surface.
   *
   * Useful when the demo should look fully simulated and controlled.
   *
   * @default false
   */
  hideNativeCursor?: boolean;
};

/**
 * Preset border radius options for the DemoPlayer frame.
 * Matches a simple Tailwind-like scale.
 */
export type DemoRadiusPreset = "none" | "sm" | "md" | "lg" | "xl";

/**
 * Props passed to a custom controls renderer.
 *
 * Consumers receive both playback state and imperative controls.
 */
export type DemoPlayerControlsRenderProps = DemoPlaybackSnapshot & {
  /**
   * Starts or resumes playback.
   */
  play: () => void;
  /**
   * Pauses playback.
   */
  pause: () => void;
  /**
   * Restarts the timeline from the beginning.
   */
  restart: () => void;
};

/**
 * Public props for the DemoPlayer component.
 *
 * `DemoPlayer` renders your real UI inside a fixed-size stage, then replays a
 * timeline against elements identified by `data-demo` or `data-demo-id`.
 */
export type DemoPlayerProps = {
  /**
   * Timeline describing the actions to simulate.
   *
   * The player may internally add setup steps when cursor mode is enabled.
   *
   * @example
   * ```tsx
   * timeline={[
   *   { type: "focus", target: "search", cursor: "text", label: "Focus search" },
   *   { type: "type", target: "search", value: "Coffee", delay: 90, cursor: "text" },
   *   { type: "wait", delay: 500, label: "Pause briefly" },
   *   { type: "click", target: "product-1", cursor: "pointer", hover: true, label: "Open product" },
   * ]}
   * ```
   *
   * @example
   * ```tsx
   * timeline={[
   *   { type: "highlight", target: "app", cursor: "arrow", delay: 450, label: "Start" },
   *   { type: "wait", delay: 800, label: "Settle frame" },
   *   { type: "click", target: "cta", cursor: "pointer", hover: true, label: "Press CTA" },
   * ]}
   * ```
   */
  timeline: DemoTimeline;
  /**
   * Enables playback when true.
   *
   * Toggling from `false` to `true` starts or resumes the current run.
   */
  isActive: boolean;
  /**
   * Optional delay before playback becomes active, in milliseconds.
   *
   * Useful when the demo should wait for surrounding page transitions.
   *
   * @default 0
   */
  activationDelayMs?: number;
  /**
   * Intro fade/slide animation duration in milliseconds.
   *
   * This affects the player shell appearance only, not the timeline execution.
   *
   * @default 300
   */
  introAnimationMs?: number;
  /**
   * Optional class name for the outer wrapper.
   *
   * Applied to the top-level player container.
   *
   * Note:
   * Border radius styling applied through `className` does not control the
   * internal demo frame radius. To change the visible frame rounding, use
   * `frameBorderRadius` instead.
   */
  className?: string;
  /**
   * Base width of the unscaled demo stage, in pixels.
   *
   * The player scales this stage down responsively to fit the available width.
   *
   * @default 1275
   */
  baseWidth?: number;
  /**
   * Base height of the unscaled demo stage, in pixels.
   *
   * This is the logical stage height before scaling.
   *
   * @default 750
   */
  baseHeight?: number;
  /**
   * Controls the outer frame radius using preset sizes.
   *
   * - `none`: 0px
   * - `sm`: 8px
   * - `md`: 12px
   * - `lg`: 16px
   * - `xl`: 20px
   *
   * @default "xl"
   */
  frameBorderRadius?: DemoRadiusPreset;
  /**
   * Default scale applied on larger screens before responsive fitting.
   *
   * The effective scale still clamps to the available container width.
   *
   * @default 0.9
   */
  defaultScale?: number;
  /**
   * Shows built-in playback controls.
   *
   * When false, neither the bottom controls nor the center play button are shown.
   *
   * @default true
   */
  showControls?: boolean;
  /**
   * Enables the simulated cursor or provides cursor configuration.
   *
   * - `false`: no simulated cursor
   * - `true`: cursor enabled with default config
   * - object: cursor enabled with custom settings
   *
   * @default false
   */
  cursor?: boolean | DemoCursorConfig;
  /**
   * Called whenever playback status changes.
   *
   * Useful for syncing external UI or resetting demo state after completion.
   */
  onStatusChange?: (status: DemoStatus) => void;
  /**
   * Called whenever playback progress/time changes.
   *
   * Receives a derived playback snapshot on each meaningful update.
   */
  onPlaybackChange?: (snapshot: DemoPlaybackSnapshot) => void;
  /**
   * Optional custom renderer for the playback controls overlay.
   *
   * If omitted, the built-in controls UI is used.
   *
   * This callback should return a React node. If you want to build your own
   * controls component, import `DemoControls` from the package or render any
   * custom React UI using the provided playback props and actions.
   *
   * @example
   * ```tsx
   * import { DemoControls, DemoPlayer } from "uitodemo";
   *
   * <DemoPlayer
   *   timeline={timeline}
   *   isActive
   *   renderControls={(controls) => <DemoControls {...controls} />}
   * >
   *   <div>...</div>
   * </DemoPlayer>
   * ```
   */
  renderControls?: (controls: DemoPlayerControlsRenderProps) => ReactNode;
  /**
   * Real UI rendered inside the simulated demo surface.
   *
   * Add `data-demo="your-id"` to elements you want the timeline to target.
   */
  children: ReactNode;
};
