"use client";

import { createTimelineRunner } from "../engine/timeline-runner";
import type { DemoStatus, DemoTimeline, DemoTimingConfig } from "../types";
import { useEffect, useRef, useState, type RefObject } from "react";

type UseDemoControllerOptions = {
  rootRef: RefObject<HTMLElement | null>;
  timeline: DemoTimeline;
  isActive: boolean;
  timings: DemoTimingConfig;
  metricsCommitIntervalMs?: number;
  runnerMetricsConfig?: {
    timeSyncIntervalMs?: number;
    pausePollIntervalMs?: number;
    typeChunkSize?: number;
  };
};

export function useDemoController({
  rootRef,
  timeline,
  isActive,
  timings,
  metricsCommitIntervalMs = 250,
  runnerMetricsConfig,
}: UseDemoControllerOptions) {
  const runnerRef = useRef<ReturnType<typeof createTimelineRunner> | null>(null);
  const shouldAutoplayRef = useRef(isActive);
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [playbackMetrics, setPlaybackMetrics] = useState({
    progress: 0,
    elapsedMs: 0,
    durationMs: 0,
  });
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [runnerVersion, setRunnerVersion] = useState(0);
  const [seekTargetStepIndex, setSeekTargetStepIndex] = useState<number | null>(
    null,
  );
  const playbackMetricsRef = useRef(playbackMetrics);
  const lastMetricsCommitAtRef = useRef(0);

  const commitPlaybackMetrics = (force = false) => {
    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    if (
      !force &&
      now - lastMetricsCommitAtRef.current < metricsCommitIntervalMs
    ) {
      return;
    }

    lastMetricsCommitAtRef.current = now;
    setPlaybackMetrics((prev) => {
      const next = playbackMetricsRef.current;
      if (
        prev.progress === next.progress &&
        prev.elapsedMs === next.elapsedMs &&
        prev.durationMs === next.durationMs
      ) {
        return prev;
      }

      return next;
    });
  };

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
      playbackMetricsRef.current = { progress: 0, elapsedMs: 0, durationMs: 0 };
      lastMetricsCommitAtRef.current = 0;
      setPlaybackMetrics(playbackMetricsRef.current);
      setCurrentStepIndex(0);
    }

    const runner = createTimelineRunner({
      root,
      timeline,
      timings,
      metricsConfig: runnerMetricsConfig,
      onStatusChange: (nextStatus) => {
        setStatus(nextStatus);
        if (nextStatus !== "playing") {
          commitPlaybackMetrics(true);
        }
      },
      onStepChange: setCurrentStepIndex,
      onProgressChange: (nextProgress) => {
        playbackMetricsRef.current = {
          ...playbackMetricsRef.current,
          progress: nextProgress,
        };
      },
      onTimeChange: (nextElapsedMs, nextDurationMs) => {
        playbackMetricsRef.current = {
          ...playbackMetricsRef.current,
          elapsedMs: nextElapsedMs,
          durationMs: nextDurationMs,
        };
        commitPlaybackMetrics(
          nextElapsedMs === 0 || nextElapsedMs === nextDurationMs,
        );
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
  }, [
    isActive,
    metricsCommitIntervalMs,
    rootRef,
    runnerMetricsConfig,
    runnerVersion,
    seekTargetStepIndex,
    timeline,
    timings,
  ]);

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
    progress: playbackMetrics.progress,
    elapsedMs: playbackMetrics.elapsedMs,
    durationMs: playbackMetrics.durationMs,
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
