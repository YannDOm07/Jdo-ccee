"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";

export function KonamiCode() {
  useEffect(() => {
    const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let input: string[] = [];

    const onKeyDown = (e: KeyboardEvent) => {
      input.push(e.key);
      input = input.slice(-10);

      if (JSON.stringify(input) === JSON.stringify(konami)) {
        // Trigger Konami
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#C8992A', '#1B3A1F', '#ffffff']
        });
        toast("Mode développeur activé ! ✨", {
          description: "Jardin des Oliviers 2026 - Awwwards Edition",
          style: { background: "var(--forest)", color: "var(--gold)", border: "none" }
        });
        
        // Try audio
        try {
          const audio = new Audio("https://actions.google.com/sounds/v1/alarms/chime_bell_short.ogg");
          audio.volume = 0.2;
          audio.play();
        } catch (e) {}

        input = []; // Reset
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
