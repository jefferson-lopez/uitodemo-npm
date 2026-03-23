function getInputValueSetter() {
  if (typeof window === "undefined") return null;

  return Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )?.set;
}

function getTextareaValueSetter() {
  if (typeof window === "undefined") return null;

  return Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value",
  )?.set;
}

export function getDemoTarget(root: HTMLElement, target: string) {
  return root.querySelector<HTMLElement>(
    `[data-demo="${target}"],[data-demo-id="${target}"]`,
  );
}

export function setElementValue(element: HTMLElement, value: string) {
  if (element instanceof HTMLInputElement) {
    getInputValueSetter()?.call(element, value);
  } else if (element instanceof HTMLTextAreaElement) {
    getTextareaValueSetter()?.call(element, value);
  } else if (element.isContentEditable) {
    element.textContent = value;
  }
}

export function readElementValue(element: HTMLElement) {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value;
  }

  return element.textContent ?? "";
}

export function dispatchInputEvents(element: HTMLElement) {
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

export function getRelativeRect(container: HTMLElement, element: HTMLElement) {
  const containerRect = container.getBoundingClientRect();
  const rect = element.getBoundingClientRect();

  return {
    top: rect.top - containerRect.top,
    left: rect.left - containerRect.left,
    width: rect.width,
    height: rect.height,
  };
}
