import React, { useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Resize canvas
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Mouse coordinates tracking
    const mouse = {
      x: null,
      y: null,
      radius: 180 // attraction radius
    };

    // Populate particles
    const particleCount = 85;
    const particles = [];

    // Particle class definition
    class Particle {
      constructor(x, y, isTrail = false) {
        this.x = x !== undefined ? x : Math.random() * canvas.width;
        this.y = y !== undefined ? y : Math.random() * canvas.height;
        this.size = Math.random() * (isTrail ? 3 : 2) + 1; // 1px to 4px
        this.speedX = Math.random() * 0.8 - 0.4;
        this.speedY = Math.random() * 0.8 - 0.4;
        this.isTrail = isTrail;
        this.alpha = 1.0;
        this.decay = Math.random() * 0.03 + 0.02; // trail fading speed
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.isTrail) {
          this.alpha -= this.decay;
        }

        // Bounce on boundary limits
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        // Intercept mouse attraction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            // Pull particles towards mouse
            const pullStrength = this.isTrail ? 0.2 : 0.8;
            this.x += (dx / distance) * force * pullStrength;
            this.y += (dy / distance) * force * pullStrength;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        const baseColor = theme === 'night' ? '139, 92, 246' : '99, 102, 241';
        ctx.fillStyle = `rgba(${baseColor}, ${this.isTrail ? this.alpha * 0.7 : 0.45})`;
        ctx.fill();
      }
    }

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      
      // Spawn trail particles on cursor motion
      if (particles.length < 250) {
        for (let i = 0; i < 2; i++) {
          particles.push(new Particle(e.clientX, e.clientY, true));
        }
      }
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render, update, and sweep dead trail particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        if (p.isTrail && p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
        p.draw();
      }

      // Render lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        const pi = particles[i];
        if (pi.isTrail) continue; // Don't draw web lines from decaying trails

        for (let j = i + 1; j < particles.length; j++) {
          const pj = particles[j];
          if (pj.isTrail) continue;

          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 110) {
            const opacity = ((110 - distance) / 110) * 0.15;
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.strokeStyle = theme === 'night'
              ? `rgba(139, 92, 246, ${opacity})`
              : `rgba(99, 102, 241, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
};
