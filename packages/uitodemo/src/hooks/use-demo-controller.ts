"use client";

import { createTimelineRunner } from "../engine/timeline-runner";
import type { DemoStatus, DemoTimeline, DemoTimingConfig } from "../types";
import { useEffect, useRef, useState, type RefObject } from "react";

type UseDemoControllerOptions = {
  rootRef: RefObject<HTMLElement | null>;
  timeline: DemoTimeline;
  isActive: boolean;
  timings: DemoTimingConfig;
};

export function useDemoController({
  rootRef,
  timeline,
  isActive,
  timings,
}: UseDemoControllerOptions) {
  const runnerRef = useRef<ReturnType<typeof createTimelineRunner> | null>(null);
  const shouldAutoplayRef = useRef(isActive);
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [runnerVersion, setRunnerVersion] = useState(0);
  const [seekTargetStepIndex, setSeekTargetStepIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    shouldAutoplayRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const isSeeking = seekTargetStepIndex !== null;

    runnerRef.current?.cancel();

    if (!isSeeking) {
      setStatus("idle");
      setProgress(0);
      setElapsedMs(0);
      setDurationMs(0);
      setCurrentStepIndex(0);
    }

    const runner = createTimelineRunner({
      root,
      timeline,
      timings,
      onStatusChange: setStatus,
      onStepChange: setCurrentStepIndex,
      onProgressChange: setProgress,
      onTimeChange: (nextElapsedMs, nextDurationMs) => {
        setElapsedMs(nextElapsedMs);
        setDurationMs(nextDurationMs);
      },
    });

    runnerRef.current = runner;

    void (async () => {
      if (isSeeking) {
        await runner.seek(seekTargetStepIndex, shouldAutoplayRef.current);
        return;
      }

      if (isActive) {
        runner.play();
      }
    })();

    return () => {
      runner.cancel();
      if (runnerRef.current === runner) {
        runnerRef.current = null;
      }
    };
  }, [isActive, rootRef, runnerVersion, seekTargetStepIndex, timeline, timings]);

  useEffect(() => {
    const runner = runnerRef.current;
    if (!runner) return;

    if (isActive) {
      runner.play();
      return;
    }

    runner.pause();
  }, [isActive]);

  return {
    status,
    progress,
    elapsedMs,
    durationMs,
    currentStepIndex,
    play: () => runnerRef.current?.play(),
    pause: () => runnerRef.current?.pause(),
    restart: () => {
      setSeekTargetStepIndex(0);
      setRunnerVersion((prev) => prev + 1);
    },
    jumpToStep: (stepIndex: number) => {
      shouldAutoplayRef.current = status === "playing";
      setSeekTargetStepIndex(stepIndex);
      setRunnerVersion((prev) => prev + 1);
    },
    runnerVersion,
  };
}
