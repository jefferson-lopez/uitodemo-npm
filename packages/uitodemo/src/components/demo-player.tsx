"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  DEFAULT_DEMO_TIMINGS,
  FRAME_BORDER_RADIUS_MAP,
  getDemoPerformanceTuning,
  ROOT_DEMO_TARGET,
  resolveDemoTimeline,
} from "../config/defaults";
import { useDemoController } from "../hooks/use-demo-controller";
import { useDemoCursor } from "../hooks/use-demo-cursor";
import { useElementInView } from "../hooks/use-element-in-view";
import { useTimeline } from "../hooks/use-timeline";
import type { DemoPlayerProps } from "../types";
import DemoControls from "./demo-controls";
import DemoOverlay from "./demo-overlay";
import { DemoPlaybackProvider, DemoStageProvider } from "./demo-player-context";
import DemoProgress from "./demo-progress";
import DemoStage from "./demo-stage";

export default function DemoPlayer({
  timeline,
  steps,
  isActive,
  activationDelayMs = 0,
  introAnimationMs = 300,
  performanceProfile = "default",
  className,
  baseWidth = 1275,
  baseHeight = 750,
  frameBorderRadius = "xl",
  defaultScale = 0.9,
  padded = true,
  showFrame = true,
  showControls = true,
  showCenterOverlayButton = true,
  cursor = false,
  pauseWhenOffscreen = true,
  timings,
  onStatusChange,
  onPlaybackChange,
  renderControls,
  children,
}: DemoPlayerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scaleHostRef = useRef<HTMLDivElement | null>(null);
  const hideControlsTimerRef = useRef<number | null>(null);
  const userPointerDownRef = useRef(false);
  const hasPlayedIntroRef = useRef(false);
  const [scale, setScale] = useState<number | null>(null);
  const [hasPointerActivity, setHasPointerActivity] = useState(false);
  const [isPointerInsideDemo, setIsPointerInsideDemo] = useState(false);
  const [isPlaybackReady, setIsPlaybackReady] = useState(
    activationDelayMs === 0,
  );
  const [showIntroAnimation, setShowIntroAnimation] = useState(
    introAnimationMs > 0,
  );
  const performanceTuning = useMemo(
    () => getDemoPerformanceTuning(performanceProfile),
    [performanceProfile],
  );
  const resolvedCursor = useMemo(() => {
    if (typeof cursor === "boolean") {
      if (!cursor) return false;

      return {
        enabled: true,
        clickPulse: performanceTuning.cursorClickPulseDefault,
      };
    }

    return {
      ...cursor,
      clickPulse: cursor.clickPulse ?? performanceTuning.cursorClickPulseDefault,
    };
  }, [cursor, performanceTuning.cursorClickPulseDefault]);
  const isInView = useElementInView(scaleHostRef, {
    amount: performanceTuning.inViewAmount,
  });

  const resolvedIsActive =
    isActive && isPlaybackReady && (!pauseWhenOffscreen || isInView);
  const resolvedFrameBorderRadius = FRAME_BORDER_RADIUS_MAP[frameBorderRadius];
  const resolvedTimings = useMemo(
    () => ({ ...DEFAULT_DEMO_TIMINGS, ...timings }),
    [timings],
  );
  const authoredTimeline = timeline ?? steps ?? [];
  const baseTimeline = useTimeline(authoredTimeline);
  const cursorEnabled =
    typeof resolvedCursor === "boolean"
      ? resolvedCursor
      : (resolvedCursor.enabled ?? true);
  const resolvedTimeline = useMemo(
    () => resolveDemoTimeline(baseTimeline, cursorEnabled, resolvedTimings),
    [baseTimeline, cursorEnabled, resolvedTimings],
  );
  const runnerMetricsConfig = useMemo(
    () => ({
      timeSyncIntervalMs: performanceTuning.timeSyncIntervalMs,
      pausePollIntervalMs: performanceTuning.pausePollIntervalMs,
      typeChunkSize: performanceTuning.typeChunkSize,
    }),
    [
      performanceTuning.pausePollIntervalMs,
      performanceTuning.timeSyncIntervalMs,
      performanceTuning.typeChunkSize,
    ],
  );
  const {
    status,
    progress,
    elapsedMs,
    durationMs,
    currentStepIndex,
    play,
    pause,
    restart,
    runnerVersion,
  } = useDemoController({
    rootRef,
    timeline: resolvedTimeline,
    isActive: resolvedIsActive,
    timings: resolvedTimings,
    metricsCommitIntervalMs: performanceTuning.metricsCommitIntervalMs,
    runnerMetricsConfig,
  });
  const {
    cursorConfig,
    cursorElementRef,
    cursorSrc,
    cursorState,
    cursorVisualStyle,
  } = useDemoCursor({
    rootRef,
    cursor: resolvedCursor,
    timeline: resolvedTimeline,
    currentStepIndex,
    runnerVersion,
    scale,
    timings: resolvedTimings,
  });

  const areControlsVisible =
    showControls &&
    (status === "paused" || status === "completed" || hasPointerActivity);
  const shouldShowCenterOverlayButton =
    showCenterOverlayButton && status !== "playing";

  useEffect(() => {
    onStatusChange?.(status);
  }, [onStatusChange, status]);

  useEffect(() => {
    onPlaybackChange?.({
      status,
      progress,
      elapsedMs,
      durationMs,
    });
  }, [durationMs, elapsedMs, onPlaybackChange, progress, status]);

  useEffect(() => {
    if (hasPlayedIntroRef.current || introAnimationMs <= 0) {
      setShowIntroAnimation(false);
      return;
    }

    const introTimer = window.setTimeout(() => {
      hasPlayedIntroRef.current = true;
      setShowIntroAnimation(false);
    }, introAnimationMs);

    return () => window.clearTimeout(introTimer);
  }, [introAnimationMs]);

  useEffect(() => {
    if (!isActive) {
      setIsPlaybackReady(activationDelayMs === 0);
      return;
    }

    if (activationDelayMs === 0) {
      setIsPlaybackReady(true);
      return;
    }

    setIsPlaybackReady(false);
    const playbackTimer = window.setTimeout(() => {
      setIsPlaybackReady(true);
    }, activationDelayMs);
    return () => window.clearTimeout(playbackTimer);
  }, [activationDelayMs, isActive]);

  useEffect(() => {
    if (status === "paused" || status === "completed") {
      if (hideControlsTimerRef.current) {
        window.clearTimeout(hideControlsTimerRef.current);
        hideControlsTimerRef.current = null;
      }
      setHasPointerActivity(true);
      return;
    }

    setHasPointerActivity(false);
  }, [status]);

  useLayoutEffect(() => {
    const host = scaleHostRef.current;
    if (!host) return;

    const updateScale = () => {
      const availableWidth = host.clientWidth;
      const responsiveDefaultScale = window.innerWidth < 768 ? 1 : defaultScale;
      setScale(
        Math.min(1, availableWidth / baseWidth) * responsiveDefaultScale,
      );
    };

    updateScale();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateScale);
      observer.observe(host);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [baseWidth, defaultScale]);

  useEffect(() => {
    return () => {
      if (hideControlsTimerRef.current)
        window.clearTimeout(hideControlsTimerRef.current);
    };
  }, []);

  const markPointerActivity = () => {
    if (status === "paused" || status === "completed") {
      setHasPointerActivity(true);
      return;
    }

    setHasPointerActivity(true);

    if (hideControlsTimerRef.current) {
      window.clearTimeout(hideControlsTimerRef.current);
    }

    hideControlsTimerRef.current = window.setTimeout(() => {
      setHasPointerActivity(false);
      hideControlsTimerRef.current = null;
    }, resolvedTimings.pointerActivityMs);
  };

  const clearPointerActivity = () => {
    if (status === "paused" || status === "completed") return;

    if (hideControlsTimerRef.current) {
      window.clearTimeout(hideControlsTimerRef.current);
      hideControlsTimerRef.current = null;
    }

    setHasPointerActivity(false);
  };

  const outerStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    transition: `opacity ${introAnimationMs}ms ease-out, transform ${introAnimationMs}ms ease-out`,
    transform: showIntroAnimation ? "translateY(12px)" : "translateY(0)",
    opacity: showIntroAnimation ? 0 : 1,
  };

  const hostStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: `${baseHeight * (scale ?? 1)}px`,
    visibility: scale === null ? "hidden" : "visible",
    padding: padded ? 20 : 0,
  };

  const stageStyle: CSSProperties = {
    position: "absolute",
    left: "50%",
    top: 0,
    width: `${baseWidth}px`,
    height: `${baseHeight}px`,
    transform: `translateX(-50%) scale(${scale ?? 1})`,
    transformOrigin: "top center",
  };

  const surfaceStyle: CSSProperties = {
    position: "relative",
    isolation: "isolate",
    minHeight: 0,
    height: "100%",
    userSelect: "none",
    outline: "none",
    overflow: "hidden",
    background: "var(--uitodemo-surface, white)",
    borderRadius: showFrame
      ? Math.max(0, resolvedFrameBorderRadius - 2)
      : resolvedFrameBorderRadius,
    border: showFrame ? "1px solid rgba(0,0,0,0.08)" : undefined,
  };

  const childArray = Children.toArray(children);
  const usesCompoundApi = childArray.some((child) =>
    isValidElement(child) &&
    (child.type === DemoStage ||
      child.type === DemoOverlay ||
      child.type === DemoControls ||
      child.type === DemoProgress),
  );

  const stageContextValue = useMemo(() => ({
    rootRef,
    runnerVersion,
    status,
    play,
    pause,
    stageStyle: surfaceStyle,
    markPointerActivity,
    clearPointerActivity,
    setIsPointerInsideDemo,
    userPointerDownRef,
    hideNativeCursor:
      cursorConfig.hideNativeCursor && isPointerInsideDemo,
  }), [
    clearPointerActivity,
    cursorConfig.hideNativeCursor,
    isPointerInsideDemo,
    markPointerActivity,
    pause,
    play,
    runnerVersion,
    setIsPointerInsideDemo,
    status,
    surfaceStyle,
  ]);

  const playbackContextValue = useMemo(() => ({
    cursorElementRef,
    status,
    progress,
    elapsedMs,
    durationMs,
    play,
    pause,
    restart,
    areControlsVisible,
    showCenterOverlayButton,
    cursorEnabled: cursorConfig.enabled,
    cursorVisible: cursorState.visible,
    cursorClicking: cursorState.clicking,
    cursorVariant: cursorState.variant,
    cursorSrc,
    cursorVisualStyle,
    scale,
  }), [
    areControlsVisible,
    cursorConfig.enabled,
    cursorSrc,
    cursorState.clicking,
    cursorState.variant,
    cursorState.visible,
    cursorVisualStyle,
    durationMs,
    elapsedMs,
    pause,
    play,
    progress,
    restart,
    scale,
    showCenterOverlayButton,
    status,
  ]);

  return (
    <div className={className} style={outerStyle}>
      <div ref={scaleHostRef} style={hostStyle}>
        <div style={stageStyle}>
          <div
            style={{
              height: "100%",
              overflow: "hidden",
              borderRadius: resolvedFrameBorderRadius,
              background: showFrame
                ? "linear-gradient(180deg, rgba(235,235,235,1) 0%, rgba(235,235,235,0.95) 62%, rgba(235,235,235,0.88) 100%)"
                : undefined,
              padding: showFrame ? 4 : 0,
            }}
          >
            <DemoStageProvider value={stageContextValue}>
              <DemoPlaybackProvider value={playbackContextValue}>
                <div style={{ position: "relative", height: "100%" }}>
                  {usesCompoundApi ? (
                    children
                  ) : (
                    <>
                      <DemoStage>{children}</DemoStage>
                      <DemoOverlay />
                      {showControls
                        ? renderControls
                          ? (
                            <div
                              style={{
                                pointerEvents: "none",
                                position: "absolute",
                                inset: 0,
                                zIndex: 50,
                                display: areControlsVisible ? "flex" : "none",
                                alignItems: "flex-end",
                                opacity: areControlsVisible ? 1 : 0,
                                transition: "opacity 200ms ease-out",
                              }}
                            >
                              <div
                                data-demo-controls
                                style={{
                                  pointerEvents: "auto",
                                  position: "relative",
                                  width: `${Math.max(scale ?? 1, 0.01) * 100}%`,
                                  left: "50%",
                                  transform: `translateX(-50%) scale(${1 / Math.max(scale ?? 1, 0.01)})`,
                                  transformOrigin: "bottom center",
                                }}
                              >
                                <div
                                  style={{
                                    position: "relative",
                                    width: "100%",
                                    padding: "16px 20px 20px",
                                    background:
                                      "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.16) 35%, rgba(0,0,0,0.38) 100%)",
                                  }}
                                >
                                  {renderControls({
                                    status,
                                    progress,
                                    elapsedMs,
                                    durationMs,
                                    play,
                                    pause,
                                    restart,
                                  })}
                                </div>
                              </div>
                            </div>
                          )
                          : <DemoControls />
                        : null}
                    </>
                  )}
                </div>
              </DemoPlaybackProvider>
            </DemoStageProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
