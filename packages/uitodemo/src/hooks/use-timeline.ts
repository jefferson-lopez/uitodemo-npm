"use client";

import type { DemoTimeline } from "../types";
import { useMemo } from "react";

export function useTimeline(timeline: DemoTimeline) {
  return useMemo(() => timeline, [timeline]);
}
