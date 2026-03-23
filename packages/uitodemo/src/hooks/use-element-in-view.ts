"use client";

import { useEffect, useState, type RefObject } from "react";

type UseElementInViewOptions = {
  amount?: number;
};

export function useElementInView(
  ref: RefObject<Element | null>,
  { amount = 0.25 }: UseElementInViewOptions = {},
) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: amount },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [amount, ref]);

  return isInView;
}
