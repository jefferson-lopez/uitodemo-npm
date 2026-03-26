import { getDemoTarget } from "./dom";
import { runDemoStep } from "./actions";
import {
  getStepDuration,
  getTimelineDuration,
} from "./timeline-metadata";
import type { DemoStatus, DemoTimeline, DemoTimingConfig } from "../types";

type TimelineRunnerOptions = {
  root: HTMLElement;
  timeline: DemoTimeline;
  timings: DemoTimingConfig;
  onStatusChange: (status: DemoStatus) => void;
  onStepChange?: (stepIndex: number) => void;
  onProgressChange?: (progress: number) => void;
  onTimeChange?: (elapsedMs: number, durationMs: number) => void;
};

export function createTimelineRunner({
  root,
  timeline,
  timings,
  onStatusChange,
  onStepChange,
  onProgressChange,
  onTimeChange,
}: TimelineRunnerOptions) {
  let currentStepIndex = 0;
  let status: DemoStatus = "idle";
  let cancelled = false;
  let loopPromise: Promise<void> | null = null;
  let elapsedMs = 0;
  const totalDurationMs = getTimelineDuration(timeline, timings);

  const syncTime = () => {
    const safeElapsedMs = Math.min(elapsedMs, totalDurationMs);
    onProgressChange?.(Math.min(1, safeElapsedMs / totalDurationMs));
    onTimeChange?.(safeElapsedMs, totalDurationMs);
  };

  const wait = async (durationMs: number) => {
    let remaining = Math.max(0, durationMs);

    while (!cancelled && remaining > 0) {
      if (status === "paused") {
        await sleep(50);
        continue;
      }

      const chunk = Math.min(remaining, 50);
      await sleep(chunk);
      elapsedMs += chunk;
      syncTime();
      remaining -= chunk;
    }

    return !cancelled;
  };

  const run = async () => {
    while (!cancelled && currentStepIndex < timeline.length) {
      if (status === "paused") {
        await sleep(50);
        continue;
      }

      const step = timeline[currentStepIndex];
      onStepChange?.(currentStepIndex);

      const completedStep = await runDemoStep(step, {
        root,
        getTarget: (target) => getDemoTarget(root, target),
        wait,
        timings,
      });

      if (!completedStep || cancelled) return;

      currentStepIndex += 1;
    }

    if (!cancelled) {
      status = "completed";
      elapsedMs = totalDurationMs;
      syncTime();
      onStatusChange(status);
    }
  };

  return {
    play() {
      if (timeline.length === 0 || cancelled) return;

      if (status === "completed") {
        currentStepIndex = 0;
        elapsedMs = 0;
        onStepChange?.(0);
        syncTime();
      }

      if (status === "playing") return;

      status = "playing";
      onStatusChange(status);

      if (!loopPromise) {
        loopPromise = run().finally(() => {
          loopPromise = null;
        });
      }
    },
    pause() {
      if (status !== "playing") return;

      status = "paused";
      onStatusChange(status);
    },
    restart() {
      currentStepIndex = 0;
      elapsedMs = 0;
      onStepChange?.(0);
      syncTime();
      status = "playing";
      onStatusChange(status);

      if (!loopPromise) {
        loopPromise = run().finally(() => {
          loopPromise = null;
        });
      }
    },
    cancel() {
      cancelled = true;
    },
    async seek(targetStepIndex: number, autoplay: boolean) {
      currentStepIndex = 0;
      elapsedMs = 0;
      syncTime();

      const safeTargetStepIndex = Math.max(
        0,
        Math.min(targetStepIndex, timeline.length - 1),
      );

      for (let index = 0; index < safeTargetStepIndex; index += 1) {
        const step = timeline[index];
        onStepChange?.(index);

        const completedStep = await runDemoStep(step, {
          root,
          getTarget: (target) => getDemoTarget(root, target),
          wait,
          timings,
          instant: true,
        });

        if (!completedStep || cancelled) return;

        elapsedMs += getStepDuration(step, timings);
        syncTime();
      }

      currentStepIndex = safeTargetStepIndex;
      onStepChange?.(currentStepIndex);

      if (currentStepIndex >= timeline.length) {
        status = "completed";
        elapsedMs = totalDurationMs;
        syncTime();
        onStatusChange(status);
        return;
      }

      status = autoplay ? "playing" : "paused";
      onStatusChange(status);

      if (autoplay && !loopPromise) {
        loopPromise = run().finally(() => {
          loopPromise = null;
        });
      }
    },
    getStatus() {
      return status;
    },
  };
}

function sleep(durationMs: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}
