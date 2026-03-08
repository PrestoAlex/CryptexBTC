import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
  wobble: number;
}

export default function GoldenRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Налаштування canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Створення частинок
    const createParticles = () => {
      const particles: Particle[] = [];
      const particleCount = 100; // Кількість частинок

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height, // Починають зверху
          speed: Math.random() * 2 + 1, // Швидкість падіння 1-3
          size: Math.random() * 2 + 0.5, // Розмір 0.5-2.5px
          opacity: Math.random() * 0.6 + 0.2, // Прозорість 0.2-0.8
          wobble: Math.random() * Math.PI * 2 // Початкове коливання
        });
      }
      return particles;
    };

    particlesRef.current = createParticles();

    // Анімація
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // Оновлення позиції
        particle.y += particle.speed;
        particle.wobble += 0.01; // Коливання
        particle.x += Math.sin(particle.wobble) * 0.5; // Горизонтальне коливання

        // Скидання частинки, коли вона виходить за межі
        if (particle.y > canvas.height) {
          particle.y = -10;
          particle.x = Math.random() * canvas.width;
        }

        // Малювання частинки
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        
        // Золотий градієнт
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        );
        gradient.addColorStop(0, '#FFD700'); // Чисте золото
        gradient.addColorStop(0.5, '#FFA500'); // Помаранчево-золотий
        gradient.addColorStop(1, '#FF8C42'); // Темніше золото
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Додаткове світіння
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FFD700';
        ctx.fill();
        
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
