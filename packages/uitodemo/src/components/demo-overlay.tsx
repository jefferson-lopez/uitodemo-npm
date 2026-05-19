"use client";

import type { CSSProperties } from "react";
import { useDemoPlaybackContext } from "./demo-player-context";

export default function DemoOverlay() {
  const context = useDemoPlaybackContext();

  if (!context) return null;

  const scale = Math.max(context.scale ?? 1, 0.01);
  const shouldShowCenterOverlayButton =
    context.showCenterOverlayButton && context.status !== "playing";

  const overlayStyle: CSSProperties = {
    pointerEvents: "none",
    position: "absolute",
    inset: 0,
    zIndex: 50,
  };

  return (
    <>
      {shouldShowCenterOverlayButton ? (
        <div
          style={{
            ...overlayStyle,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: `${scale * 100}%`,
            left: "50%",
            transform: `translateX(-50%) scale(${1 / scale})`,
            transformOrigin: "center center",
          }}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              if (context.status === "completed") {
                context.restart();
                return;
              }
              context.play();
            }}
            aria-label={context.status === "completed" ? "Restart demo" : "Play demo"}
            title={context.status === "completed" ? "Restart demo" : "Play demo"}
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
      {context.cursorEnabled && context.cursorVisible ? (
        <div aria-hidden="true" style={{ ...overlayStyle, zIndex: 40 }}>
          <div
            ref={context.cursorElementRef}
            style={{
              position: "absolute",
              opacity: context.cursorVisible ? 1 : 0,
              transform:
                "translate3d(var(--cursor-x, 0px), var(--cursor-y, 0px), 0)",
              transition: "opacity 200ms ease-out",
            }}
          >
            <div style={context.cursorVisualStyle}>
              <img
                src={context.cursorSrc}
                alt=""
                aria-hidden="true"
                style={{
                  width:
                    context.cursorVariant === "pointer" ||
                    context.cursorVariant === "grab"
                      ? 24
                      : 22,
                  height:
                    context.cursorVariant === "pointer" ||
                    context.cursorVariant === "grab"
                      ? 24
                      : 22,
                  display: "block",
                  userSelect: "none",
                  transform: context.cursorClicking
                    ? context.cursorVariant === "pointer"
                      ? "translateY(1px) scale(0.84)"
                      : "translateY(0.5px) scale(0.92)"
                    : "translateY(0) scale(1)",
                  transition: "transform 300ms ease",
                  animation:
                    context.cursorVariant === "wait"
                      ? "uitodemo-spin 1s linear infinite"
                      : undefined,
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
      <style>{`@keyframes uitodemo-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
