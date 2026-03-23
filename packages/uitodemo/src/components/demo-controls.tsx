"use client";

import iconPlayerPause from "@tabler/icons/outline/player-pause.svg";
import iconPlayerPlay from "@tabler/icons/outline/player-play.svg";
import iconRotate from "@tabler/icons/outline/rotate.svg";
import type { ReactNode } from "react";
import type { DemoStatus } from "../types";

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
  progress = 0,
  elapsedMs = 0,
  durationMs = 0,
  onPlay,
  onPause,
  onRestart,
  playLabel,
  pauseLabel,
  restartLabel,
}: DemoControlsProps) {
  const isPlaying = status === "playing";
  const visibleProgress = Math.max(0, Math.min(1, progress));

  return (
    <div
      className={className}
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
      <div
        style={{
          position: "relative",
          height: 8,
          borderRadius: 999,
          background: "rgba(255,255,255,0.22)",
          overflow: "visible",
        }}
      >
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <IconButton label={restartLabel} onClick={onRestart} icon={<RotateIcon />} />
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <IconButton
            label={isPlaying ? pauseLabel : playLabel}
            onClick={isPlaying ? onPause : onPlay}
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
            {formatPlayerTime(elapsedMs)} / {formatPlayerTime(durationMs)}
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
