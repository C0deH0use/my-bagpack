import { forwardRef, useImperativeHandle, useRef } from 'react';

export interface ConfettiHandle {
  fire: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
}

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'];

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
      for (let i = 0; i < 85; i++) {
        particles.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: (Math.random() - 0.5) * 14,
          vy: (Math.random() - 0.7) * 16,
          size: Math.random() * 8 + 4,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          life: 100,
        });
      }

      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;

        for (const p of particles) {
          if (p.life <= 0) continue;
          active = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.3;
          p.life -= 1.5;

          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
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
