import { dispatchInputEvents, setElementValue } from "./dom";
import type { DemoHighlightState, DemoStep } from "../types";

const CLICK_SETTLE_DELAY_MS = 380;
const CLICK_ACTION_DELAY_MS = 320;
const TYPE_SETTLE_DELAY_MS = 900;

type DemoActionContext = {
  root: HTMLElement;
  getTarget: (target: string) => HTMLElement | null;
  onHighlightChange: (highlight: DemoHighlightState) => void;
  wait: (ms: number) => Promise<boolean>;
  instant?: boolean;
};

export async function runDemoStep(step: DemoStep, context: DemoActionContext) {
  switch (step.type) {
    case "wait":
      return context.wait(step.delay ?? 0);
    case "click":
      return clickTarget(step, context);
    case "focus":
      return focusTarget(step, context);
    case "highlight":
      return highlightTarget(step, context);
    case "type":
      return typeIntoTarget(step, context);
    default:
      return true;
  }
}

async function clickTarget(step: DemoStep, context: DemoActionContext) {
  if (!step.target) return true;

  const element = context.getTarget(step.target);
  if (!element) return true;

  if (!context.instant) {
    const completed = await context.wait(CLICK_SETTLE_DELAY_MS);
    if (!completed) return false;
  }

  if (!context.instant) {
    const completed = await context.wait(CLICK_ACTION_DELAY_MS);
    if (!completed) return false;
  }

  element?.click();

  return true;
}

function focusTarget(step: DemoStep, context: DemoActionContext) {
  if (!step.target) return true;

  return true;
}

async function highlightTarget(step: DemoStep, context: DemoActionContext) {
  if (context.instant) return true;

  if ((step.delay ?? 0) > 0) {
    const completed = await context.wait(step.delay ?? 0);
    if (!completed) return false;
  }

  return true;
}

async function typeIntoTarget(step: DemoStep, context: DemoActionContext) {
  if (!step.target) return true;

  const element = context.getTarget(step.target);
  if (!element) return true;

  setElementValue(element, "");
  dispatchInputEvents(element);

  const value = step.value ?? "";
  if (context.instant) {
    setElementValue(element, value);
    dispatchInputEvents(element);
    return true;
  }

  {
    const completed = await context.wait(TYPE_SETTLE_DELAY_MS);
    if (!completed) return false;
  }

  const baseDelay = step.delay ?? 80;
  let typedValue = "";

  for (let index = 0; index < value.length; index += 1) {
    typedValue = `${typedValue}${value[index]}`;
    setElementValue(element, typedValue);
    dispatchInputEvents(element);
    setElementValue(element, `${typedValue}|`);

    const completed = await context.wait(baseDelay);
    if (!completed) return false;
  }

  setElementValue(element, value);
  dispatchInputEvents(element);

  return true;
}
