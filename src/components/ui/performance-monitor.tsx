import React, { useEffect, useState } from 'react';

interface PerformanceStats {
  renderTime: number;
  memoryUsage: number;
  componentCount: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats>({
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let animationFrame: number;
    
    const updateStats = () => {
      const startTime = performance.now();
      
      // Measure memory usage (if available)
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ? 
        Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0;
      
      // Count DOM elements as a proxy for component count
      const componentCount = document.querySelectorAll('[data-testid], [class*="component"]').length;
      
      const renderTime = performance.now() - startTime;
      
      setStats({
        renderTime: Math.round(renderTime * 100) / 100,
        memoryUsage,
        componentCount
      });
      
      animationFrame = requestAnimationFrame(updateStats);
    };
    
    if (isVisible) {
      updateStats();
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible]);

  // Toggle visibility with Ctrl+Shift+P
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold">Performance Monitor</span>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      <div className="space-y-1">
        <div>Render: {stats.renderTime}ms</div>
        <div>Memory: {stats.memoryUsage}MB</div>
        <div>Elements: {stats.componentCount}</div>
        <div className="text-gray-400 text-xs mt-2">
          Press Ctrl+Shift+P to toggle
        </div>
      </div>
    </div>
  );
}; 