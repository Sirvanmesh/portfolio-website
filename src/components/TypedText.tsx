"use client";

import { useEffect, useState } from "react";

/**
 * Types `text` out one character at a time after the page loads.
 * The full text is rendered on the server, so it works without JavaScript,
 * and the effect is skipped for people who prefer reduced motion.
 */
export default function TypedText({ text, speed = 70 }: { text: string; speed?: number }) {
  const [shown, setShown] = useState(text);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    setShown("");
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);

  return (
    <>
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{text}</span>
    </>
  );
}
