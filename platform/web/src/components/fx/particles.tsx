"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number; vx: number; vy: number; r: number };

/**
 * Constellation de nœuds reliés, comme un réseau chiffré : les points dérivent lentement, se
 * relient quand ils sont proches et s'accrochent au pointeur. Le calcul s'arrête hors de l'écran
 * et se fige si l'utilisateur réduit les animations.
 */
export function Particles({ className, density = 14000, maxPoints = 80 }: { className?: string; density?: number; maxPoints?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: -9999, y: -9999 };
    let points: Point[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;

    const color = () => (document.documentElement.classList.contains("dark") ? "94, 234, 212" : "13, 148, 136");

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(maxPoints, Math.round((width * height) / density));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
      }));
    };

    const draw = () => {
      const rgb = color();
      context.clearRect(0, 0, width, height);
      for (const point of points) {
        if (!reduced) {
          point.x += point.vx;
          point.y += point.vy;
          if (point.x < 0 || point.x > width) point.vx *= -1;
          if (point.y < 0 || point.y > height) point.vy *= -1;
          const dx = pointer.x - point.x;
          const dy = pointer.y - point.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 160) {
            point.x += dx * 0.004;
            point.y += dy * 0.004;
          }
        }
        context.beginPath();
        context.arc(point.x, point.y, point.r, 0, Math.PI * 2);
        context.fillStyle = `rgba(${rgb}, 0.55)`;
        context.fill();
      }
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i];
          const b = points[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance < 120) {
            context.strokeStyle = `rgba(${rgb}, ${0.22 * (1 - distance / 120)})`;
            context.lineWidth = 0.8;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
          }
        }
        const p = points[i];
        const toPointer = Math.hypot(p.x - pointer.x, p.y - pointer.y);
        if (toPointer < 170) {
          context.strokeStyle = `rgba(${rgb}, ${0.45 * (1 - toPointer / 170)})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(p.x, p.y);
          context.lineTo(pointer.x, pointer.y);
          context.stroke();
        }
      }
    };

    const loop = () => {
      if (visible) draw();
      frame = requestAnimationFrame(loop);
    };

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    intersection.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    if (reduced) draw();
    else frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [density, maxPoints]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
