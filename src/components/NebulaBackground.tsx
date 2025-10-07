import React, { useRef, useEffect } from 'react';

const NebulaBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    type Star = { x: number; y: number; vx: number; vy: number; radius: number; alpha: number; twinkleSpeed: number; isPulsating: boolean; hue: number; hueShift: number; };
    type ShootingStar = { x: number; y: number; vx: number; vy: number; len: number; };

    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      stars = [];
      for (let i = 0; i < 200; i++) {
        const isPulsating = Math.random() < 0.1;
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: Math.random() * 0.05 - 0.025,
          vy: Math.random() * 0.05 - 0.025,
          radius: Math.random() * 1.2 + 0.5,
          alpha: Math.random() * 0.5 + 0.3,
          twinkleSpeed: Math.random() * 0.015 + 0.005,
          isPulsating,
          hue: Math.random() * 360,
          hueShift: (Math.random() - 0.5) * 0.5,
        });
      }
    };

    const drawBackground = () => {
      const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
      gradient.addColorStop(0, 'rgba(25, 25, 80, 0.9)');
      gradient.addColorStop(1, 'rgba(5, 5, 20, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const animate = () => {
      if(!ctx) return;
      drawBackground();

      
      if (Math.random() < 0.01) { 
        shootingStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.2,
            vx: (Math.random() * 8 + 2),
            vy: (Math.random() * 6 + 2),
            len: Math.random() * 80 + 50,
        });
      }

      
      stars.forEach(star => {
        star.x += star.vx; star.y += star.vy;
        if (star.x < 0 || star.x > canvas.width) star.vx = -star.vx;
        if (star.y < 0 || star.y > canvas.height) star.vy = -star.vy;
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 1) { star.alpha = 1; star.twinkleSpeed *= -1; }
        else if (star.alpha < 0.3) { star.alpha = 0.3; star.twinkleSpeed *= -1; }
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        if (star.isPulsating) {
            star.hue += star.hueShift;
            ctx.fillStyle = `hsla(${star.hue}, 100%, 80%, ${star.alpha})`;
        } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        }
        ctx.fill();
      });

      
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.vx; ss.y += ss.vy;
        if (ss.x > canvas.width + 200 || ss.y > canvas.height + 200) {
            shootingStars.splice(i, 1); continue;
        }
        const tailX = ss.x - ss.len; const tailY = ss.y - ss.len * (ss.vy/ss.vx);
        const gradient = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.beginPath(); ctx.moveTo(ss.x, ss.y); ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath(); ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2); ctx.fillStyle = 'white'; ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />;
};

export default NebulaBackground;