"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { DEFAULT_DEMO_TIMINGS, FRAME_BORDER_RADIUS_MAP, ROOT_DEMO_TARGET, resolveDemoTimeline } from "../config/defaults";
import { useDemoController } from "../hooks/use-demo-controller";
import { useDemoCursor } from "../hooks/use-demo-cursor";
import { useTimeline } from "../hooks/use-timeline";
import type { DemoPlayerProps } from "../types";
import DemoControls from "./demo-controls";

export default function DemoPlayer({
  timeline,
  isActive,
  activationDelayMs = 0,
  introAnimationMs = 300,
  className,
  baseWidth = 1275,
  baseHeight = 750,
  frameBorderRadius = "xl",
  defaultScale = 0.9,
  showControls = true,
  cursor = false,
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

  const resolvedIsActive = isActive && isPlaybackReady;
  const resolvedFrameBorderRadius = FRAME_BORDER_RADIUS_MAP[frameBorderRadius];
  const resolvedTimings = useMemo(
    () => ({ ...DEFAULT_DEMO_TIMINGS, ...timings }),
    [timings],
  );
  const baseTimeline = useTimeline(timeline);
  const cursorEnabled =
    typeof cursor === "boolean" ? cursor : (cursor.enabled ?? true);
  const resolvedTimeline = useMemo(
    () => resolveDemoTimeline(baseTimeline, cursorEnabled, resolvedTimings),
    [baseTimeline, cursorEnabled, resolvedTimings],
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
  });
  const {
    cursorConfig,
    cursorElementRef,
    cursorSrc,
    cursorState,
    cursorVisualStyle,
  } = useDemoCursor({
    rootRef,
    cursor,
    timeline: resolvedTimeline,
    currentStepIndex,
    runnerVersion,
    scale,
    timings: resolvedTimings,
  });

  const areControlsVisible =
    showControls &&
    (status === "paused" || status === "completed" || hasPointerActivity);
  const showCenterOverlayButton = status !== "playing";

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
    padding: 20,
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

  return (
    <div className={className} style={outerStyle}>
      <div ref={scaleHostRef} style={hostStyle}>
        <div style={stageStyle}>
          <div
            style={{
              height: "100%",
              overflow: "hidden",
              borderRadius: resolvedFrameBorderRadius,
            }}
          >
            <div
              ref={rootRef}
              style={{
                position: "relative",
                isolation: "isolate",
                minHeight: 0,
                height: "100%",
                userSelect: "none",
                outline: "none",
                cursor:
                  cursorConfig.hideNativeCursor && isPointerInsideDemo
                    ? "none"
                    : undefined,
              }}
              tabIndex={0}
              onMouseEnter={() => {
                setIsPointerInsideDemo(true);
                markPointerActivity();
              }}
              onMouseMove={markPointerActivity}
              onMouseLeave={() => {
                setIsPointerInsideDemo(false);
                clearPointerActivity();
              }}
              onPointerDown={() => {
                userPointerDownRef.current = true;
              }}
              onClick={(event) => {
                if (!userPointerDownRef.current) return;
                userPointerDownRef.current = false;
                if (!event.isTrusted) return;
                const target = event.target as HTMLElement | null;
                if (target?.closest("[data-demo-controls]")) return;
                if (status === "playing") {
                  pause();
                  return;
                }
                play();
              }}
              onKeyDown={(event) => {
                if (event.code !== "Space") return;
                event.preventDefault();
                if (status === "playing") {
                  pause();
                  return;
                }
                play();
              }}
            >
              {showControls ? (
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
                      {renderControls ? (
                        renderControls({
                          status,
                          progress,
                          elapsedMs,
                          durationMs,
                          play,
                          pause,
                          restart,
                        })
                      ) : (
                        <DemoControls
                          status={status}
                          progress={progress}
                          elapsedMs={elapsedMs}
                          durationMs={durationMs}
                          onPlay={play}
                          onPause={pause}
                          onRestart={restart}
                          playLabel="Play demo"
                          pauseLabel="Pause demo"
                          restartLabel="Restart demo"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {showCenterOverlayButton ? (
                <div
                  style={{
                    pointerEvents: "none",
                    position: "absolute",
                    inset: 0,
                    zIndex: 50,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: `${Math.max(scale ?? 1, 0.01) * 100}%`,
                    left: "50%",
                    transform: `translateX(-50%) scale(${1 / Math.max(scale ?? 1, 0.01)})`,
                    transformOrigin: "center center",
                  }}
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (status === "completed") {
                        restart();
                        return;
                      }
                      play();
                    }}
                    aria-label={
                      status === "completed" ? "Restart demo" : "Play demo"
                    }
                    title={
                      status === "completed" ? "Restart demo" : "Play demo"
                    }
                    data-demo-controls
                    style={{
                      pointerEvents: "auto",
                      width: 48,
                      height: 48,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "50%",
                      border: "1px solid rgba(255,255,255,0.16)",
                      background: "rgba(17,17,17,0.78)",
                      color: "white",
                      boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                      cursor: "pointer",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      style={{ marginLeft: 2 }}
                    >
                      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l10.86-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z" />
                    </svg>
                  </button>
                </div>
              ) : null}

              <div
                  data-demo={ROOT_DEMO_TARGET}
                  key={runnerVersion}
                style={{ pointerEvents: "none", height: "100%" }}
              >
                {children}
              </div>
              {cursorConfig.enabled && cursorState.visible ? (
                <div
                  aria-hidden="true"
                  style={{
                    pointerEvents: "none",
                    position: "absolute",
                    inset: 0,
                    zIndex: 40,
                  }}
                >
                  <div
                    ref={cursorElementRef}
                    style={{
                      position: "absolute",
                      opacity: cursorState.visible ? 1 : 0,
                      transform:
                        "translate3d(var(--cursor-x, 0px), var(--cursor-y, 0px), 0)",
                      transition:
                        "opacity 200ms ease-out, transform 200ms ease-out",
                      willChange: "transform, opacity",
                    }}
                  >
                    <div style={cursorVisualStyle}>
                      <img
                        src={cursorSrc}
                        alt=""
                        aria-hidden="true"
                        style={{
                          width:
                            cursorState.variant === "pointer" ||
                            cursorState.variant === "grab"
                              ? 24
                              : 22,
                          height:
                            cursorState.variant === "pointer" ||
                            cursorState.variant === "grab"
                              ? 24
                              : 22,
                          display: "block",
                          userSelect: "none",
                          transform: cursorState.clicking
                            ? cursorState.variant === "pointer"
                              ? "translateY(1px) scale(0.84)"
                              : "translateY(0.5px) scale(0.92)"
                            : "translateY(0) scale(1)",
                          transition: "transform 300ms ease",
                          animation:
                            cursorState.variant === "wait"
                              ? "uitodemo-spin 1s linear infinite"
                              : undefined,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes uitodemo-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
