"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function MagneticCursor() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Only on desktop
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;

    let clientX = -100;
    let clientY = -100;
    let outerX = -100;
    let outerY = -100;
    let isHovering = false;
    let hoverType = "";

    const onMouseMove = (e: MouseEvent) => {
      clientX = e.clientX;
      clientY = e.clientY;
      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${clientX}px, ${clientY}px) translate(-50%, -50%)`;
      }
    };

    const render = () => {
      // Lerp for outer cursor (smooth delay)
      outerX += (clientX - outerX) * 0.15;
      outerY += (clientY - outerY) * 0.15;

      if (outerRef.current) {
        outerRef.current.style.transform = `translate(${outerX}px, ${outerY}px) translate(-50%, -50%)`;
      }
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);

    const handleHoverIn = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      isHovering = true;
      if (!outerRef.current || !innerRef.current || !textRef.current) return;

      const isCta = target.tagName === "A" || target.tagName === "BUTTON";
      const isImg = target.tagName === "IMG";

      if (isCta) {
        hoverType = "cta";
        outerRef.current.style.width = "80px";
        outerRef.current.style.height = "80px";
        outerRef.current.style.background = "rgba(200,153,42,0.15)";
        outerRef.current.style.borderColor = "transparent";
        innerRef.current.style.transform = `translate(${clientX}px, ${clientY}px) translate(-50%, -50%) scale(0)`;
        textRef.current.innerText = target.textContent?.toLowerCase().includes("insc") ? "ALLER" : "VOIR";
        textRef.current.style.opacity = "1";
      } else if (isImg) {
        hoverType = "img";
        outerRef.current.style.width = "100px";
        outerRef.current.style.height = "100px";
        outerRef.current.style.background = "var(--forest)";
        outerRef.current.style.borderColor = "transparent";
        innerRef.current.style.transform = `translate(${clientX}px, ${clientY}px) translate(-50%, -50%) scale(0)`;
        textRef.current.innerText = "EXPLORER";
        textRef.current.style.color = "var(--gold-pale)";
        textRef.current.style.opacity = "1";
      } else {
        hoverType = "link";
        outerRef.current.style.width = "60px";
        outerRef.current.style.height = "60px";
        outerRef.current.style.background = "rgba(200,153,42,0.1)";
        innerRef.current.style.transform = `translate(${clientX}px, ${clientY}px) translate(-50%, -50%) scale(0)`;
      }
    };

    const handleHoverOut = () => {
      isHovering = false;
      hoverType = "";
      if (!outerRef.current || !innerRef.current || !textRef.current) return;
      outerRef.current.style.width = "40px";
      outerRef.current.style.height = "40px";
      outerRef.current.style.background = "transparent";
      outerRef.current.style.borderColor = "rgba(200,153,42,0.5)";
      innerRef.current.style.transform = `translate(${clientX}px, ${clientY}px) translate(-50%, -50%) scale(1)`;
      textRef.current.style.opacity = "0";
      textRef.current.style.color = "var(--forest)";
    };

    const attachListeners = () => {
      const elements = document.querySelectorAll("a, button, img, input, select, textarea, [role='checkbox'], .magnetic");
      elements.forEach((el) => {
        el.addEventListener("mouseenter", handleHoverIn);
        el.addEventListener("mouseleave", handleHoverOut);
      });
      return elements;
    };

    window.addEventListener("mousemove", onMouseMove);
    let elements = attachListeners();

    // Re-attach listeners when DOM changes (simplified)
    const observer = new MutationObserver(() => {
      elements.forEach(el => {
        el.removeEventListener("mouseenter", handleHoverIn);
        el.removeEventListener("mouseleave", handleHoverOut);
      });
      setTimeout(() => { elements = attachListeners(); }, 500);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      observer.disconnect();
      elements.forEach(el => {
        el.removeEventListener("mouseenter", handleHoverIn);
        el.removeEventListener("mouseleave", handleHoverOut);
      });
    };
  }, [pathname]);

  return (
    <>
      <div
        id="cursor-outer"
        ref={outerRef}
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[99999] hidden lg:flex items-center justify-center mix-blend-difference"
        style={{
          width: 40,
          height: 40,
          border: "1px solid rgba(200,153,42,0.5)",
          transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease, border-color 0.3s ease",
          transform: "translate(-100px, -100px)",
        }}
      >
        <span
          ref={textRef}
          className="font-body text-[8px] font-bold tracking-[2px] opacity-0 transition-opacity duration-300"
          style={{ color: "var(--forest)" }}
        />
      </div>
      <div
        id="cursor-inner"
        ref={innerRef}
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[99999] hidden lg:block mix-blend-difference"
        style={{
          width: 6,
          height: 6,
          background: "var(--gold)",
          transition: "transform 0.1s ease",
          transform: "translate(-100px, -100px)",
        }}
      />
    </>
  );
}
