"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import { cursorAssets } from "../components/cursor-assets";
import { getDefaultInteractiveOffset, getCursorVisualTransform, getStableHumanizedOffset, getTargetAnchorPoint } from "../cursor/geometry";
import type { DemoCursorConfig, DemoCursorVariant, DemoStep, DemoTimeline, DemoTimingConfig } from "../types";

type UseDemoCursorOptions = {
  rootRef: RefObject<HTMLDivElement | null>;
  cursor: boolean | DemoCursorConfig;
  timeline: DemoTimeline;
  currentStepIndex: number;
  runnerVersion: number;
  scale: number | null;
  timings: DemoTimingConfig;
};

type CursorState = {
  visible: boolean;
  clicking: boolean;
  variant: DemoCursorVariant;
};

function resolveCursorConfig(cursor: boolean | DemoCursorConfig) {
  return typeof cursor === "boolean"
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
}

export function useDemoCursor({
  rootRef,
  cursor,
  timeline,
  currentStepIndex,
  runnerVersion,
  scale,
  timings,
}: UseDemoCursorOptions) {
  const cursorConfig = useMemo(() => resolveCursorConfig(cursor), [cursor]);
  const cursorElementRef = useRef<HTMLDivElement | null>(null);
  const hoveredTargetRef = useRef<HTMLElement | null>(null);
  const activeStepTypeRef = useRef<DemoStep["type"] | null>(null);
  const cursorAnimationFrameRef = useRef<number | null>(null);
  const cursorTrackingFrameRef = useRef<number | null>(null);
  const cursorPositionRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const cursorClickStartTimerRef = useRef<number | null>(null);
  const cursorClickTimerRef = useRef<number | null>(null);
  const hasPlacedCursorRef = useRef(false);
  const [cursorState, setCursorState] = useState<CursorState>({
    visible: cursorConfig.enabled,
    clicking: false,
    variant: "arrow",
  });

  useEffect(() => {
    return () => {
      if (cursorClickTimerRef.current) window.clearTimeout(cursorClickTimerRef.current);
      if (cursorClickStartTimerRef.current) window.clearTimeout(cursorClickStartTimerRef.current);
      if (cursorAnimationFrameRef.current) window.cancelAnimationFrame(cursorAnimationFrameRef.current);
      if (cursorTrackingFrameRef.current) window.cancelAnimationFrame(cursorTrackingFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (!cursorConfig.enabled || !cursorState.visible) return;

    const cursorElement = cursorElementRef.current;
    if (!cursorElement) return;

    const animate = () => {
      const current = cursorPositionRef.current;
      const easing = activeStepTypeRef.current === "scroll" ? 0.24 : 0.075;
      const nextX = current.x + (current.targetX - current.x) * easing;
      const nextY = current.y + (current.targetY - current.y) * easing;

      current.x = Math.abs(current.targetX - nextX) < 0.08 ? current.targetX : nextX;
      current.y = Math.abs(current.targetY - nextY) < 0.08 ? current.targetY : nextY;

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

    setCursorState((prev) => (prev.visible ? prev : { ...prev, visible: true }));

    const root = rootRef.current;
    const step = timeline[currentStepIndex] as DemoStep | undefined;
    const target = step?.target;
    activeStepTypeRef.current = step?.type ?? null;

    if (!root || !target) {
      if (cursorTrackingFrameRef.current) {
        window.cancelAnimationFrame(cursorTrackingFrameRef.current);
        cursorTrackingFrameRef.current = null;
      }
      return;
    }

    const targetElement = root.querySelector<HTMLElement>(`[data-demo="${target}"],[data-demo-id="${target}"]`);
    if (!targetElement) {
      if (cursorTrackingFrameRef.current) {
        window.cancelAnimationFrame(cursorTrackingFrameRef.current);
        cursorTrackingFrameRef.current = null;
      }
      return;
    }

    if (hoveredTargetRef.current && hoveredTargetRef.current !== targetElement) {
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

    const requestedVariant = targetElement.dataset.demoCursor as DemoCursorVariant | undefined;
    const interactiveSelector = "button,a,[role='button'],[data-slot='button'],[data-demo-interactive='true']";
    const isInteractive = targetElement.matches(interactiveSelector) || !!targetElement.closest(interactiveSelector);
    const isTextTarget = Boolean(
      targetElement.matches("input,textarea,[contenteditable='true'],[data-slot='input-group-control']") ||
        targetElement.closest("input,textarea,[contenteditable='true'],[data-slot='input-group-control']"),
    );
    const resolvedVariant: DemoCursorVariant =
      step?.cursor ?? requestedVariant ?? (isTextTarget ? "text" : isInteractive ? "pointer" : "arrow");
    const shouldAnimateCursorPress =
      cursorConfig.clickPulse &&
      (step?.type === "click" || ((step?.type === "focus" || step?.type === "type") && resolvedVariant === "text"));

    if (!hasPlacedCursorRef.current) {
      const initialX = root.clientWidth / 2;
      const initialY = root.clientHeight / 2;
      cursorPositionRef.current.x = initialX;
      cursorPositionRef.current.y = initialY;
      cursorElementRef.current?.style.setProperty("--cursor-x", `${initialX}px`);
      cursorElementRef.current?.style.setProperty("--cursor-y", `${initialY}px`);
      hasPlacedCursorRef.current = true;
    }

    const syncTargetPosition = () => {
      const liveRoot = rootRef.current;
      if (!liveRoot) return;

      const liveTarget = liveRoot.querySelector<HTMLElement>(`[data-demo="${target}"],[data-demo-id="${target}"]`);
      if (!liveTarget) return;

      const rootRect = liveRoot.getBoundingClientRect();
      const targetRect = liveTarget.getBoundingClientRect();
      const defaultOffset = getDefaultInteractiveOffset(targetRect, resolvedVariant, liveTarget);
      const humanizedOffset = getStableHumanizedOffset(target, resolvedVariant, currentStepIndex, targetRect);
      const anchorPoint = getTargetAnchorPoint(
        targetRect,
        liveTarget.dataset.demoAnchor,
        Number(liveTarget.dataset.demoOffsetX ?? 0) + defaultOffset.x + humanizedOffset.x,
        Number(liveTarget.dataset.demoOffsetY ?? 0) + defaultOffset.y + humanizedOffset.y,
      );
      const currentScale = Math.max(scale ?? 1, 0.01);

      cursorPositionRef.current.targetX = (anchorPoint.x - rootRect.left) / currentScale;
      cursorPositionRef.current.targetY = (anchorPoint.y - rootRect.top) / currentScale;
    };

    syncTargetPosition();

    if (cursorTrackingFrameRef.current) {
      window.cancelAnimationFrame(cursorTrackingFrameRef.current);
      cursorTrackingFrameRef.current = null;
    }

    const trackTarget = () => {
      syncTargetPosition();
      cursorTrackingFrameRef.current = window.requestAnimationFrame(trackTarget);
    };

    cursorTrackingFrameRef.current = window.requestAnimationFrame(trackTarget);

    setCursorState((prev) => ({
      ...prev,
      visible: true,
      variant: resolvedVariant,
      clicking: shouldAnimateCursorPress ? prev.clicking : false,
    }));

    if (!shouldAnimateCursorPress) return;

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
      }, timings.cursorClickPressMs);
    }, timings.cursorClickSettleMs);
  }, [cursorConfig.clickPulse, cursorConfig.enabled, currentStepIndex, cursorState.visible, scale, timeline, timings.cursorClickPressMs, timings.cursorClickSettleMs]);

  useEffect(() => {
    if (!cursorConfig.enabled) return;
    setCursorState((prev) => ({ ...prev, visible: true }));
  }, [cursorConfig.enabled]);

  useEffect(() => {
    if (!cursorConfig.enabled || hasPlacedCursorRef.current) return;

    const root = rootRef.current;
    if (!root) return;

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
  }, [cursorConfig.enabled, scale, rootRef]);

  useEffect(() => {
    hasPlacedCursorRef.current = false;
    activeStepTypeRef.current = null;
    cursorPositionRef.current = { x: 0, y: 0, targetX: 0, targetY: 0 };
    if (cursorTrackingFrameRef.current) {
      window.cancelAnimationFrame(cursorTrackingFrameRef.current);
      cursorTrackingFrameRef.current = null;
    }
    if (hoveredTargetRef.current) {
      delete hoveredTargetRef.current.dataset.demoHovered;
      hoveredTargetRef.current = null;
    }
  }, [runnerVersion]);

  useEffect(() => {
    return () => {
      if (cursorTrackingFrameRef.current) {
        window.cancelAnimationFrame(cursorTrackingFrameRef.current);
        cursorTrackingFrameRef.current = null;
      }
      if (hoveredTargetRef.current) {
        delete hoveredTargetRef.current.dataset.demoHovered;
        hoveredTargetRef.current = null;
      }
    };
  }, []);

  const cursorTheme = cursorAssets[cursorConfig.theme];
  const cursorSrc = cursorTheme[cursorState.variant] ?? cursorTheme.arrow;
  const cursorVisualStyle: CSSProperties = {
    transform: getCursorVisualTransform(cursorState.variant),
    transformOrigin: "top left",
  };

  return {
    cursorConfig,
    cursorElementRef,
    cursorSrc,
    cursorState,
    cursorVisualStyle,
  };
}
