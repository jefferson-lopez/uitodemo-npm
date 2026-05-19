"use client";

import iconPlayerPause from "@tabler/icons/outline/player-pause.svg";
import iconPlayerPlay from "@tabler/icons/outline/player-play.svg";
import iconRotate from "@tabler/icons/outline/rotate.svg";
import type { ReactNode } from "react";
import type { DemoStatus } from "../types";
import { useDemoPlaybackContext } from "./demo-player-context";
import DemoProgress from "./demo-progress";

type DemoControlsProps = {
  className?: string;
  status: DemoStatus;
  progress?: number;
  elapsedMs?: number;
  durationMs?: number;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  playLabel: string;
  pauseLabel: string;
  restartLabel: string;
};

export default function DemoControls({
  className,
  status,
  progress,
  elapsedMs,
  durationMs,
  onPlay,
  onPause,
  onRestart,
  playLabel,
  pauseLabel,
  restartLabel,
}: Partial<DemoControlsProps>) {
  const context = useDemoPlaybackContext();
  const resolvedStatus = status ?? context?.status ?? "idle";
  const resolvedProgress = progress ?? context?.progress ?? 0;
  const resolvedElapsedMs = elapsedMs ?? context?.elapsedMs ?? 0;
  const resolvedDurationMs = durationMs ?? context?.durationMs ?? 0;
  const resolvedOnPlay = onPlay ?? context?.play ?? (() => undefined);
  const resolvedOnPause = onPause ?? context?.pause ?? (() => undefined);
  const resolvedOnRestart = onRestart ?? context?.restart ?? (() => undefined);
  const resolvedPlayLabel = playLabel ?? "Play demo";
  const resolvedPauseLabel = pauseLabel ?? "Pause demo";
  const resolvedRestartLabel = restartLabel ?? "Restart demo";
  const isCompoundUsage = Boolean(context && status === undefined && onPlay === undefined);
  const scale = Math.max(context?.scale ?? 1, 0.01);

  const isPlaying = resolvedStatus === "playing";
  const rootStyle = isCompoundUsage
    ? {
        pointerEvents: "none" as const,
        position: "absolute" as const,
        inset: 0,
        zIndex: 50,
        display: context?.areControlsVisible ? "flex" : "none",
        alignItems: "flex-end" as const,
        opacity: context?.areControlsVisible ? 1 : 0,
        transition: "opacity 200ms ease-out",
      }
    : undefined;

  const innerScaleStyle = isCompoundUsage
    ? {
        pointerEvents: "auto" as const,
        position: "relative" as const,
        width: `${scale * 100}%`,
        left: "50%",
        transform: `translateX(-50%) scale(${1 / scale})`,
        transformOrigin: "bottom center",
      }
    : undefined;

  return (
    <div className={className} style={rootStyle}>
      <div style={innerScaleStyle}>
        <div
          style={{
            position: "relative",
            width: "100%",
            padding: isCompoundUsage ? "16px 20px 20px" : undefined,
            background: isCompoundUsage
              ? "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.16) 35%, rgba(0,0,0,0.38) 100%)"
              : undefined,
          }}
        >
          <div
            style={{
              width: "100%",
              color: "white",
              display: "grid",
              gap: 12,
              borderBottomLeftRadius: 18,
              borderBottomRightRadius: 18,
              overflow: "hidden",
            }}
          >
            <DemoProgress progress={resolvedProgress} />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <IconButton
                  label={resolvedRestartLabel}
                  onClick={resolvedOnRestart}
                  icon={<RotateIcon />}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <IconButton
                  label={isPlaying ? resolvedPauseLabel : resolvedPlayLabel}
                  onClick={isPlaying ? resolvedOnPause : resolvedOnPlay}
                  icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
                  size={44}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div
                  style={{
                    minHeight: 40,
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0 12px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.22)",
                    background: "rgba(17,17,17,0.72)",
                    fontSize: 14,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatPlayerTime(resolvedElapsedMs)} / {formatPlayerTime(resolvedDurationMs)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  icon,
  size = 40,
}: {
  label: string;
  onClick: () => void;
  icon: ReactNode;
  size?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.22)",
        background: "rgba(17,17,17,0.78)",
        color: "white",
        cursor: "pointer",
      }}
    >
      {icon}
    </button>
  );
}

function PlayIcon() {
  return <IconAsset src={iconPlayerPlay} alt="" size={18} marginLeft={2} />;
}

function PauseIcon() {
  return <IconAsset src={iconPlayerPause} alt="" size={18} />;
}

function RotateIcon() {
  return <IconAsset src={iconRotate} alt="" size={16} />;
}

function IconAsset({
  src,
  alt,
  size,
  marginLeft = 0,
}: {
  src: string;
  alt: string;
  size: number;
  marginLeft?: number;
}) {
  return <img src={src} alt={alt} aria-hidden="true" style={{ width: size, height: size, userSelect: "none", filter: "invert(1)", marginLeft }} />;
}

function formatPlayerTime(durationMs: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
