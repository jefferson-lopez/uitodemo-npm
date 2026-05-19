"use client";

import type { CSSProperties } from "react";
import { useDemoPlaybackContext } from "./demo-player-context";

type DemoProgressProps = {
  progress?: number;
  className?: string;
};

export default function DemoProgress({
  progress,
  className,
}: DemoProgressProps) {
  const context = useDemoPlaybackContext();
  const visibleProgress = Math.max(
    0,
    Math.min(1, progress ?? context?.progress ?? 0),
  );

  const style: CSSProperties = {
    position: "relative",
    height: 8,
    borderRadius: 999,
    background: "rgba(255,255,255,0.22)",
    overflow: "visible",
  };

  return (
    <div className={className} style={style}>
      <div
        aria-hidden="true"
        style={{
          width: `${visibleProgress * 100}%`,
          height: "100%",
          borderRadius: 999,
          background: "rgba(255,255,255,0.92)",
          transition: "width 75ms linear",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: `calc(${visibleProgress * 100}% - 6px)`,
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "white",
          boxShadow: "0 0 0 4px rgba(255,255,255,0.16)",
          transform: "translateY(-50%)",
          transition: "left 75ms linear",
        }}
      />
    </div>
  );
}
