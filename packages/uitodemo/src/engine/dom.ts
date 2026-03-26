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

export function isTextDemoTarget(element: HTMLElement) {
  return Boolean(
    element.matches(
      "input,textarea,[contenteditable='true'],[data-slot='input-group-control']",
    ) ||
      element.closest(
        "input,textarea,[contenteditable='true'],[data-slot='input-group-control']",
      ),
  );
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

function canScrollElement(element: HTMLElement) {
  if (typeof window === "undefined") return false;

  const styles = window.getComputedStyle(element);
  const overflowY = styles.overflowY;

  return (
    (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
    element.scrollHeight > element.clientHeight
  );
}

export function getScrollParent(element: HTMLElement, root: HTMLElement) {
  let current = element.parentElement;

  while (current && current !== root) {
    if (canScrollElement(current)) {
      return current;
    }

    current = current.parentElement;
  }

  return canScrollElement(root) ? root : null;
}

export function scrollDemoTargetIntoView(
  root: HTMLElement,
  element: HTMLElement,
  options: {
    align?: ScrollLogicalPosition;
    behavior?: ScrollBehavior;
  } = {},
) {
  const align = options.align ?? "center";
  const behavior = options.behavior ?? "smooth";
  const scrollParent = getScrollParent(element, root);

  if (!scrollParent) {
    element.scrollIntoView({
      behavior,
      block: align,
      inline: "nearest",
    });
    return;
  }

  const parentRect = scrollParent.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const relativeTop = elementRect.top - parentRect.top + scrollParent.scrollTop;
  const visibleTopOffset = elementRect.top - parentRect.top;
  let nextScrollTop = scrollParent.scrollTop;

  if (align === "start") {
    nextScrollTop = relativeTop;

    // Snap all the way to the start when the target already lives near the top.
    if (visibleTopOffset <= Math.max(24, scrollParent.clientHeight * 0.15)) {
      nextScrollTop = 0;
    }
  } else if (align === "end") {
    nextScrollTop = relativeTop - scrollParent.clientHeight + elementRect.height;
  } else {
    nextScrollTop =
      relativeTop - scrollParent.clientHeight / 2 + elementRect.height / 2;
  }

  const maxScrollTop = Math.max(
    0,
    scrollParent.scrollHeight - scrollParent.clientHeight,
  );
  const clampedScrollTop = Math.min(Math.max(0, nextScrollTop), maxScrollTop);

  scrollParent.scrollTo({
    top: clampedScrollTop,
    behavior,
  });
}
