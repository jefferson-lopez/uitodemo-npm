import type { DemoCursorVariant } from "../types";

export function getTargetAnchorPoint(
  rect: DOMRect,
  anchor: string | undefined,
  offsetX: number,
  offsetY: number,
) {
  let x = rect.left + rect.width / 2;
  let y = rect.top + rect.height / 2;

  switch (anchor) {
    case "left-center":
      x = rect.left;
      y = rect.top + rect.height / 2;
      break;
    case "right-center":
      x = rect.right;
      y = rect.top + rect.height / 2;
      break;
    case "top-center":
      y = rect.top;
      break;
    case "bottom-center":
      y = rect.bottom;
      break;
    case "top-left":
      x = rect.left;
      y = rect.top;
      break;
    case "top-right":
      x = rect.right;
      y = rect.top;
      break;
    case "bottom-left":
      x = rect.left;
      y = rect.bottom;
      break;
    case "bottom-right":
      x = rect.right;
      y = rect.bottom;
      break;
    default:
      break;
  }

  return { x: x + offsetX, y: y + offsetY };
}

export function getStableHumanizedOffset(
  key: string,
  variant: DemoCursorVariant,
  stepIndex: number,
  rect: DOMRect,
) {
  const seedSource = `${key}:${variant}:${stepIndex}`;
  let hash = 0;

  for (let index = 0; index < seedSource.length; index += 1) {
    hash = (hash * 31 + seedSource.charCodeAt(index)) >>> 0;
  }

  const normalizedX = ((hash & 0xffff) / 0xffff) * 2 - 1;
  const normalizedY = (((hash >>> 16) & 0xffff) / 0xffff) * 2 - 1;
  const maxOffsetX =
    variant === "text"
      ? Math.min(7, rect.width * 0.08)
      : Math.min(12, rect.width * 0.12);
  const maxOffsetY =
    variant === "text"
      ? Math.min(3, rect.height * 0.08)
      : Math.min(8, rect.height * 0.16);

  return {
    x: normalizedX * maxOffsetX,
    y: normalizedY * maxOffsetY,
  };
}

export function getDefaultInteractiveOffset(
  rect: DOMRect,
  variant: DemoCursorVariant,
  element: HTMLElement,
) {
  if (variant === "text") {
    return { x: 0, y: -8 };
  }

  const isButtonLike = Boolean(
    element.matches("button,[data-slot='button']") ||
      element.closest("button,[data-slot='button']"),
  );

  if (isButtonLike) {
    return {
      x: Math.min(2, rect.width * 0.02),
      y: Math.min(5, rect.height * 0.14),
    };
  }

  return { x: 0, y: 0 };
}

export function getCursorVisualTransform(variant: DemoCursorVariant) {
  switch (variant) {
    case "pointer":
      return "translate(-11px, -6px)";
    case "text":
      return "translate(-1px, -3px)";
    default:
      return "translate(-3px, -3px)";
  }
}
