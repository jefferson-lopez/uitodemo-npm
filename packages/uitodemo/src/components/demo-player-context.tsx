"use client";

import { createContext, useContext, type CSSProperties, type RefObject } from "react";
import type { DemoCursorVariant, DemoStatus } from "../types";

export type DemoStageContextValue = {
  rootRef: RefObject<HTMLDivElement | null>;
  runnerVersion: number;
  status: DemoStatus;
  play: () => void;
  pause: () => void;
  markPointerActivity: () => void;
  clearPointerActivity: () => void;
  setIsPointerInsideDemo: (value: boolean) => void;
  userPointerDownRef: RefObject<boolean>;
  hideNativeCursor: boolean;
  stageStyle: CSSProperties;
};

export type DemoPlaybackContextValue = {
  cursorElementRef: RefObject<HTMLDivElement | null>;
  status: DemoStatus;
  progress: number;
  elapsedMs: number;
  durationMs: number;
  play: () => void;
  pause: () => void;
  restart: () => void;
  areControlsVisible: boolean;
  showCenterOverlayButton: boolean;
  cursorEnabled: boolean;
  cursorVisible: boolean;
  cursorClicking: boolean;
  cursorVariant: DemoCursorVariant;
  cursorSrc: string;
  cursorVisualStyle: CSSProperties;
  scale: number | null;
};

const DemoStageContext = createContext<DemoStageContextValue | null>(null);
const DemoPlaybackContext = createContext<DemoPlaybackContextValue | null>(null);

export function DemoStageProvider({
  value,
  children,
}: {
  value: DemoStageContextValue;
  children: React.ReactNode;
}) {
  return (
    <DemoStageContext.Provider value={value}>
      {children}
    </DemoStageContext.Provider>
  );
}

export function DemoPlaybackProvider({
  value,
  children,
}: {
  value: DemoPlaybackContextValue;
  children: React.ReactNode;
}) {
  return (
    <DemoPlaybackContext.Provider value={value}>
      {children}
    </DemoPlaybackContext.Provider>
  );
}

export function useDemoStageContext() {
  return useContext(DemoStageContext);
}

export function useDemoPlaybackContext() {
  return useContext(DemoPlaybackContext);
}
