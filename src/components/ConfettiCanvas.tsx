import { forwardRef, useImperativeHandle, useRef } from 'react';

export interface ConfettiHandle {
  fire: () => void;
}

interface Particle {
  x: number;
  y: number;
  vy: number;
  swaySpeed: number;
  swayAmount: number;
  phase: number;
  rotation: number;
  rotationSpeed: number;
  emoji: string;
  size: number;
}

const PARTY_EMOJIS = ['🎉', '🎒', '⭐', '🧦', '👕', '🧸', '🧢', '✨', '🩳', '🧃', '👟', '💛'];

/**
 * Zabawny deszcz emoji z góry ekranu — wystrzeliwuje,
 * gdy cała kategoria zostanie spakowana.
 */
export const ConfettiCanvas = forwardRef<ConfettiHandle>(function ConfettiCanvas(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    fire() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles: Particle[] = [];
      for (let i = 0; i < 60; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: -40 - Math.random() * canvas.height * 0.6,
          vy: 2.2 + Math.random() * 3.5,
          swaySpeed: 0.02 + Math.random() * 0.05,
          swayAmount: 1.5 + Math.random() * 2.5,
          phase: Math.random() * Math.PI * 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.12,
          emoji: PARTY_EMOJIS[Math.floor(Math.random() * PARTY_EMOJIS.length)],
          size: 22 + Math.random() * 22,
        });
      }

      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;

        for (const p of particles) {
          if (p.y > canvas.height + 50) continue;
          active = true;

          p.y += p.vy;
          p.phase += p.swaySpeed;
          p.x += Math.sin(p.phase) * p.swayAmount * 0.4;
          p.rotation += p.rotationSpeed;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.font = `${p.size}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.emoji, 0, 0);
          ctx.restore();
        }

        if (active) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };

      animate();
    },
  }));

  return <canvas id="confetti-canvas" ref={canvasRef} />;
});
