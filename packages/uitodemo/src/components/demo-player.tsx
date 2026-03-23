"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useDemoController } from "../hooks/use-demo-controller";
import { useTimeline } from "../hooks/use-timeline";
import type {
  DemoCursorVariant,
  DemoPlayerProps,
  DemoRadiusPreset,
  DemoStep,
} from "../types";
import DemoControls from "./demo-controls";
import DemoHighlight from "./demo-highlight";
import { cursorAssets } from "./cursor-assets";

function getTargetAnchorPoint(
  rect: DOMRect,
  anchor: string | undefined,
  offsetX: number,
  offsetY: number,
) {
  let x = rect.left + rect.width / 2;
  let y = rect.top + rect.height / 2;

  switch (anchor) {
    case "left-center":
      x = rect.left;
      y = rect.top + rect.height / 2;
      break;
    case "right-center":
      x = rect.right;
      y = rect.top + rect.height / 2;
      break;
    case "top-center":
      y = rect.top;
      break;
    case "bottom-center":
      y = rect.bottom;
      break;
    case "top-left":
      x = rect.left;
      y = rect.top;
      break;
    case "top-right":
      x = rect.right;
      y = rect.top;
      break;
    case "bottom-left":
      x = rect.left;
      y = rect.bottom;
      break;
    case "bottom-right":
      x = rect.right;
      y = rect.bottom;
      break;
    default:
      break;
  }

  return { x: x + offsetX, y: y + offsetY };
}

function getStableHumanizedOffset(
  key: string,
  variant: DemoCursorVariant,
  stepIndex: number,
  rect: DOMRect,
) {
  const seedSource = `${key}:${variant}:${stepIndex}`;
  let hash = 0;

  for (let index = 0; index < seedSource.length; index += 1) {
    hash = (hash * 31 + seedSource.charCodeAt(index)) >>> 0;
  }

  const normalizedX = ((hash & 0xffff) / 0xffff) * 2 - 1;
  const normalizedY = (((hash >>> 16) & 0xffff) / 0xffff) * 2 - 1;
  const maxOffsetX =
    variant === "text"
      ? Math.min(7, rect.width * 0.08)
      : Math.min(12, rect.width * 0.12);
  const maxOffsetY =
    variant === "text"
      ? Math.min(3, rect.height * 0.08)
      : Math.min(8, rect.height * 0.16);

  return {
    x: normalizedX * maxOffsetX,
    y: normalizedY * maxOffsetY,
  };
}

function getDefaultInteractiveOffset(
  rect: DOMRect,
  variant: DemoCursorVariant,
  element: HTMLElement,
) {
  if (variant === "text") {
    return {
      x: 0,
      y: -8,
    };
  }

  const isButtonLike = Boolean(
    element.matches("button,[data-slot='button']") ||
    element.closest("button,[data-slot='button']"),
  );

  if (isButtonLike) {
    return {
      x: Math.min(2, rect.width * 0.02),
      y: Math.min(5, rect.height * 0.14),
    };
  }

  return { x: 0, y: 0 };
}

const CURSOR_CLICK_SETTLE_DELAY_MS = 380;
const CURSOR_CLICK_PRESS_DURATION_MS = 320;
const ROOT_DEMO_TARGET = "app";
const CURSOR_START_STEP_DELAY_MS = 450;
const FRAME_BORDER_RADIUS_MAP: Record<DemoRadiusPreset, number> = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

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
  onStatusChange,
  onPlaybackChange,
  renderControls,
  children,
}: DemoPlayerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scaleHostRef = useRef<HTMLDivElement | null>(null);
  const cursorElementRef = useRef<HTMLDivElement | null>(null);
  const hoveredTargetRef = useRef<HTMLElement | null>(null);
  const hideControlsTimerRef = useRef<number | null>(null);
  const cursorAnimationFrameRef = useRef<number | null>(null);
  const cursorPositionRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const hasPlacedCursorRef = useRef(false);
  const userPointerDownRef = useRef(false);
  const hasPlayedIntroRef = useRef(false);
  const cursorClickStartTimerRef = useRef<number | null>(null);
  const cursorClickTimerRef = useRef<number | null>(null);
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
  const cursorConfig =
    typeof cursor === "boolean"
      ? {
          enabled: cursor,
          clickPulse: true,
          theme: "black" as const,
          hideNativeCursor: false,
        }
      : {
          enabled: cursor.enabled ?? true,
          clickPulse: cursor.clickPulse ?? true,
          theme: cursor.theme ?? "black",
          hideNativeCursor: cursor.hideNativeCursor ?? false,
        };
  const baseTimeline = useTimeline(timeline);
  const resolvedTimeline = useMemo(() => {
    if (!cursorConfig.enabled) return baseTimeline;

    const firstStep = baseTimeline[0];
    const alreadyStartsAtRoot =
      firstStep?.type === "highlight" &&
      firstStep.target === ROOT_DEMO_TARGET &&
      firstStep.cursor === "arrow";

    if (alreadyStartsAtRoot) return baseTimeline;

    return [
      {
        type: "highlight" as const,
        target: ROOT_DEMO_TARGET,
        cursor: "arrow" as const,
        label: "Start",
        delay: CURSOR_START_STEP_DELAY_MS,
      },
      ...baseTimeline,
    ];
  }, [baseTimeline, cursorConfig.enabled]);
  const [cursorState, setCursorState] = useState<{
    visible: boolean;
    clicking: boolean;
    variant: DemoCursorVariant;
  }>({
    visible: cursorConfig.enabled,
    clicking: false,
    variant: "arrow",
  });
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
    highlight,
  } = useDemoController({
    rootRef,
    timeline: resolvedTimeline,
    isActive: resolvedIsActive,
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
      if (cursorClickTimerRef.current)
        window.clearTimeout(cursorClickTimerRef.current);
      if (cursorClickStartTimerRef.current)
        window.clearTimeout(cursorClickStartTimerRef.current);
      if (cursorAnimationFrameRef.current)
        window.cancelAnimationFrame(cursorAnimationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (!cursorConfig.enabled || !cursorState.visible) return;

    const cursorElement = cursorElementRef.current;
    if (!cursorElement) return;

    const animate = () => {
      const current = cursorPositionRef.current;
      const nextX = current.x + (current.targetX - current.x) * 0.075;
      const nextY = current.y + (current.targetY - current.y) * 0.075;

      current.x =
        Math.abs(current.targetX - nextX) < 0.08 ? current.targetX : nextX;
      current.y =
        Math.abs(current.targetY - nextY) < 0.08 ? current.targetY : nextY;

      cursorElement.style.setProperty("--cursor-x", `${current.x}px`);
      cursorElement.style.setProperty("--cursor-y", `${current.y}px`);

      cursorAnimationFrameRef.current = window.requestAnimationFrame(animate);
    };

    cursorAnimationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (cursorAnimationFrameRef.current) {
        window.cancelAnimationFrame(cursorAnimationFrameRef.current);
        cursorAnimationFrameRef.current = null;
      }
    };
  }, [cursorConfig.enabled, cursorState.visible]);

  useEffect(() => {
    if (!cursorConfig.enabled) {
      setCursorState((prev) => ({ ...prev, visible: false, clicking: false }));
      hasPlacedCursorRef.current = false;
      cursorPositionRef.current = { x: 0, y: 0, targetX: 0, targetY: 0 };
      if (hoveredTargetRef.current) {
        delete hoveredTargetRef.current.dataset.demoHovered;
        hoveredTargetRef.current = null;
      }
      return;
    }

    setCursorState((prev) =>
      prev.visible ? prev : { ...prev, visible: true },
    );

    const root = rootRef.current;
    const step = resolvedTimeline[currentStepIndex] as DemoStep | undefined;
    const target = step?.target;

    if (!root || !target) return;

    const targetElement = root.querySelector<HTMLElement>(
      `[data-demo="${target}"],[data-demo-id="${target}"]`,
    );
    if (!targetElement) return;

    if (
      hoveredTargetRef.current &&
      hoveredTargetRef.current !== targetElement
    ) {
      delete hoveredTargetRef.current.dataset.demoHovered;
      hoveredTargetRef.current = null;
    }

    if (step?.hover) {
      targetElement.dataset.demoHovered = "true";
      hoveredTargetRef.current = targetElement;
    } else if (hoveredTargetRef.current === targetElement) {
      delete targetElement.dataset.demoHovered;
      hoveredTargetRef.current = null;
    }

    const rootRect = root.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    const requestedVariant = targetElement.dataset.demoCursor as
      | DemoCursorVariant
      | undefined;
    const interactiveSelector =
      "button,a,[role='button'],[data-slot='button'],[data-demo-interactive='true']";
    const isInteractive =
      targetElement.matches(interactiveSelector) ||
      !!targetElement.closest(interactiveSelector);
    const isTextTarget = Boolean(
      targetElement.matches(
        "input,textarea,[contenteditable='true'],[data-slot='input-group-control']",
      ) ||
      targetElement.closest(
        "input,textarea,[contenteditable='true'],[data-slot='input-group-control']",
      ),
    );
    const resolvedVariant: DemoCursorVariant =
      step?.cursor ??
      requestedVariant ??
      (isTextTarget ? "text" : isInteractive ? "pointer" : "arrow");
    const defaultOffset = getDefaultInteractiveOffset(
      targetRect,
      resolvedVariant,
      targetElement,
    );
    const humanizedOffset = getStableHumanizedOffset(
      target,
      resolvedVariant,
      currentStepIndex,
      targetRect,
    );
    const anchorPoint = getTargetAnchorPoint(
      targetRect,
      targetElement.dataset.demoAnchor,
      Number(targetElement.dataset.demoOffsetX ?? 0) +
        defaultOffset.x +
        humanizedOffset.x,
      Number(targetElement.dataset.demoOffsetY ?? 0) +
        defaultOffset.y +
        humanizedOffset.y,
    );
    const currentScale = Math.max(scale ?? 1, 0.01);
    const nextX = (anchorPoint.x - rootRect.left) / currentScale;
    const nextY = (anchorPoint.y - rootRect.top) / currentScale;
    const shouldAnimateCursorPress =
      cursorConfig.clickPulse &&
      (step?.type === "click" ||
        ((step?.type === "focus" || step?.type === "type") &&
          resolvedVariant === "text"));
    const cursorPosition = cursorPositionRef.current;
    const isFirstCursorPlacement = !hasPlacedCursorRef.current;

    cursorPosition.targetX = nextX;
    cursorPosition.targetY = nextY;

    if (isFirstCursorPlacement) {
      const initialX = root.clientWidth / 2;
      const initialY = root.clientHeight / 2;
      cursorPosition.x = initialX;
      cursorPosition.y = initialY;
      cursorElementRef.current?.style.setProperty(
        "--cursor-x",
        `${initialX}px`,
      );
      cursorElementRef.current?.style.setProperty(
        "--cursor-y",
        `${initialY}px`,
      );
      hasPlacedCursorRef.current = true;
    }

    setCursorState((prev) => ({
      ...prev,
      visible: true,
      variant: resolvedVariant,
      clicking: shouldAnimateCursorPress ? prev.clicking : false,
    }));

    if (shouldAnimateCursorPress) {
      if (cursorClickStartTimerRef.current) {
        window.clearTimeout(cursorClickStartTimerRef.current);
        cursorClickStartTimerRef.current = null;
      }
      if (cursorClickTimerRef.current) {
        window.clearTimeout(cursorClickTimerRef.current);
        cursorClickTimerRef.current = null;
      }

      setCursorState((prev) => ({ ...prev, clicking: false }));
      cursorClickStartTimerRef.current = window.setTimeout(() => {
        setCursorState((prev) => ({ ...prev, clicking: true }));
        cursorClickStartTimerRef.current = null;

        cursorClickTimerRef.current = window.setTimeout(() => {
          setCursorState((prev) => ({ ...prev, clicking: false }));
          cursorClickTimerRef.current = null;
        }, CURSOR_CLICK_PRESS_DURATION_MS);
      }, CURSOR_CLICK_SETTLE_DELAY_MS);
    }
  }, [
    cursorConfig.clickPulse,
    cursorConfig.enabled,
    cursorState.visible,
    currentStepIndex,
    resolvedTimeline,
    scale,
  ]);

  useEffect(() => {
    if (!cursorConfig.enabled) return;
    setCursorState((prev) => ({ ...prev, visible: true }));
  }, [cursorConfig.enabled]);

  useEffect(() => {
    if (!cursorConfig.enabled || hasPlacedCursorRef.current) return;

    const root = rootRef.current;
    if (!root) return;

    const rootRect = root.getBoundingClientRect();
    const initialX = root.clientWidth / 2;
    const initialY = root.clientHeight / 2;

    cursorPositionRef.current = {
      x: initialX,
      y: initialY,
      targetX: initialX,
      targetY: initialY,
    };

    cursorElementRef.current?.style.setProperty("--cursor-x", `${initialX}px`);
    cursorElementRef.current?.style.setProperty("--cursor-y", `${initialY}px`);
    hasPlacedCursorRef.current = true;
    setCursorState((prev) => ({ ...prev, visible: true }));
  }, [cursorConfig.enabled, scale]);

  useEffect(() => {
    hasPlacedCursorRef.current = false;
    cursorPositionRef.current = { x: 0, y: 0, targetX: 0, targetY: 0 };
  }, [runnerVersion]);

  useEffect(() => {
    return () => {
      if (hoveredTargetRef.current) {
        delete hoveredTargetRef.current.dataset.demoHovered;
        hoveredTargetRef.current = null;
      }
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
    }, 1200);
  };

  const clearPointerActivity = () => {
    if (status === "paused" || status === "completed") return;

    if (hideControlsTimerRef.current) {
      window.clearTimeout(hideControlsTimerRef.current);
      hideControlsTimerRef.current = null;
    }

    setHasPointerActivity(false);
  };

  const cursorTheme = cursorAssets[cursorConfig.theme];
  const cursorSrc = cursorTheme[cursorState.variant] ?? cursorTheme.arrow;
  const cursorVisualStyle: CSSProperties =
    cursorState.variant === "pointer"
      ? { transform: "translate(-11px, -6px)", transformOrigin: "top left" }
      : cursorState.variant === "text"
        ? { transform: "translate(-1px, -3px)", transformOrigin: "top left" }
        : { transform: "translate(-3px, -3px)", transformOrigin: "top left" };

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
              <DemoHighlight highlight={highlight} />
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
