"use client";

import type { CSSProperties } from "react";
import type { DemoHighlightState } from "../types";

export default function DemoHighlight({
  highlight,
}: {
  highlight: DemoHighlightState;
}) {
  if (!highlight) return null;

  const style: CSSProperties = {
    position: "absolute",
    pointerEvents: "none",
    top: highlight.rect.top - 6,
    left: highlight.rect.left - 6,
    width: highlight.rect.width + 12,
    height: highlight.rect.height + 12,
    borderRadius: 24,
    border: "2px solid rgba(255,255,255,0.85)",
    background: "rgba(255,255,255,0.08)",
    boxShadow: "0 0 0 999px rgba(0,0,0,0.08)",
    transition: "all 200ms ease-out",
  };

  return <div aria-hidden="true" style={style} />;
}
