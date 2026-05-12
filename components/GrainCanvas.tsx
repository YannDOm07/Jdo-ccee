"use client";

import { useEffect, useRef } from "react";

export function GrainCanvas({ opacity = 0.08 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Perf optimization: don't run on low-end devices
    // @ts-ignore
    if (navigator.deviceMemory && navigator.deviceMemory < 4) return;

    // Use a smaller canvas for grain generation and scale it up to save CPU
    const grainSize = 128;
    const grainCanvas = document.createElement("canvas");
    grainCanvas.width = grainSize;
    grainCanvas.height = grainSize;
    const grainCtx = grainCanvas.getContext("2d");
    if (!grainCtx) return;

    const generateGrain = () => {
      const imageData = grainCtx.createImageData(grainSize, grainSize);
      const buffer32 = new Uint32Array(imageData.data.buffer);
      for (let i = 0; i < buffer32.length; i++) {
        buffer32[i] = Math.random() < 0.5 ? 0xffffffff : 0xff000000;
      }
      grainCtx.putImageData(imageData, 0, 0);
    };

    // Pre-generate 3 patterns to cycle through
    const patterns: HTMLCanvasElement[] = [];
    for (let i = 0; i < 3; i++) {
      generateGrain();
      const p = document.createElement("canvas");
      p.width = grainSize;
      p.height = grainSize;
      p.getContext("2d")?.drawImage(grainCanvas, 0, 0);
      patterns.push(p);
    }

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    let patternIndex = 0;
    let interval: NodeJS.Timeout;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      const pattern = ctx.createPattern(patterns[patternIndex], "repeat");
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, w, h);
      }
      patternIndex = (patternIndex + 1) % patterns.length;
      interval = setTimeout(() => requestAnimationFrame(animate), 150); // Slower refresh
    };
    
    animate();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 mix-blend-overlay"
      style={{ opacity }}
    />
  );
}
