"use client";

import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from "react";
import { ROOT_DEMO_TARGET } from "../config/defaults";
import { useDemoStageContext } from "./demo-player-context";

export default function DemoStage({ children }: { children: ReactNode }) {
  const context = useDemoStageContext();

  if (!context) {
    return <>{children}</>;
  }

  const style: CSSProperties = {
    ...context.stageStyle,
    cursor: context.hideNativeCursor ? "none" : context.stageStyle.cursor,
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!context.userPointerDownRef.current) return;
    context.userPointerDownRef.current = false;
    if (!event.isTrusted) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("[data-demo-controls]")) return;
    if (context.status === "playing") {
      context.pause();
      return;
    }
    context.play();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.code !== "Space") return;
    event.preventDefault();
    if (context.status === "playing") {
      context.pause();
      return;
    }
    context.play();
  };

  return (
    <div
      ref={context.rootRef}
      style={style}
      tabIndex={0}
      onMouseEnter={() => {
        context.setIsPointerInsideDemo(true);
        context.markPointerActivity();
      }}
      onMouseMove={context.markPointerActivity}
      onMouseLeave={() => {
        context.setIsPointerInsideDemo(false);
        context.clearPointerActivity();
      }}
      onPointerDown={() => {
        context.userPointerDownRef.current = true;
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div
        demo-id={ROOT_DEMO_TARGET}
        key={context.runnerVersion}
        style={{ pointerEvents: "none", height: "100%" }}
      >
        {children}
      </div>
    </div>
  );
}
