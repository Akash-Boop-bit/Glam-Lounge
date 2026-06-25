"use client";

import React, { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  r: number;          // Size radius
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  windOscillation: number;
}

export default function Petals() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Disable animations if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const petalColors = ['#FFE9F0', '#FFD0E0', '#F6A0C0', '#D94F70'];
    const petals: Petal[] = [];
    const maxPetals = 30; // Subtle density

    const createPetal = (isInitial = false): Petal => {
      return {
        x: Math.random() * width,
        y: isInitial ? Math.random() * height : -20,
        r: Math.random() * 8 + 4,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        speedX: Math.random() * 1.0 - 0.3,
        speedY: Math.random() * 1.2 + 0.8,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 1.5 - 0.75,
        windOscillation: Math.random() * 2 * Math.PI,
      };
    };

    // Initialize petals
    for (let i = 0; i < maxPetals; i++) {
      petals.push(createPetal(true));
    }

    const drawPetal = (c: CanvasRenderingContext2D, p: Petal) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate((p.rotation * Math.PI) / 180);
      c.fillStyle = p.color;
      
      // Draw a cherry blossom petal shape using bezier curves
      c.beginPath();
      c.moveTo(0, 0);
      c.bezierCurveTo(-p.r * 1.5, -p.r * 0.5, -p.r * 0.5, -p.r * 2.0, 0, -p.r * 2.2);
      c.bezierCurveTo(p.r * 0.5, -p.r * 2.0, p.r * 1.5, -p.r * 0.5, 0, 0);
      c.fill();
      
      c.restore();
    };

    const update = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.y += p.speedY;
        p.windOscillation += 0.01;
        p.x += p.speedX + Math.sin(p.windOscillation) * 0.4;
        p.rotation += p.rotationSpeed;

        // Reset if goes off boundaries
        if (p.y > height + 20 || p.x < -20 || p.x > width + 20) {
          petals[i] = createPetal(false);
        } else {
          drawPetal(ctx, p);
        }
      }

      animationFrameId = requestAnimationFrame(update);
    };

    update();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-10 opacity-30 select-none"
    />
  );
}
