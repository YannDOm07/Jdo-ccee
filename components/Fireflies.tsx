"use client";

import { useEffect, useState } from "react";

interface Firefly {
  id: number;
  top: number;
  left: number;
  size: number;
  opacityBase: number;
  duration: number;
  delay: number;
}

export function Fireflies({ isMobile = false }) {
  const [fireflies, setFireflies] = useState<Firefly[]>([]);

  useEffect(() => {
    const count = isMobile ? 8 : 18;
    const generated: Firefly[] = [];
    for (let i = 0; i < count; i++) {
      generated.push({
        id: i,
        top: 20 + Math.random() * 60, // Avoid edges
        left: 10 + Math.random() * 80,
        size: 3 + Math.random() * 3, // 3-6px
        opacityBase: 0.4 + Math.random() * 0.2,
        duration: 4 + Math.random() * 4, // 4-8s
        delay: Math.random() * -8,
      });
    }
    setFireflies(generated);
  }, [isMobile]);

  if (fireflies.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
      {fireflies.map((fly) => (
        <div
          key={fly.id}
          className="absolute rounded-full will-change-transform"
          style={{
            top: `${fly.top}%`,
            left: `${fly.left}%`,
            width: `${fly.size}px`,
            height: `${fly.size}px`,
            background: `rgba(200, 153, 42, ${fly.opacityBase})`,
            boxShadow: `0 0 ${fly.size * 2}px rgba(232, 192, 96, 0.6)`,
            animation: `firefly-anim ${fly.duration}s ease-in-out ${fly.delay}s infinite`,
          }}
        />
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes firefly-anim {
          0%,100% { opacity: 0; transform: scale(0.5) translate(0,0) }
          25%     { opacity: 0.8; transform: scale(1.2) translate(4px,-4px) }
          50%     { opacity: 0.3; transform: scale(0.8) translate(8px,-12px) }
          75%     { opacity: 0.6; transform: scale(1) translate(-5px,8px) }
        }
      `}} />
    </div>
  );
}
