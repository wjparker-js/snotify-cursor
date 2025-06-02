import { useEffect, useRef } from 'react';

interface VUMeterProps {
  isPlaying: boolean;
}

export default function VUMeter({ isPlaying }: VUMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bars = 4;
    const barWidth = 2;
    const barGap = 2;
    const maxHeight = 16;
    const minHeight = 4;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';

      for (let i = 0; i < bars; i++) {
        const height = Math.random() * (maxHeight - minHeight) + minHeight;
        const x = i * (barWidth + barGap);
        const y = (canvas.height - height) / 2;
        
        ctx.fillRect(x, y, barWidth, height);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={16}
      height={24}
      className="w-4 h-6"
    />
  );
} 