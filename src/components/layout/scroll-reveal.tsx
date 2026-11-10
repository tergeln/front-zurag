"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Progressive enhancement: content remains readable without JavaScript. */
export function ScrollReveal({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!root.current || !window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const elements = root.current.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-reveal", "visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    elements.forEach((element) => {
      if (element.getBoundingClientRect().top > window.innerHeight) element.dataset.reveal = "pending";
      observer.observe(element);
    });
    return () => {
      observer.disconnect();
      elements.forEach((element) => element.removeAttribute("data-reveal"));
    };
  }, []);
  return <div ref={root} className="home-experience">{children}</div>;
}
