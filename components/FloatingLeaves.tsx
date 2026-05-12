"use client";

import { useEffect, useState } from "react";

type LeafType = 'A' | 'B' | 'C';

interface Leaf {
  id: number;
  type: LeafType;
  top: number;
  left: number;
  width: number;
  opacity: number;
  duration: number;
  delay: number;
  zBase: number;
  blur: number;
  r0: number; r1: number; r2: number; r3: number; r4: number;
  dx1: number; dx2: number; dx3: number; dx4: number;
}

export function FloatingLeaves({ isMobile = false }) {
  const [leaves, setLeaves] = useState<Leaf[]>([]);

  useEffect(() => {
    const generated: Leaf[] = [];
    let idCounter = 0;

    const createLeaf = (type: LeafType, minW: number, maxW: number, minO: number, maxO: number, minD: number, maxD: number, blur: number, zBase: number) => {
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const width = minW + Math.random() * (maxW - minW);
      const opacity = minO + Math.random() * (maxO - minO);
      const duration = minD + Math.random() * (maxD - minD);
      const delay = Math.random() * -duration;
      
      const r0 = Math.random() * 360;
      const r1 = r0 + (Math.random() * 40 - 20);
      const r2 = r1 + (Math.random() * 40 - 20);
      const r3 = r2 + (Math.random() * 40 - 20);
      const r4 = r3 + (Math.random() * 40 - 20);

      const dx1 = Math.random() * 40 - 20;
      const dx2 = Math.random() * 40 - 20;
      const dx3 = Math.random() * 40 - 20;
      const dx4 = Math.random() * 40 - 20;

      generated.push({
        id: idCounter++, type, top, left, width, opacity, duration, delay, blur, zBase,
        r0, r1, r2, r3, r4, dx1, dx2, dx3, dx4
      });
    };

    // TYPE A — Grandes feuilles lointaines (désactivées sur mobile pour perfs)
    if (!isMobile) {
      for (let i = 0; i < 5; i++) createLeaf('A', 50, 70, 0.06, 0.10, 12, 18, 1, 1);
    }
    // TYPE B — Feuilles moyennes
    for (let i = 0; i < 8; i++) createLeaf('B', 25, 40, 0.15, 0.25, 8, 13, 0, 2);
    // TYPE C — Petites feuilles proches
    for (let i = 0; i < 5; i++) createLeaf('C', 12, 20, 0.3, 0.45, 5, 9, 0, 3);

    setLeaves(generated);
  }, [isMobile]);

  if (leaves.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden leaf-container">
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="absolute will-change-transform"
          style={{
            top: `${leaf.top}%`,
            left: `${leaf.left}%`,
            width: `${leaf.width}px`,
            opacity: leaf.opacity,
            zIndex: leaf.zBase,
            filter: leaf.blur ? `blur(${leaf.blur}px)` : 'none',
            animation: `leaf-drift-${leaf.id} ${leaf.duration}s ease-in-out ${leaf.delay}s infinite`,
            '--r0': `${leaf.r0}deg`,
            '--r1': `${leaf.r1}deg`,
            '--r2': `${leaf.r2}deg`,
            '--r3': `${leaf.r3}deg`,
            '--r4': `${leaf.r4}deg`,
            '--dx1': `${leaf.dx1}px`,
            '--dx2': `${leaf.dx2}px`,
            '--dx3': `${leaf.dx3}px`,
            '--dx4': `${leaf.dx4}px`,
          } as React.CSSProperties}
        >
          <svg viewBox="0 0 30 80" fill="none" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <path d="M15 2 C22 8, 28 20, 26 35 C24 50, 18 65, 15 78 C12 65, 6 50, 4 35 C2 20, 8 8, 15 2 Z" fill="currentColor" style={{ color: "var(--sage)" }}/>
            <line x1="15" y1="2" x2="15" y2="78" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
          </svg>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes leaf-drift-${leaf.id} {
              0%   { transform: translate(0,0) rotate(var(--r0)) }
              20%  { transform: translate(var(--dx1), -15px) rotate(var(--r1)) }
              40%  { transform: translate(var(--dx2), 5px) rotate(var(--r2)) }
              60%  { transform: translate(var(--dx3), -8px) rotate(var(--r3)) }
              80%  { transform: translate(var(--dx4), 12px) rotate(var(--r4)) }
              100% { transform: translate(0,0) rotate(var(--r0)) }
            }
          `}} />
        </div>
      ))}
    </div>
  );
}
